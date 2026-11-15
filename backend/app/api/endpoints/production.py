import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, String
from typing import List, Optional
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.models import Production, Estado, HistorialEstado, User
from app.schemas.schemas import (
    ProductionBatchCreate, ProductionOut, ProductionBatchSummary,
    ProductionBatchStateUpdate, EstadoOut, HistorialEstadoOut
)
from app.core.security import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/production", tags=["Producción"])

@router.get("/estados", response_model=List[EstadoOut])
def get_estados(db: Session = Depends(get_db)):
    estados = db.query(Estado).all()
    flow_order = {
        "Producción": 1,
        "Almacenaje": 2,
        "Despacho": 3,
        "Liberado": 4,
        "Retenido": 5
    }
    return sorted(estados, key=lambda e: flow_order.get(e.nombre, 99))

@router.get("/stats")
def get_production_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    estados = db.query(Estado).all()
    stats_by_state = {}
    for est in estados:
        count = db.query(Production).filter(Production.uid_estado == est.uid).count()
        stats_by_state[est.nombre] = {
            "uid": str(est.uid),
            "nombre": est.nombre,
            "count": count,
            "color": est.color
        }

    total_lots = db.query(Production).count()
    distinct_batches = db.query(func.count(func.distinct(Production.codigo_interno))).scalar() or 0
    active_machines = db.query(func.count(func.distinct(Production.numero_maquina))).scalar() or 0

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_lots = db.query(Production).filter(Production.fecha >= today_start).count()

    return {
        "total_lots": total_lots,
        "distinct_batches": distinct_batches,
        "active_machines": active_machines,
        "today_lots": today_lots,
        "by_state": stats_by_state
    }

