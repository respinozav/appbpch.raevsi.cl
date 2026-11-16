import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import date

from app.db.session import get_db
from app.models.models import Production, Estado, Certificado, User
from app.schemas.schemas import CertificadoCreate, CertificadoOut, ProductionOut
from app.core.security import get_current_user

router = APIRouter(prefix="/certificates", tags=["Certificados"])

@router.get("/liberados")
def list_liberados(
    search: Optional[str] = Query(None, description="Filtrar por lote o artículo"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=10, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Solo lotes que contengan unidades en estado 'Despacho' o 'Liberado'
    estados_validos = db.query(Estado).filter(Estado.nombre.in_(["Despacho", "Liberado"])).all()
    estados_uids = [e.uid for e in estados_validos]
    if not estados_uids:
        return {"items": [], "total": 0, "page": page, "limit": limit, "pages": 1}

    # Agrupar por lote para mostrar los lotes disponibles
    query = db.query(
        Production.lote,
        func.max(Production.fecha).label("fecha"),
        func.max(Production.articulo).label("articulo"),
        func.max(Production.material).label("material"),
        func.max(Production.color_bidon).label("color_bidon"),
        func.max(Production.color_asa).label("color_asa"),
        func.count(Production.uid).label("total_unidades_validas")
    ).filter(Production.uid_estado.in_(estados_uids))

    if search:
        s = search.strip()
        if s.isdigit():
            val = int(s)
            query = query.filter(Production.lote == val)
        else:
            query = query.filter(Production.articulo.ilike(f"%{s}%"))

    query = query.group_by(Production.lote)
    total = query.count()
    items = query.order_by(desc(func.max(Production.fecha)), desc(Production.lote)).offset((page - 1) * limit).limit(limit).all()

    lotes_liberados = []
    for r in items:
        # Obtener las unidades de embalaje de este lote con estado despacho/liberado
        unidades = db.query(Production).filter(
            Production.lote == r.lote,
            Production.uid_estado.in_(estados_uids)
        ).order_by(Production.unidad_embalaje.asc()).all()

        unidades_list = []
        for u in unidades:
            cert = db.query(Certificado).filter(Certificado.production_uid == u.uid).first()
            unidades_list.append({
                "uid": str(u.uid),
                "lote": u.lote,
                "unidad_embalaje": u.unidad_embalaje,
                "fecha": u.fecha.isoformat(),
                "cantidad": u.cantidad,
                "articulo": u.articulo,
                "material": u.material,
                "color_bidon": u.color_bidon,
                "color_asa": u.color_asa,
                "estado_nombre": u.estado.nombre if u.estado else "Liberado",
                "estado_color": u.estado.color if u.estado else "#10B981",
                "certificado_emitido": cert is not None,
                "numero_certificado": cert.numero_certificado if cert else None,
                "certificado_uid": str(cert.uid) if cert else None
            })

        lotes_liberados.append({
            "lote": r.lote,
            "fecha": r.fecha.isoformat() if r.fecha else None,
            "articulo": r.articulo,
            "material": r.material,
            "color_bidon": r.color_bidon,
            "color_asa": r.color_asa,
            "total_unidades": r.total_unidades_validas,
            "unidades": unidades_list
        })

    return {
        "items": lotes_liberados,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }

@router.post("/emit", response_model=CertificadoOut)
def emit_certificate(
    cert_in: CertificadoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prod = db.query(Production).filter(Production.uid == cert_in.production_uid).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Lote de producción no encontrado")

    estados_validos = db.query(Estado).filter(Estado.nombre.in_(["Despacho", "Liberado"])).all()
    estados_uids = [e.uid for e in estados_validos]
    if prod.uid_estado not in estados_uids:
        raise HTTPException(
            status_code=400,
            detail="Solo se pueden emitir certificados para lotes en estado 'Despacho' o 'Liberado'."
        )

    cliente = (cert_in.cliente or "").strip()
    despacho = (cert_in.despacho or "").strip()
    factura = (cert_in.factura or "").strip()
    aprobado_por = (cert_in.aprobado_por or "").strip()
    cargo = (cert_in.cargo or "").strip()

    if not cliente or not despacho or not factura or not aprobado_por or not cargo:
        raise HTTPException(
            status_code=400,
            detail="Todos los campos son obligatorios para emitir o actualizar el certificado: Nombre Cliente, N° Despacho, N° Factura, Responsable de Aprobación y Cargo / Departamento."
        )

    existing = db.query(Certificado).filter(Certificado.production_uid == prod.uid).first()
    if existing:
        existing.cliente = cliente
        existing.despacho = despacho
        existing.factura = factura
        existing.fecha = cert_in.fecha or date.today()
        existing.aprobado_por = aprobado_por
        existing.cargo = cargo
        db.commit()
        db.refresh(existing)
        return CertificadoOut(
            uid=existing.uid,
            numero_certificado=existing.numero_certificado,
            production_uid=existing.production_uid,
            codigo_interno=existing.codigo_interno,
            lote=existing.lote,
            cliente=existing.cliente,
            despacho=existing.despacho,
            factura=existing.factura,
            fecha=existing.fecha,
            aprobado_por=existing.aprobado_por,
            cargo=existing.cargo,
            created_at=existing.created_at,
            production=ProductionOut.model_validate(prod)
        )

    count = db.query(Certificado).count()
    num_cert = f"{count + 1:04d}"

    new_cert = Certificado(
        uid=uuid.uuid4(),
        numero_certificado=num_cert,
        production_uid=prod.uid,
        codigo_interno=prod.codigo_interno,
        lote=prod.lote,
        cliente=cliente,
        despacho=despacho,
        factura=factura,
        fecha=cert_in.fecha or date.today(),
        aprobado_por=aprobado_por,
        cargo=cargo
    )
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)

    return CertificadoOut(
        uid=new_cert.uid,
        numero_certificado=new_cert.numero_certificado,
        production_uid=new_cert.production_uid,
        codigo_interno=new_cert.codigo_interno,
        lote=new_cert.lote,
        cliente=new_cert.cliente,
        despacho=new_cert.despacho,
        factura=new_cert.factura,
        fecha=new_cert.fecha,
        aprobado_por=new_cert.aprobado_por,
        cargo=new_cert.cargo,
        created_at=new_cert.created_at,
        production=ProductionOut.model_validate(prod)
    )

@router.get("/{production_uid}")
def get_certificate_data(
    production_uid: uuid.UUID,
    db: Session = Depends(get_db)
):
    prod = db.query(Production).filter(Production.uid == production_uid).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Lote de producción no encontrado")

    cert = db.query(Certificado).filter(Certificado.production_uid == prod.uid).first()
    num_cert = cert.numero_certificado if cert else "0001"
    cliente = cert.cliente if cert else ""
    despacho = cert.despacho if cert else ""
    factura = cert.factura if cert else ""
    fecha_cert = cert.fecha.isoformat() if cert and cert.fecha else date.today().isoformat()
    aprobado_por = cert.aprobado_por if cert else ""
    cargo = cert.cargo if cert else ""

    return {
        "header": {
            "codigo_documento": "R-CAL-07",
            "version": "00",
            "fecha_documento": fecha_cert,
            "pagina": "1 de 1",
            "titulo": "CERTIFICADO DE ANALISIS",
            "numero_certificado": num_cert
        },
        "declaraciones": {
            "conformidad": f"Certificamos que los lotes señalados obedecen a la Ficha Técnica Nº 0101, correspondiente a {prod.articulo} y cumplen con todas las exigencias establecidas. Las desviaciones se encuentran dentro de las tolerancias permitidas.",
            "inocuidad": "Damos constancia que las materias primas utilizadas son vírgenes y adecuadas para su uso en contacto directo con productos alimenticios o cosméticos. No aptos para microondas o envasado en caliente."
        },
        "item": {
            "numero": 1,
            "articulo": prod.articulo,
            "lote": str(prod.lote),
            "unidad_embalaje": str(prod.unidad_embalaje),
            "material": prod.material,
            "color_bidon": prod.color_bidon,
            "color_asa": prod.color_asa,
            "cantidad_unidad": prod.cantidad,
            "resultado": "APROBADO"
        },
        "condiciones_almacenamiento": {
            "descripcion": "Almacenar en ambiente fresco y seco con temperatura ambiente, libre de polvo, no exponer a luz solar directa o fuentes de calor. Evitar almacenamiento en zonas externas, sin techo o parcialmente techadas. Manipular cuidadosamente los pallet para evitar roturas de embalaje.",
            "duracion": "Bajo estas condiciones los envases pueden durar hasta 18 meses, desde la fecha de fabricación."
        },
        "metadatos_despacho": {
            "cliente": cliente,
            "despacho": despacho,
            "factura": factura,
            "fecha": fecha_cert
        },
        "responsable": {
            "nombre": aprobado_por,
            "cargo": cargo
        },
        "production_uid": str(prod.uid)
    }
