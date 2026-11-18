import uuid
import re
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, String
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from app.db.session import get_db
from app.models.models import Production, Estado, HistorialEstado, User
from app.schemas.schemas import (
    ProductionBatchCreate, ProductionAppendUnitsCreate, LoteItemSummary,
    ProductionOut, ProductionBatchSummary, ProductionBatchStateUpdate,
    EstadoOut, HistorialEstadoOut
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

    # Regla: Se genera UN SOLO lote para la emisión completa
    # Tomamos el último lote creado y creamos uno solo
    max_lote = db.query(func.max(Production.lote)).scalar()
    if max_lote is None or max_lote < 10000:
        lote_num = 10001
    else:
        lote_num = max_lote + 1

    # Default state is 'Producción'
    estado_prod = db.query(Estado).filter(Estado.nombre == "Producción").first()
    if not estado_prod:
        estado_prod = db.query(Estado).first()
    
    estado_uid = estado_prod.uid

    created_productions: List[Production] = []
    now = datetime.now(timezone.utc)

    # Generate N unidades de embalaje dentro del mismo lote (desde 0001 hasta 000N)
    for i in range(1, batch_in.cantidad_lotes + 1):
        unidad_emb = f"{i:04d}"

        prod = Production(
            uid=uuid.uuid4(),
            codigo_interno=next_codigo_interno,
            codigosap=batch_in.codigosap.strip() if batch_in.codigosap else None,
            fecha=now,
            numero_maquina=batch_in.numero_maquina,
            turno=batch_in.turno,
            operador=batch_in.operador,
            operador_nombre=batch_in.operador_nombre.strip() if batch_in.operador_nombre else None,
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
            observaciones=f"Tirada inicial #{next_codigo_interno} (Lote {lote_num} - Emb. {unidad_emb})"
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
            codigosap=p.codigosap,
            fecha=p.fecha,
            numero_maquina=p.numero_maquina,
            turno=p.turno,
            operador=p.operador,
            operador_nombre=p.operador_nombre,
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
        codigosap=first_item.codigosap,
        fecha=now,
        articulo=first_item.articulo,
        material=first_item.material,
        color_bidon=first_item.color_bidon,
        color_asa=first_item.color_asa,
        numero_maquina=first_item.numero_maquina,
        turno=first_item.turno,
        operador=first_item.operador,
        operador_nombre=first_item.operador_nombre,
        cantidad_unitaria=first_item.cantidad,
        total_lotes=len(created_productions),
        lote_inicio=first_item.lote,
        lote_fin=last_item.lote,
        peso=first_item.peso,
        uid_estado=estado_uid,
        estado=EstadoOut.model_validate(estado_prod) if estado_prod else None,
        lotes=lotes_out
    )

@router.get("/lotes-activos", response_model=List[LoteItemSummary])
def get_lotes_activos(
    search: Optional[str] = Query(None, description="Búsqueda por lote, código interno o artículo"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna los lotes existentes agrupados para selección rápida en Combobox de adición de unidades.
    """
    query = db.query(
        Production.lote,
        func.max(Production.codigo_interno).label("codigo_interno"),
        func.max(Production.codigosap).label("codigosap"),
        func.max(Production.fecha).label("fecha"),
        func.max(Production.articulo).label("articulo"),
        func.max(Production.material).label("material"),
        func.max(Production.color_bidon).label("color_bidon"),
        func.max(Production.color_asa).label("color_asa"),
        func.max(Production.numero_maquina).label("numero_maquina"),
        func.max(Production.turno).label("turno"),
        func.max(Production.operador).label("operador"),
        func.max(Production.operador_nombre).label("operador_nombre"),
        func.max(Production.cantidad).label("cantidad_unitaria"),
        func.count(Production.uid).label("total_embalajes"),
        func.min(Production.unidad_embalaje).label("primer_embalaje"),
        func.max(Production.unidad_embalaje).label("ultimo_embalaje"),
        func.max(Production.peso).label("peso"),
        func.max(cast(Production.uid_estado, String)).label("uid_estado")
    )

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (cast(Production.lote, String).ilike(term)) |
            (cast(Production.codigo_interno, String).ilike(term)) |
            (Production.articulo.ilike(term)) |
            (Production.codigosap.ilike(term))
        )

    results = query.group_by(Production.lote).order_by(desc(Production.lote)).limit(limit).all()

    estados = {str(e.uid): e for e in db.query(Estado).all()}

    output: List[LoteItemSummary] = []
    for r in results:
        est = estados.get(str(r.uid_estado)) if r.uid_estado else None
        output.append(LoteItemSummary(
            lote=r.lote,
            codigo_interno=r.codigo_interno,
            codigosap=r.codigosap,
            fecha=r.fecha,
            articulo=r.articulo,
            material=r.material,
            color_bidon=r.color_bidon,
            color_asa=r.color_asa,
            numero_maquina=r.numero_maquina,
            turno=r.turno,
            operador=r.operador,
            operador_nombre=r.operador_nombre,
            cantidad_unitaria=r.cantidad_unitaria,
            total_embalajes=r.total_embalajes,
            primer_embalaje=r.primer_embalaje or "0001",
            ultimo_embalaje=r.ultimo_embalaje or "0001",
            peso=r.peso or "N/A",
            uid_estado=uuid.UUID(r.uid_estado) if r.uid_estado else uuid.uuid4(),
            estado_nombre=est.nombre if est else None,
            estado_color=est.color if est else None
        ))
    return output

@router.post("/batch/append-units", response_model=ProductionBatchSummary, status_code=status.HTTP_201_CREATED)
def append_units_to_batch(
    data_in: ProductionAppendUnitsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Agrega unidades de embalaje a un lote existente de forma estrictamente correlativa.
    Ejemplo: si el lote ya tiene 0001 a 0010, crea desde 0011 en adelante.
    """
    prods = db.query(Production).filter(Production.lote == data_in.lote).all()
    if not prods:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el lote #{data_in.lote} para agregar unidades de embalaje."
        )

    base_prod = prods[0]

    # Calcular la unidad de embalaje numérica máxima actual
    max_emb_num = 0
    for p in prods:
        if p.unidad_embalaje:
            nums = re.findall(r'\d+', str(p.unidad_embalaje))
            if nums:
                try:
                    val = int(nums[-1])
                    if val > max_emb_num:
                        max_emb_num = val
                except ValueError:
                    pass

    # Parámetros operativos
    numero_maquina = data_in.numero_maquina if data_in.numero_maquina is not None else base_prod.numero_maquina
    turno = data_in.turno if data_in.turno is not None else base_prod.turno
    operador = data_in.operador if data_in.operador is not None else base_prod.operador
    operador_nombre = data_in.operador_nombre.strip() if data_in.operador_nombre else base_prod.operador_nombre
    peso = data_in.peso.strip() if data_in.peso and data_in.peso.strip() else base_prod.peso

    estado_uid = base_prod.uid_estado
    estado_prod = db.query(Estado).filter(Estado.uid == estado_uid).first()
    if not estado_prod:
        estado_prod = db.query(Estado).filter(Estado.nombre == "Producción").first()
        if estado_prod:
            estado_uid = estado_prod.uid

    created_productions: List[Production] = []
    now = datetime.now(timezone.utc)

    for i in range(1, data_in.cantidad_lotes + 1):
        emb_int = max_emb_num + i
        unidad_emb = f"{emb_int:04d}"

        new_prod = Production(
            uid=uuid.uuid4(),
            codigo_interno=base_prod.codigo_interno,
            codigosap=base_prod.codigosap,
            fecha=now,
            numero_maquina=numero_maquina,
            turno=turno,
            operador=operador,
            operador_nombre=operador_nombre,
            cantidad=base_prod.cantidad,
            lote=data_in.lote,
            unidad_embalaje=unidad_emb,
            peso=peso,
            articulo=base_prod.articulo,
            material=base_prod.material,
            color_bidon=base_prod.color_bidon,
            color_asa=base_prod.color_asa,
            uid_estado=estado_uid,
            usuario_creador_uid=current_user.uid
        )
        db.add(new_prod)
        db.flush()

        audit = HistorialEstado(
            uid=uuid.uuid4(),
            production_uid=new_prod.uid,
            estado_anterior_uid=None,
            estado_nuevo_uid=estado_uid,
            usuario_uid=current_user.uid,
            fecha_hora=now,
            observaciones=f"Adición de embalaje a Tirada #{base_prod.codigo_interno} (Lote {data_in.lote} - Emb. {unidad_emb})"
        )
        db.add(audit)
        created_productions.append(new_prod)

    db.commit()

    lotes_out: List[ProductionOut] = []
    for p in created_productions:
        db.refresh(p)
        qr_url = f"{settings.PUBLIC_DOMAIN}/trazabilidad/{p.uid}"
        p_out = ProductionOut(
            uid=p.uid,
            codigo_interno=p.codigo_interno,
            codigosap=p.codigosap,
            fecha=p.fecha,
            numero_maquina=p.numero_maquina,
            turno=p.turno,
            operador=p.operador,
            operador_nombre=p.operador_nombre,
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
        codigo_interno=base_prod.codigo_interno,
        codigosap=first_item.codigosap,
        fecha=now,
        articulo=first_item.articulo,
        material=first_item.material,
        color_bidon=first_item.color_bidon,
        color_asa=first_item.color_asa,
        numero_maquina=first_item.numero_maquina,
        turno=first_item.turno,
        operador=first_item.operador,
        operador_nombre=first_item.operador_nombre,
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
    search: Optional[str] = Query(None, description="Buscar por lote, código interno o artículo"),
    fecha_desde: Optional[str] = Query(None, description="Fecha desde (YYYY-MM-DD)"),
    fecha_hasta: Optional[str] = Query(None, description="Fecha hasta (YYYY-MM-DD)"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=10, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Si estado_uid es None o 'all', no se aplica filtro
    estado_filter_uuid = None
    if estado_uid and estado_uid.lower() not in ("all", "null", "undefined", ""):
        try:
            estado_filter_uuid = uuid.UUID(estado_uid)
        except ValueError:
            pass

    # Agrupado por LOTE (un lote por tirada con unidades de embalaje)
    query = db.query(
        Production.lote,
        func.max(Production.codigo_interno).label("codigo_interno"),
        func.max(Production.fecha).label("fecha"),
        func.max(Production.articulo).label("articulo"),
        func.max(Production.material).label("material"),
        func.max(Production.color_bidon).label("color_bidon"),
        func.max(Production.color_asa).label("color_asa"),
        func.max(Production.numero_maquina).label("numero_maquina"),
        func.max(Production.turno).label("turno"),
        func.max(Production.operador).label("operador"),
        func.max(Production.cantidad).label("cantidad_unitaria"),
        func.count(Production.uid).label("total_unidades"),
        func.min(Production.unidad_embalaje).label("embalaje_inicio"),
        func.max(Production.unidad_embalaje).label("embalaje_fin"),
        func.max(Production.peso).label("peso"),
        func.max(cast(Production.uid_estado, String)).label("uid_estado")
    )

    if estado_filter_uuid:
        query = query.filter(Production.uid_estado == estado_filter_uuid)

    if fecha_desde and fecha_desde.strip():
        try:
            parts = [int(p) for p in fecha_desde.strip().split("-")]
            if len(parts) == 3:
                # Restar 1 día para cubrir discrepancias de zona horaria (ej: Santiago UTC-3 vs UTC)
                d_desde = datetime(parts[0], parts[1], parts[2], 0, 0, 0, tzinfo=timezone.utc) - timedelta(days=1)
                query = query.filter(Production.fecha >= d_desde)
        except Exception:
            pass

    if fecha_hasta and fecha_hasta.strip():
        try:
            parts = [int(p) for p in fecha_hasta.strip().split("-")]
            if len(parts) == 3:
                # Sumar 1 día para cubrir zona horaria de producción UTC
                d_hasta = datetime(parts[0], parts[1], parts[2], 23, 59, 59, 999999, tzinfo=timezone.utc) + timedelta(days=1)
                query = query.filter(Production.fecha <= d_hasta)
        except Exception:
            pass

    if search:
        search_term = f"%{search.strip()}%"
        if search.strip().isdigit():
            val = int(search.strip())
            query = query.filter(
                (Production.lote == val) | (Production.codigo_interno == val)
            )
        else:
            query = query.filter(Production.articulo.ilike(search_term))

    query = query.group_by(Production.lote)
    total_count = query.count()

    # Ordenar estrictamente descendente: el último lote creado aparece primero
    results = query.order_by(desc(Production.lote)).offset((page - 1) * limit).limit(limit).all()

    batches_data = []
    for r in results:
        est_uid = uuid.UUID(r.uid_estado) if r.uid_estado else None
        est = db.query(Estado).filter(Estado.uid == est_uid).first() if est_uid else None
        batches_data.append({
            "lote": r.lote,
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
            "total_unidades": r.total_unidades,
            "total_lotes": r.total_unidades,
            "lote_inicio": r.lote,
            "lote_fin": r.lote,
            "embalaje_inicio": r.embalaje_inicio,
            "embalaje_fin": r.embalaje_fin,
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

@router.get("/lotes/{lote_id}")
@router.get("/batches/{codigo_interno}")
def get_lote_details_and_units(
    codigo_interno: Optional[int] = None,
    lote_id: Optional[int] = None,
    estado_uid: Optional[str] = Query(None, description="Filtro opcional por estado en sábana"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_lote = lote_id or codigo_interno
    query_lots = db.query(Production)
    if lote_id:
        query_lots = query_lots.filter(Production.lote == lote_id)
    else:
        query_lots = query_lots.filter((Production.lote == target_lote) | (Production.codigo_interno == target_lote))

    if estado_uid and estado_uid.lower() not in ("all", "null", "undefined", ""):
        try:
            e_uuid = uuid.UUID(estado_uid)
            query_lots = query_lots.filter(Production.uid_estado == e_uuid)
        except ValueError:
            pass

    productions = query_lots.order_by(Production.unidad_embalaje.asc(), Production.lote.asc()).all()
    if not productions:
        all_prods = db.query(Production).filter((Production.lote == target_lote) | (Production.codigo_interno == target_lote)).all()
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

    first = productions[0] if productions else None

    return {
        "lote": first.lote if first else target_lote,
        "codigo_interno": first.codigo_interno if first else target_lote,
        "fecha": first.fecha.isoformat() if first else None,
        "articulo": first.articulo if first else "",
        "material": first.material if first else "",
        "color_bidon": first.color_bidon if first else "",
        "color_asa": first.color_asa if first else "",
        "numero_maquina": first.numero_maquina if first else 0,
        "turno": first.turno if first else 0,
        "operador": first.operador if first else 0,
        "cantidad_unitaria": first.cantidad if first else 0,
        "total_unidades": len(productions),
        "total_lotes": len(productions),
        "lote_inicio": first.lote if first else target_lote,
        "lote_fin": first.lote if first else target_lote,
        "peso": first.peso if first else "N/A",
        "uid_estado": str(first.uid_estado) if first else None,
        "estado": {
            "uid": str(first.estado.uid),
            "nombre": first.estado.nombre,
            "color": first.estado.color
        } if first and first.estado else None,
        "lotes": lotes_out,
        "unidades": lotes_out
    }

@router.patch("/lote/{lote_id}/state")
@router.patch("/batch/{codigo_interno}/state")
def update_lote_state(
    codigo_interno: Optional[int] = None,
    lote_id: Optional[int] = None,
    state_in: ProductionBatchStateUpdate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target = lote_id or codigo_interno
    nuevo_estado = db.query(Estado).filter(Estado.uid == state_in.nuevo_estado_uid).first()
    if not nuevo_estado:
        raise HTTPException(status_code=400, detail="Estado seleccionado no es válido")

    if lote_id:
        prods = db.query(Production).filter(Production.lote == lote_id).all()
    else:
        prods = db.query(Production).filter((Production.lote == target) | (Production.codigo_interno == target)).all()

    if not prods:
        raise HTTPException(status_code=404, detail="Lote de producción no encontrado")

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
            observaciones=state_in.observaciones or f"Cambio de estado masivo a {nuevo_estado.nombre} (Lote {p.lote})"
        )
        db.add(audit)

    db.commit()
    return {"message": f"Se actualizaron {len(prods)} unidades de embalaje al estado '{nuevo_estado.nombre}'."}

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

@router.get("/export/csv")
def export_production_csv(
    fecha_desde: Optional[str] = Query(None),
    fecha_hasta: Optional[str] = Query(None),
    material_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from fastapi.responses import Response

    query = db.query(Production).order_by(desc(Production.fecha), desc(Production.codigo_interno), desc(Production.lote))

    if fecha_desde and fecha_desde.strip():
        try:
            parts = [int(p) for p in fecha_desde.strip().split("-")]
            if len(parts) == 3:
                # Restar 1 día para cubrir discrepancias de zona horaria (ej: Santiago UTC-3 vs UTC)
                d_desde = datetime(parts[0], parts[1], parts[2], 0, 0, 0, tzinfo=timezone.utc) - timedelta(days=1)
                query = query.filter(Production.fecha >= d_desde)
        except Exception:
            pass

    if fecha_hasta and fecha_hasta.strip():
        try:
            parts = [int(p) for p in fecha_hasta.strip().split("-")]
            if len(parts) == 3:
                # Sumar 1 día para cubrir zona horaria de producción UTC
                d_hasta = datetime(parts[0], parts[1], parts[2], 23, 59, 59, 999999, tzinfo=timezone.utc) + timedelta(days=1)
                query = query.filter(Production.fecha <= d_hasta)
        except Exception:
            pass

    if material_filter and material_filter.lower() not in ("all", "null", "undefined", ""):
        query = query.filter(Production.material.ilike(f"%{material_filter.strip()}%"))

    prods = query.all()

    # Pre-cargar mapa de nombres de estado
    estados = {e.uid: e.nombre for e in db.query(Estado).all()}

    lines = [
        "Código Tirada;Fecha;Lote;Artículo;Material;Color Bidón;Color Asa;Máquina;Turno;Operador;Cantidad Unitaria;Unidad Embalaje;Peso;Estado Trazabilidad"
    ]

    for p in prods:
        f_str = p.fecha.strftime("%d/%m/%Y %H:%M") if p.fecha else "N/A"
        nom_estado = estados.get(p.uid_estado, "Producción")
        art = (p.articulo or "").replace(";", " ")
        mat = (p.material or "").replace(";", " ")
        cb = (p.color_bidon or "").replace(";", " ")
        ca = (p.color_asa or "").replace(";", " ")
        emb = (p.unidad_embalaje or "").replace(";", " ")
        peso = (p.peso or "").replace(";", " ")

        lines.append(
            f"{p.codigo_interno};{f_str};{p.lote};\"{art}\";\"{mat}\";\"{cb}\";\"{ca}\";{p.numero_maquina};{p.turno};{p.operador};{p.cantidad};\"{emb}\";\"{peso}\";\"{nom_estado}\""
        )

    csv_data = "\ufeff" + "\r\n".join(lines)
    filename = f"reporte_produccion_bioplast_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"

    return Response(
        content=csv_data.encode("utf-8-sig"),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

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
