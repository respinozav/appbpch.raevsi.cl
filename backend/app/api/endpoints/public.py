import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.models.models import Production, Certificado, HistorialEstado
from app.schemas.schemas import PublicTrazabilidadOut, HistorialEstadoOut, EstadoOut

router = APIRouter(prefix="/public", tags=["Consulta Pública Trazabilidad"])

@router.get("/trazabilidad/{uid}", response_model=PublicTrazabilidadOut)
def get_public_trazabilidad(uid: str, db: Session = Depends(get_db)):
    try:
        parsed_uid = uuid.UUID(uid)
    except ValueError:
        raise HTTPException(
            status_code=404,
            detail="El código de trazabilidad ingresado no tiene un formato válido."
        )

    prod = db.query(Production).filter(Production.uid == parsed_uid).first()
    if not prod:
        raise HTTPException(
            status_code=404,
            detail="El código de trazabilidad no corresponde a ningún lote registrado en Bioplast Chile."
        )

    cert = db.query(Certificado).filter(Certificado.production_uid == prod.uid).first()
    history = db.query(HistorialEstado).filter(
        HistorialEstado.production_uid == prod.uid
    ).order_by(desc(HistorialEstado.fecha_hora)).all()

    hist_out = []
    for h in history:
        hist_out.append(HistorialEstadoOut(
            uid=h.uid,
            production_uid=h.production_uid,
            estado_anterior=EstadoOut.model_validate(h.estado_anterior) if h.estado_anterior else None,
            estado_nuevo=EstadoOut.model_validate(h.estado_nuevo) if h.estado_nuevo else None,
            usuario_nombre=h.usuario.nombre_completo if h.usuario else "Sistema de Planta",
            fecha_hora=h.fecha_hora,
            observaciones=h.observaciones
        ))

    is_liberado = prod.estado and prod.estado.nombre == "Liberado"

    return PublicTrazabilidadOut(
        uid=prod.uid,
        verificado=True,
        codigo_interno=prod.codigo_interno,
        lote=prod.lote,
        unidad_embalaje=prod.unidad_embalaje,
        articulo=prod.articulo,
        material=prod.material,
        color_bidon=prod.color_bidon,
        color_asa=prod.color_asa,
        cantidad=prod.cantidad,
        peso=prod.peso,
        numero_maquina=prod.numero_maquina,
        turno=prod.turno,
        operador=prod.operador,
        fecha_fabricacion=prod.fecha,
        estado_actual=prod.estado.nombre if prod.estado else "Producción",
        estado_color=prod.estado.color if prod.estado else "#15803D",
        certificado_numero=cert.numero_certificado if cert else None,
        aprobado_calidad=is_liberado,
        historial=hist_out
    )