@router.post("/batch", response_model=ProductionBatchSummary, status_code=status.HTTP_201_CREATED)
def create_production_batch(
    batch_in: ProductionBatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Correlativo codigo_interno starts at 110000000
    max_ci = db.query(func.max(Production.codigo_interno)).scalar()
    if max_ci is None or max_ci < 110000000:
        next_codigo_interno = 110000000
    else:
        next_codigo_interno = max_ci + 1

    # Correlativo lotes starts at 10000
    max_lote = db.query(func.max(Production.lote)).scalar()
    if max_lote is None or max_lote < 10000:
        base_lote = 10000
    else:
        base_lote = max_lote

    # Default state is 'Producción'
    estado_prod = db.query(Estado).filter(Estado.nombre == "Producción").first()
    if not estado_prod:
        estado_prod = db.query(Estado).first()
    
    estado_uid = estado_prod.uid

    created_productions: List[Production] = []
    now = datetime.now(timezone.utc)

    # Generate N lots
    for i in range(1, batch_in.cantidad_lotes + 1):
        lote_num = base_lote + i
        unidad_emb = f"{i:04d}"

        prod = Production(
            uid=uuid.uuid4(),
            codigo_interno=next_codigo_interno,
            fecha=now,
            numero_maquina=batch_in.numero_maquina,
            turno=batch_in.turno,
            operador=batch_in.operador,
            cantidad=batch_in.cantidad,
            lote=lote_num,
            unidad_embalaje=unidad_emb,
            peso=batch_in.peso.strip() if batch_in.peso else "N/A",
            articulo=batch_in.articulo.strip().upper(),
            material=batch_in.material.strip().upper(),
            color_bidon=batch_in.color_bidon.strip().upper(),
            color_asa=batch_in.color_asa.strip().upper(),
            uid_estado=estado_uid,
            usuario_creador_uid=current_user.uid
        )
        db.add(prod)
        db.flush()

        audit = HistorialEstado(
            uid=uuid.uuid4(),
            production_uid=prod.uid,
            estado_anterior_uid=None,
            estado_nuevo_uid=estado_uid,
            usuario_uid=current_user.uid,
            fecha_hora=now,
            observaciones=f"Tirada inicial de producción #{next_codigo_interno} (Lote {lote_num})"
        )
        db.add(audit)
        created_productions.append(prod)

    db.commit()

    lotes_out: List[ProductionOut] = []
    for p in created_productions:
        db.refresh(p)
        qr_url = f"{settings.PUBLIC_DOMAIN}/trazabilidad/{p.uid}"
        p_out = ProductionOut(
            uid=p.uid,
            codigo_interno=p.codigo_interno,
            fecha=p.fecha,
            numero_maquina=p.numero_maquina,
            turno=p.turno,
            operador=p.operador,
            cantidad=p.cantidad,
            lote=p.lote,
            unidad_embalaje=p.unidad_embalaje,
            peso=p.peso,
            articulo=p.articulo,
            material=p.material,
            color_bidon=p.color_bidon,
            color_asa=p.color_asa,
            uid_estado=p.uid_estado,
            estado=EstadoOut.model_validate(p.estado) if p.estado else None,
            created_at=p.created_at,
            qr_url=qr_url
        )
        lotes_out.append(p_out)

    first_item = created_productions[0]
    last_item = created_productions[-1]

    return ProductionBatchSummary(
        codigo_interno=next_codigo_interno,
        fecha=now,
        articulo=first_item.articulo,
        material=first_item.material,
        color_bidon=first_item.color_bidon,
        color_asa=first_item.color_asa,
        numero_maquina=first_item.numero_maquina,
        turno=first_item.turno,
        operador=first_item.operador,
        cantidad_unitaria=first_item.cantidad,
        total_lotes=len(created_productions),
        lote_inicio=first_item.lote,
        lote_fin=last_item.lote,
        peso=first_item.peso,
        uid_estado=estado_uid,
        estado=EstadoOut.model_validate(estado_prod) if estado_prod else None,
        lotes=lotes_out
    )

@router.get("/batches")
def list_production_batches(
    estado_uid: Optional[str] = Query(None, description="Filtro por UUID de estado"),
    search: Optional[str] = Query(None, description="Buscar por código interno, artículo o lote"),
    fecha_desde: Optional[str] = Query(None, description="Fecha desde (YYYY-MM-DD)"),
    fecha_hasta: Optional[str] = Query(None, description="Fecha hasta (YYYY-MM-DD)"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=10, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Si estado_uid es None o 'all', no se aplica filtro (se muestran todos los estados)
    estado_filter_uuid = None
    if estado_uid and estado_uid.lower() not in ("all", "null", "undefined", ""):
        try:
            estado_filter_uuid = uuid.UUID(estado_uid)
        except ValueError:
            pass

    query = db.query(
        Production.codigo_interno,
        func.max(Production.fecha).label("fecha"),
        func.max(Production.articulo).label("articulo"),
        func.max(Production.material).label("material"),
        func.max(Production.color_bidon).label("color_bidon"),
        func.max(Production.color_asa).label("color_asa"),
        func.max(Production.numero_maquina).label("numero_maquina"),
        func.max(Production.turno).label("turno"),
        func.max(Production.operador).label("operador"),
        func.max(Production.cantidad).label("cantidad_unitaria"),
        func.count(Production.uid).label("total_lotes"),
        func.min(Production.lote).label("lote_inicio"),
        func.max(Production.lote).label("lote_fin"),
        func.max(Production.peso).label("peso"),
        func.max(cast(Production.uid_estado, String)).label("uid_estado")
    )

    if estado_filter_uuid:
        query = query.filter(Production.uid_estado == estado_filter_uuid)

    if fecha_desde and fecha_desde.strip():
        try:
            parts = [int(p) for p in fecha_desde.strip().split("-")]
            if len(parts) == 3:
                d_desde = datetime(parts[0], parts[1], parts[2], 0, 0, 0, tzinfo=timezone.utc)
                query = query.filter(Production.fecha >= d_desde)
        except Exception:
            pass

    if fecha_hasta and fecha_hasta.strip():
        try:
            parts = [int(p) for p in fecha_hasta.strip().split("-")]
            if len(parts) == 3:
                d_hasta = datetime(parts[0], parts[1], parts[2], 23, 59, 59, 999999, tzinfo=timezone.utc)
                query = query.filter(Production.fecha <= d_hasta)
        except Exception:
            pass

    if search:
        search_term = f"%{search.strip()}%"
        if search.strip().isdigit():
            val = int(search.strip())
            query = query.filter(
                (Production.codigo_interno == val) | (Production.lote == val)
            )
        else:
            query = query.filter(Production.articulo.ilike(search_term))

    query = query.group_by(Production.codigo_interno)
    total_count = query.count()

    # Ordenar estrictamente descendente: el último código interno creado aparece primero
    results = query.order_by(desc(Production.codigo_interno)).offset((page - 1) * limit).limit(limit).all()

    batches_data = []
    for r in results:
        est_uid = uuid.UUID(r.uid_estado) if r.uid_estado else None
        est = db.query(Estado).filter(Estado.uid == est_uid).first() if est_uid else None
        batches_data.append({
            "codigo_interno": r.codigo_interno,
            "fecha": r.fecha.isoformat() if r.fecha else None,
            "articulo": r.articulo,
            "material": r.material,
            "color_bidon": r.color_bidon,
            "color_asa": r.color_asa,
            "numero_maquina": r.numero_maquina,
            "turno": r.turno,
            "operador": r.operador,
            "cantidad_unitaria": r.cantidad_unitaria,
            "total_lotes": r.total_lotes,
            "lote_inicio": r.lote_inicio,
            "lote_fin": r.lote_fin,
            "peso": r.peso,
            "uid_estado": str(r.uid_estado),
            "estado": {
                "uid": str(est.uid),
                "nombre": est.nombre,
                "descripcion": est.descripcion,
                "color": est.color
            } if est else None
        })

    return {
        "items": batches_data,
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": (total_count + limit - 1) // limit if limit > 0 else 1
    }

@router.get("/batches/{codigo_interno}")
def get_batch_details_and_lots(
    codigo_interno: int,
    estado_uid: Optional[str] = Query(None, description="Filtro opcional por estado en sábana"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query_lots = db.query(Production).filter(Production.codigo_interno == codigo_interno)
    if estado_uid and estado_uid.lower() not in ("all", "null", "undefined", ""):
        try:
            e_uuid = uuid.UUID(estado_uid)
            query_lots = query_lots.filter(Production.uid_estado == e_uuid)
        except ValueError:
            pass

    productions = query_lots.order_by(Production.lote.asc()).all()
    if not productions:
        # Si no hay lotes con ese estado para este codigo interno, retornar lista vacía o lotes generales
        all_prods = db.query(Production).filter(Production.codigo_interno == codigo_interno).all()
        if not all_prods:
            raise HTTPException(status_code=404, detail="Lote de producción no encontrado")
        productions = []

    lotes_out = []
    for p in productions:
        lotes_out.append({
            "uid": str(p.uid),
            "codigo_interno": p.codigo_interno,
            "fecha": p.fecha.isoformat(),
            "numero_maquina": p.numero_maquina,
            "turno": p.turno,
            "operador": p.operador,
            "cantidad": p.cantidad,
            "lote": p.lote,
            "unidad_embalaje": p.unidad_embalaje,
            "peso": p.peso,
            "articulo": p.articulo,
            "material": p.material,
            "color_bidon": p.color_bidon,
            "color_asa": p.color_asa,
            "uid_estado": str(p.uid_estado),
            "estado": {
                "uid": str(p.estado.uid),
                "nombre": p.estado.nombre,
                "descripcion": p.estado.descripcion,
                "color": p.estado.color
            } if p.estado else None,
            "qr_url": f"{settings.PUBLIC_DOMAIN}/trazabilidad/{p.uid}"
        })

    first = productions[0]
    last = productions[-1]

    return {
        "codigo_interno": codigo_interno,
        "fecha": first.fecha.isoformat(),
        "articulo": first.articulo,
        "material": first.material,
        "color_bidon": first.color_bidon,
        "color_asa": first.color_asa,
        "numero_maquina": first.numero_maquina,
        "turno": first.turno,
        "operador": first.operador,
        "cantidad_unitaria": first.cantidad,
        "total_lotes": len(productions),
        "lote_inicio": first.lote,
        "lote_fin": last.lote,
        "peso": first.peso,
        "uid_estado": str(first.uid_estado),
        "estado": {
            "uid": str(first.estado.uid),
            "nombre": first.estado.nombre,
            "color": first.estado.color
        } if first.estado else None,
        "lotes": lotes_out
    }

@router.patch("/batch/{codigo_interno}/state")
def update_batch_state(
    codigo_interno: int,
    state_in: ProductionBatchStateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    nuevo_estado = db.query(Estado).filter(Estado.uid == state_in.nuevo_estado_uid).first()
    if not nuevo_estado:
        raise HTTPException(status_code=400, detail="Estado seleccionado no es válido")

    prods = db.query(Production).filter(Production.codigo_interno == codigo_interno).all()
    if not prods:
        raise HTTPException(status_code=404, detail="Tirada de producción no encontrada")

    now = datetime.now(timezone.utc)
    for p in prods:
        estado_ant = p.uid_estado
        p.uid_estado = nuevo_estado.uid
        p.updated_at = now

        audit = HistorialEstado(
            uid=uuid.uuid4(),
            production_uid=p.uid,
            estado_anterior_uid=estado_ant,
            estado_nuevo_uid=nuevo_estado.uid,
            usuario_uid=current_user.uid,
            fecha_hora=now,
            observaciones=state_in.observaciones or f"Cambio de estado masivo a {nuevo_estado.nombre}"
        )
        db.add(audit)

    db.commit()
    return {"message": f"Se actualizaron {len(prods)} lotes al estado '{nuevo_estado.nombre}'."}

@router.patch("/{production_uid}/state")
def update_single_lot_state(
    production_uid: uuid.UUID,
    state_in: ProductionBatchStateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    nuevo_estado = db.query(Estado).filter(Estado.uid == state_in.nuevo_estado_uid).first()
    if not nuevo_estado:
        raise HTTPException(status_code=400, detail="Estado seleccionado no es válido")

    prod = db.query(Production).filter(Production.uid == production_uid).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Lote no encontrado")

    estado_actual_nom = prod.estado.nombre if prod.estado else ""
    nuevo_estado_nom = nuevo_estado.nombre

    # Máquina de Estados Estricta (Workflow sin saltos):
    # Producción -> Almacenaje -> Despacho -> (Liberado o Retenido)
    valid_transitions = {
        "Producción": ["Almacenaje", "Retenido"],
        "Almacenaje": ["Despacho", "Retenido"],
        "Despacho": ["Liberado", "Retenido"],
        "Retenido": ["Producción", "Almacenaje", "Despacho", "Liberado"],
        "Liberado": ["Retenido"] # Por auditoría extraordinaria de Calidad
    }

    if estado_actual_nom in valid_transitions:
        allowed = valid_transitions[estado_actual_nom]
        if nuevo_estado_nom not in allowed and nuevo_estado_nom != estado_actual_nom:
            raise HTTPException(
                status_code=400,
                detail=f"Transición no permitida: de '{estado_actual_nom}' solo se puede avanzar a: {', '.join(allowed)}."
            )

    now = datetime.now(timezone.utc)
    estado_ant = prod.uid_estado
    prod.uid_estado = nuevo_estado.uid
    prod.updated_at = now

    audit = HistorialEstado(
        uid=uuid.uuid4(),
        production_uid=prod.uid,
        estado_anterior_uid=estado_ant,
        estado_nuevo_uid=nuevo_estado.uid,
        usuario_uid=current_user.uid,
        fecha_hora=now,
        observaciones=state_in.observaciones or f"Cambio de estado individual a {nuevo_estado.nombre}"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Lote #{prod.lote} actualizado a '{nuevo_estado.nombre}'."}

@router.get("/{production_uid}/historial", response_model=List[HistorialEstadoOut])
def get_lot_historial(
    production_uid: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    history = db.query(HistorialEstado).filter(
        HistorialEstado.production_uid == production_uid
    ).order_by(desc(HistorialEstado.fecha_hora)).all()

    out = []
    for h in history:
        out.append(HistorialEstadoOut(
            uid=h.uid,
            production_uid=h.production_uid,
            estado_anterior=EstadoOut.model_validate(h.estado_anterior) if h.estado_anterior else None,
            estado_nuevo=EstadoOut.model_validate(h.estado_nuevo) if h.estado_nuevo else None,
            usuario_nombre=h.usuario.nombre_completo if h.usuario else "Sistema",
            fecha_hora=h.fecha_hora,
            observaciones=h.observaciones
        ))
    return out
