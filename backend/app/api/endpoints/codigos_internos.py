import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import List, Optional
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.models import SapCodigoInterno, User
from app.schemas.schemas import (
    SapCodigoInternoCreate, SapCodigoInternoUpdate, SapCodigoInternoOut
)
from app.core.security import get_current_user

router = APIRouter(prefix="/codigos-internos", tags=["Códigos Internos SAP"])

@router.get("", response_model=dict)
def list_codigos_internos(
    search: Optional[str] = Query(None, description="Búsqueda por código SAP, código interno o artículo"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=5, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(SapCodigoInterno)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                SapCodigoInterno.codigosap.ilike(term),
                SapCodigoInterno.codigointerno.ilike(term),
                SapCodigoInterno.articulo.ilike(term),
                SapCodigoInterno.materia.ilike(term),
                SapCodigoInterno.color.ilike(term)
            )
        )

    total = query.count()
    items = query.order_by(desc(SapCodigoInterno.created_at)).offset((page - 1) * limit).limit(limit).all()

    return {
        "items": [SapCodigoInternoOut.model_validate(item) for item in items],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }

@router.get("/all", response_model=List[SapCodigoInternoOut])
def get_all_codigos_internos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(SapCodigoInterno).order_by(SapCodigoInterno.articulo.asc()).all()
    return [SapCodigoInternoOut.model_validate(item) for item in items]

@router.get("/{uid}", response_model=SapCodigoInternoOut)
def get_codigo_interno(
    uid: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(SapCodigoInterno).filter(SapCodigoInterno.uid == uid).first()
    if not item:
        raise HTTPException(status_code=404, detail="Código interno no encontrado")
    return SapCodigoInternoOut.model_validate(item)

@router.post("", response_model=SapCodigoInternoOut, status_code=status.HTTP_201_CREATED)
def create_codigo_interno(
    payload: SapCodigoInternoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validar unicidad del codigo SAP
    codigosap = payload.codigosap.strip()
    exist_sap = db.query(SapCodigoInterno).filter(SapCodigoInterno.codigosap == codigosap).first()
    if exist_sap:
        raise HTTPException(status_code=400, detail=f"El código SAP '{codigosap}' ya existe.")

    # El código SAP es el único código interno oficial
    codigointerno = payload.codigointerno.strip() if payload.codigointerno else codigosap

    now = datetime.now(timezone.utc)
    new_item = SapCodigoInterno(
        uid=uuid.uuid4(),
        codigosap=codigosap,
        codigointerno=codigointerno,
        articulo=payload.articulo.strip(),
        materia=payload.materia.strip() if payload.materia else None,
        color=payload.color.strip() if payload.color else None,
        colorasa=payload.colorasa.strip() if payload.colorasa else None,
        cantidad=payload.cantidad or 0,
        created_at=now,
        updated_at=now
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return SapCodigoInternoOut.model_validate(new_item)

@router.put("/{uid}", response_model=SapCodigoInternoOut)
def update_codigo_interno(
    uid: uuid.UUID,
    payload: SapCodigoInternoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(SapCodigoInterno).filter(SapCodigoInterno.uid == uid).first()
    if not item:
        raise HTTPException(status_code=404, detail="Código interno no encontrado")

    if payload.codigosap and payload.codigosap.strip() != item.codigosap:
        exist = db.query(SapCodigoInterno).filter(SapCodigoInterno.codigosap == payload.codigosap.strip()).first()
        if exist:
            raise HTTPException(status_code=400, detail=f"El código SAP '{payload.codigosap}' ya está en uso.")
        item.codigosap = payload.codigosap.strip()
        item.codigointerno = item.codigosap

    if payload.codigointerno is not None:
        item.codigointerno = payload.codigointerno.strip() if payload.codigointerno else item.codigosap

    if payload.articulo is not None:
        item.articulo = payload.articulo.strip()
    if payload.materia is not None:
        item.materia = payload.materia.strip()
    if payload.color is not None:
        item.color = payload.color.strip()
    if payload.colorasa is not None:
        item.colorasa = payload.colorasa.strip()
    if payload.cantidad is not None:
        item.cantidad = payload.cantidad

    item.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return SapCodigoInternoOut.model_validate(item)

@router.delete("/{uid}", status_code=status.HTTP_200_OK)
def delete_codigo_interno(
    uid: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(SapCodigoInterno).filter(SapCodigoInterno.uid == uid).first()
    if not item:
        raise HTTPException(status_code=404, detail="Código interno no encontrado")

    db.delete(item)
    db.commit()
    return {"success": True, "message": "Código interno eliminado correctamente"}
