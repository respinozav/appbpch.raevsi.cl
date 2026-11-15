from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import User, Role
from app.schemas.schemas import LoginRequest, TokenOut, UserOut, UserProfileUpdate
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/login", response_model=TokenOut)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    email = login_data.correo.strip().lower()
    user = db.query(User).filter(User.correo == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas. Verifique correo y contraseña."
        )
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas. Verifique correo y contraseña."
        )
    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta de usuario se encuentra inactiva. Contacte al Administrador."
        )
    
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
