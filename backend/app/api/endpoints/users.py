import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.models import User, Role
from app.schemas.schemas import UserCreate, UserUpdate, UserOut, RoleOut
from app.core.security import get_password_hash, require_admin

router = APIRouter(prefix="/users", tags=["Usuarios"])

@router.get("/roles", response_model=List[RoleOut])
def get_roles(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(Role).order_by(Role.created_at.asc()).all()

@router.get("", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(User).order_by(User.created_at.asc()).all()

@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    email = user_in.correo.strip().lower()
    existing = db.query(User).filter(User.correo == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario registrado con este correo electrónico."
        )
    
    role = db.query(Role).filter(Role.uid == user_in.rol_uid).first()
    if not role:
        raise HTTPException(status_code=400, detail="El rol seleccionado no es válido.")

    new_user = User(
        nombre_completo=user_in.nombre_completo.strip(),
        correo=email,
        password_hash=get_password_hash(user_in.password),
        rol_uid=user_in.rol_uid,
        activo=user_in.activo
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    user = db.query(User).filter(User.uid == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: uuid.UUID,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    user = db.query(User).filter(User.uid == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user_in.nombre_completo is not None:
        user.nombre_completo = user_in.nombre_completo.strip()
    if user_in.rol_uid is not None:
        role = db.query(Role).filter(Role.uid == user_in.rol_uid).first()
        if not role:
            raise HTTPException(status_code=400, detail="Rol inválido")
        user.rol_uid = user_in.rol_uid
    if user_in.activo is not None:
        user.activo = user_in.activo
    if user_in.password:
        if len(user_in.password) < 6:
            raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")
        user.password_hash = get_password_hash(user_in.password)

    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    if user_id == admin.uid:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta de administrador.")
    
    user = db.query(User).filter(User.uid == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user.activo = False
    db.commit()
    return {"message": f"Usuario {user.nombre_completo} desactivado con éxito."}
