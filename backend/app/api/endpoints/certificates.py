import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import date

from app.db.session import get_db
from app.models.models import Production, Estado, Certificado, User
from app.schemas.schemas import CertificadoCreate, CertificadoOut, ProductionOut
from app.core.security import get_current_user

router = APIRouter(prefix="/certificates", tags=["Certificados"])

@router.get("/liberados")
def list_liberados(
    search: Optional[str] = Query(None, description="Filtrar por código interno o lote"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=10, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    estado_liberado = db.query(Estado).filter(Estado.nombre == "Liberado").first()
    if not estado_liberado:
        return {"items": [], "total": 0, "page": page, "limit": limit, "pages": 1}

    query = db.query(Production).filter(Production.uid_estado == estado_liberado.uid)

    if search:
        s = search.strip()
        if s.isdigit():
            val = int(s)
            query = query.filter((Production.codigo_interno == val) | (Production.lote == val))
        else:
            query = query.filter(Production.articulo.ilike(f"%{s}%"))

    total = query.count()
    items = query.order_by(desc(Production.fecha), desc(Production.codigo_interno)).offset((page - 1) * limit).limit(limit).all()

    liberados_data = []
    for p in items:
        cert = db.query(Certificado).filter(Certificado.production_uid == p.uid).first()
        liberados_data.append({
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
            "certificado_emitido": cert is not None,
            "numero_certificado": cert.numero_certificado if cert else None,
            "certificado_uid": str(cert.uid) if cert else None
        })

    return {
        "items": liberados_data,
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

    estado_liberado = db.query(Estado).filter(Estado.nombre == "Liberado").first()
    if not estado_liberado or prod.uid_estado != estado_liberado.uid:
        raise HTTPException(
            status_code=400,
            detail="Solo se pueden emitir certificados para lotes en estado 'Liberado'."
        )

    existing = db.query(Certificado).filter(Certificado.production_uid == prod.uid).first()
    if existing:
        existing.cliente = cert_in.cliente.strip()
        existing.despacho = cert_in.despacho.strip()
        existing.factura = cert_in.factura.strip() if cert_in.factura else ""
        existing.fecha = cert_in.fecha or date.today()
        existing.aprobado_por = cert_in.aprobado_por.strip()
        existing.cargo = cert_in.cargo.strip()
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
        cliente=cert_in.cliente.strip() or "ALIASE",
        despacho=cert_in.despacho.strip() or "336",
        factura=cert_in.factura.strip() if cert_in.factura else "",
        fecha=cert_in.fecha or date.today(),
        aprobado_por=cert_in.aprobado_por.strip() or "Susana Avila C.",
        cargo=cert_in.cargo.strip() or "DEPTO. CONTROL DE CALIDAD"
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
    cliente = cert.cliente if cert else "ALIASE"
    despacho = cert.despacho if cert else "336"
    factura = cert.factura if cert else ""
    fecha_cert = cert.fecha.isoformat() if cert and cert.fecha else date.today().isoformat()
    aprobado_por = cert.aprobado_por if cert else "Susana Avila C."
    cargo = cert.cargo if cert else "DEPTO. CONTROL DE CALIDAD"

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
            "codigo_interno": str(prod.codigo_interno),
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
