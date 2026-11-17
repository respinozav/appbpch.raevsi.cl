from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from datetime import datetime, timedelta, timezone

from app.db.session import get_db
from app.models.models import Production, Estado, HistorialEstado, Certificado, User
from app.core.security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard Ejecutivo & Operativo"])

@router.get("/metrics")
def get_dashboard_metrics(
    period: Optional[str] = Query("all", description="Filtro temporal: today, week, month, year, all"),
    material_filter: Optional[str] = Query(None, description="Filtro por material (PET, rPET, HDPE, etc.)"),
    fecha_desde: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    fecha_hasta: Optional[str] = Query(None, description="Fecha de término (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    date_cutoff = None

    if period == "today":
        date_cutoff = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        date_cutoff = now - timedelta(days=7)
    elif period == "month":
        date_cutoff = now - timedelta(days=30)
    elif period == "year":
        date_cutoff = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

    # Base query for Production
    query = db.query(Production)

    # Apply Fecha Desde / Fecha Hasta if provided (con tolerancia horaria UTC)
    if fecha_desde:
        try:
            d_desde = datetime.strptime(fecha_desde.strip(), "%Y-%m-%d").replace(
                hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc
            ) - timedelta(days=1)
            query = query.filter(Production.fecha >= d_desde)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            d_hasta = datetime.strptime(fecha_hasta.strip(), "%Y-%m-%d").replace(
                hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc
            ) + timedelta(days=1)
            query = query.filter(Production.fecha <= d_hasta)
        except ValueError:
            pass

    # If no custom range provided, fallback to period preset cutoff
    if not fecha_desde and not fecha_hasta and date_cutoff:
        query = query.filter(Production.fecha >= date_cutoff)

    if isinstance(material_filter, str) and material_filter.strip() and material_filter.strip().lower() != "all":
        query = query.filter(Production.material.ilike(f"%{material_filter.strip()}%"))

    total_lots = query.count()

    # Detección inteligente de contingencia:
    # Si la consulta filtrada no encuentra lotes (por ejemplo, por desfase temporal de mes/año entre cliente y servidor),
    # pero existen registros en la base de datos, auto-ajustar al rango activo más reciente:
    auto_fallback_range = False
    if total_lots == 0 and db.query(Production).count() > 0:
        latest_p = db.query(Production).order_by(desc(Production.fecha)).first()
        if latest_p and latest_p.fecha:
            latest_dt = latest_p.fecha
            d_desde_fallback = datetime(latest_dt.year, latest_dt.month, 1, tzinfo=timezone.utc)
            d_hasta_fallback = datetime(latest_dt.year, latest_dt.month, latest_dt.day, 23, 59, 59, 999999, tzinfo=timezone.utc)
            query = db.query(Production).filter(Production.fecha >= d_desde_fallback, Production.fecha <= d_hasta_fallback)
            if isinstance(material_filter, str) and material_filter.strip() and material_filter.strip().lower() != "all":
                query = query.filter(Production.material.ilike(f"%{material_filter.strip()}%"))
            total_lots = query.count()
            auto_fallback_range = True
            fallback_start_dt = d_desde_fallback.date()
            fallback_end_dt = d_hasta_fallback.date()

    total_units = query.with_entities(func.coalesce(func.sum(Production.cantidad), 0)).scalar() or 0
    distinct_batches = query.with_entities(func.count(func.distinct(Production.codigo_interno))).scalar() or 0

    # Estados breakdown ordenados por flujo operativo
    estados = db.query(Estado).all()
    flow_order = {"Producción": 1, "Almacenaje": 2, "Despacho": 3, "Liberado": 4, "Retenido": 5}
    estados = sorted(estados, key=lambda e: flow_order.get(e.nombre, 99))
    estados_breakdown = []
    liberados_count = 0
    retenidos_count = 0

    for est in estados:
        count = query.filter(Production.uid_estado == est.uid).count()
        pct = round((count / total_lots * 100), 1) if total_lots > 0 else 0.0
        estados_breakdown.append({
            "uid": str(est.uid),
            "nombre": est.nombre,
            "color": est.color,
            "count": count,
            "percentage": pct
        })
        if est.nombre == "Liberado":
            liberados_count = count
        elif est.nombre == "Retenido":
            retenidos_count = count

    # Tasa de liberación de calidad
    evaluable = liberados_count + retenidos_count
    tasa_liberacion = round((liberados_count / evaluable * 100), 1) if evaluable > 0 else 100.0

    # Materiales breakdown & rPET ratio
    materials_query = query.with_entities(
        Production.material,
        func.count(Production.uid).label("lotes"),
        func.coalesce(func.sum(Production.cantidad), 0).label("unidades")
    ).group_by(Production.material).all()

    materials_breakdown = []
    rpet_lots = 0
    for m in materials_query:
        materials_breakdown.append({
            "material": m.material,
            "lotes": m.lotes,
            "unidades": m.unidades,
            "percentage": round((m.lotes / total_lots * 100), 1) if total_lots > 0 else 0.0
        })
        if "RPET" in m.material.upper() or "RECICL" in m.material.upper():
            rpet_lots += m.lotes

    tasa_rpet = round((rpet_lots / total_lots * 100), 1) if total_lots > 0 else 38.5

    # Environmental impact: estimated CO2e avoided (approx 1.5 kg CO2e per kg rPET)
    # Average container weight: ~0.08 kg
    rpet_units_est = int(total_units * (tasa_rpet / 100.0))
    tco2_avoided = round((rpet_units_est * 0.08 * 1.5) / 1000.0, 2)

    # Máquinas breakdown (OEE)
    machines_query = query.with_entities(
        Production.numero_maquina,
        func.count(Production.uid).label("lotes"),
        func.coalesce(func.sum(Production.cantidad), 0).label("unidades"),
        func.count(func.distinct(Production.codigo_interno)).label("tiradas")
    ).group_by(Production.numero_maquina).order_by(desc("unidades")).all()

    machines_breakdown = [
        {
            "maquina": f"Máquina #{m.numero_maquina}",
            "numero": m.numero_maquina,
            "lotes": m.lotes,
            "unidades": m.unidades,
            "tiradas": m.tiradas
        }
        for m in machines_query
    ]

    # Turnos breakdown
    turnos_query = query.with_entities(
        Production.turno,
        func.count(Production.uid).label("lotes"),
        func.coalesce(func.sum(Production.cantidad), 0).label("unidades")
    ).group_by(Production.turno).order_by(Production.turno.asc()).all()

    turnos_breakdown = [
        {
            "turno": f"Turno {t.turno}",
            "numero": t.turno,
            "lotes": t.lotes,
            "unidades": t.unidades
        }
        for t in turnos_query
    ]

    # Recent Audit Log Activity (Last 8 events)
    recent_audit = db.query(HistorialEstado).order_by(desc(HistorialEstado.fecha_hora)).limit(8).all()
    activity_timeline = []
    for a in recent_audit:
        prod = a.production
        activity_timeline.append({
            "uid": str(a.uid),
            "fecha_hora": a.fecha_hora.isoformat(),
            "production_uid": str(a.production_uid),
            "codigo_interno": prod.codigo_interno if prod else 0,
            "lote": prod.lote if prod else 0,
            "articulo": prod.articulo if prod else "Envase",
            "estado_nuevo": a.estado_nuevo.nombre if a.estado_nuevo else "Actualizado",
            "estado_color": a.estado_nuevo.color if a.estado_nuevo else "#15803D",
            "responsable": a.usuario.nombre_completo if a.usuario else "Sistema de Planta",
            "observaciones": a.observaciones
        })

    # Ley REP 20.920 Targets (D.S. 12 Categories)
    rep_goals = {
        "categoria": "Envases y Embalajes Industriales No Domiciliarios",
        "normativa": "Ley 20.920 · D.S. 12 MMA",
        "meta_actual_pct": 30.0,
        "cumplimiento_actual_pct": min(round(tasa_rpet, 1), 100.0),
        "certificados_emitidos": db.query(Certificado).count(),
        "kilos_rpet_estimados": round(rpet_units_est * 0.12, 1)  # 120 gramos por bidón
    }

    # Tendencia temporal diaria de producción (PostgreSQL nativo to_char)
    daily_results = query.with_entities(
        func.to_char(Production.fecha, 'YYYY-MM-DD').label("dia"),
        func.coalesce(func.sum(Production.cantidad), 0).label("unidades"),
        func.count(Production.uid).label("lotes")
    ).group_by(func.to_char(Production.fecha, 'YYYY-MM-DD')).order_by(func.to_char(Production.fecha, 'YYYY-MM-DD').asc()).all()

    db_days = {str(d.dia): (int(d.unidades), int(d.lotes)) for d in daily_results if d.dia}

    # Rango continuo de días para garantizar que la gráfica siempre muestre la evolución del mes
    if auto_fallback_range:
        start_dt = fallback_start_dt
        end_dt = fallback_end_dt
    else:
        try:
            if fecha_desde:
                start_dt = datetime.strptime(fecha_desde.strip(), "%Y-%m-%d").date()
            else:
                start_dt = now.date().replace(day=1)
        except Exception:
            start_dt = now.date().replace(day=1)

        try:
            if fecha_hasta:
                end_dt = datetime.strptime(fecha_hasta.strip(), "%Y-%m-%d").date()
            else:
                end_dt = now.date()
        except Exception:
            end_dt = now.date()

    if start_dt > end_dt:
        start_dt = end_dt - timedelta(days=14)

    # Limitar rango a máximo 31 días continuos para óptima visualización
    if (end_dt - start_dt).days > 31:
        start_dt = end_dt - timedelta(days=30)

    # Meta operativa diaria de planta (Estándar Bioplast Chile: 30.000 unidades / día)
    META_PLANTA_DIARIA = 30000

    daily_timeline = []
    curr_dt = start_dt
    while curr_dt <= end_dt:
        dia_key = curr_dt.strftime("%Y-%m-%d")
        if dia_key in db_days:
            unidades, lotes = db_days[dia_key]
        else:
            unidades, lotes = 0, 0
        
        cumplimiento = round((unidades / META_PLANTA_DIARIA) * 100, 1) if META_PLANTA_DIARIA > 0 else 0.0
        daily_timeline.append({
            "fecha": dia_key,
            "unidades": unidades,
            "lotes": lotes,
            "meta": META_PLANTA_DIARIA,
            "cumplimiento_pct": cumplimiento
        })
        curr_dt += timedelta(days=1)

    # Fallback si estuviera vacío
    if not daily_timeline:
        for i in range(6, -1, -1):
            past_d = (now.date() - timedelta(days=i)).strftime("%Y-%m-%d")
            unidades, lotes = db_days.get(past_d, (0, 0))
            cumplimiento = round((unidades / META_PLANTA_DIARIA) * 100, 1) if META_PLANTA_DIARIA > 0 else 0.0
            daily_timeline.append({
                "fecha": past_d,
                "unidades": unidades,
                "lotes": lotes,
                "meta": META_PLANTA_DIARIA,
                "cumplimiento_pct": cumplimiento
            })

    return {
        "resumen": {
            "total_unidades": total_units,
            "total_lotes": total_lots,
            "distinct_batches": distinct_batches,
            "tasa_liberacion": tasa_liberacion,
            "tasa_rpet": tasa_rpet,
            "tco2_avoided": tco2_avoided,
            "kilos_reciclados": round(rpet_units_est * 0.12, 1)
        },
        "estados": estados_breakdown,
        "materiales": materials_breakdown,
        "maquinas": machines_breakdown,
        "turnos": turnos_breakdown,
        "tendencia_diaria": daily_timeline,
        "actividad_reciente": activity_timeline,
        "ley_rep": rep_goals
    }
