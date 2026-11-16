import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.db.session import get_db
from app.models.models import Operador, User
from app.schemas.schemas import OperadorCreate, OperadorUpdate, OperadorOut
from app.core.security import get_current_user

router = APIRouter(prefix="/operadores", tags=["Operadores"])

@router.get("", response_model=dict)
def list_operadores(
    search: Optional[str] = Query(None, description="Buscar por nombre o RUT"),
    solo_activos: Optional[bool] = Query(None, description="Filtrar solo activos"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=5, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Operador)

    if solo_activos is not None:
        query = query.filter(Operador.activo == solo_activos)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Operador.nombre.ilike(s)) | (Operador.rut.ilike(s))
        )

    total = query.count()
    items = query.order_by(Operador.activo.desc(), Operador.nombre.asc()).offset((page - 1) * limit).limit(limit).all()

    return {
        "items": [OperadorOut.model_validate(item) for item in items],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }

@router.get("/activos", response_model=List[OperadorOut])
def get_operadores_activos(
    db: Session = Depends(get_db)
):
    """Listado ligero para selectores de formularios sin paginación."""
    operadores = db.query(Operador).filter(Operador.activo == True).order_by(Operador.nombre.asc()).all()
    return [OperadorOut.model_validate(op) for op in operadores]

@router.get("/{uid}", response_model=OperadorOut)
def get_operador(
    uid: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    op = db.query(Operador).filter(Operador.uid == uid).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operador no encontrado")
    return OperadorOut.model_validate(op)

@router.post("", response_model=OperadorOut, status_code=status.HTTP_201_CREATED)
def create_operador(
    op_in: OperadorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    nombre = op_in.nombre.strip()
    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre del operador es obligatorio")

    new_op = Operador(
        uid=uuid.uuid4(),
        nombre=nombre,
        rut=op_in.rut.strip() if op_in.rut else None,
        activo=op_in.activo
    )
    db.add(new_op)
    db.commit()
    db.refresh(new_op)
    return OperadorOut.model_validate(new_op)

@router.put("/{uid}", response_model=OperadorOut)
def update_operador(
    uid: uuid.UUID,
    op_in: OperadorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    op = db.query(Operador).filter(Operador.uid == uid).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operador no encontrado")

    if op_in.nombre is not None:
        nombre = op_in.nombre.strip()
        if not nombre:
            raise HTTPException(status_code=400, detail="El nombre del operador no puede estar vacío")
        op.nombre = nombre

    if op_in.rut is not None:
        op.rut = op_in.rut.strip() if op_in.rut else None

    if op_in.activo is not None:
        op.activo = op_in.activo

    db.commit()
    db.refresh(op)
    return OperadorOut.model_validate(op)

@router.patch("/{uid}/toggle-active", response_model=OperadorOut)
def toggle_active_operador(
    uid: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    op = db.query(Operador).filter(Operador.uid == uid).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operador no encontrado")

    op.activo = not op.activo
    db.commit()
    db.refresh(op)
    return OperadorOut.model_validate(op)

@router.delete("/{uid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_operador(
    uid: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    op = db.query(Operador).filter(Operador.uid == uid).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operador no encontrado")

    db.delete(op)
    db.commit()
    return None
