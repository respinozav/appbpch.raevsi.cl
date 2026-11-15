import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import User, Role, AuditoriaLogin
from app.schemas.schemas import LoginRequest, TokenOut, UserOut, UserProfileUpdate
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/login", response_model=TokenOut)
def login(login_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    email = login_data.correo.strip().lower()
    ip_origen = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "")[:500]

    user = db.query(User).filter(User.correo == email).first()
    if not user:
        # Registrar intento fallido
        audit = AuditoriaLogin(
            uid=uuid.uuid4(),
            correo=email,
            usuario_uid=None,
            exitoso=False,
            ip_origen=ip_origen,
            user_agent=user_agent,
            motivo_fallo="Usuario no encontrado"
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas. Verifique correo y contraseña."
        )

    if not verify_password(login_data.password, user.password_hash):
        audit = AuditoriaLogin(
            uid=uuid.uuid4(),
            correo=email,
            usuario_uid=user.uid,
            exitoso=False,
            ip_origen=ip_origen,
            user_agent=user_agent,
            motivo_fallo="Contraseña incorrecta"
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas. Verifique correo y contraseña."
        )

    if not user.activo:
        audit = AuditoriaLogin(
            uid=uuid.uuid4(),
            correo=email,
            usuario_uid=user.uid,
            exitoso=False,
            ip_origen=ip_origen,
            user_agent=user_agent,
            motivo_fallo="Cuenta desactivada"
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta de usuario se encuentra inactiva. Contacte al Administrador."
        )

    if user.rol and not user.rol.activo:
        audit = AuditoriaLogin(
            uid=uuid.uuid4(),
            correo=email,
            usuario_uid=user.uid,
            exitoso=False,
            ip_origen=ip_origen,
            user_agent=user_agent,
            motivo_fallo="Rol de usuario desactivado"
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El rol asignado a este usuario se encuentra temporalmente inactivo."
        )

    # Registrar login exitoso
    audit = AuditoriaLogin(
        uid=uuid.uuid4(),
        correo=email,
        usuario_uid=user.uid,
        exitoso=True,
        ip_origen=ip_origen,
        user_agent=user_agent,
        motivo_fallo=None
    )
    db.add(audit)
    db.commit()

    access_token = create_access_token(subject=user.uid)
    return TokenOut(access_token=access_token, user=user)

@router.get("/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # User can change name and password, but NOT email
    if profile_data.nombre_completo:
        current_user.nombre_completo = profile_data.nombre_completo.strip()
    
    if profile_data.password:
        if len(profile_data.password) < 6:
            raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")
        if profile_data.current_password:
            if not verify_password(profile_data.current_password, current_user.password_hash):
                raise HTTPException(status_code=400, detail="La contraseña actual no es correcta")
        current_user.password_hash = get_password_hash(profile_data.password)
    
    db.commit()
    db.refresh(current_user)
    return current_user
