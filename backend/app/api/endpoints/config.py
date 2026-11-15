import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.models import ConfiguracionSistema, User
from app.schemas.schemas import SessionConfigIn, SessionConfigOut
from app.core.security import get_current_user, require_admin

router = APIRouter(prefix="/config", tags=["Configuración"])

CONFIG_KEY_SESSION_TIMEOUT = "session_inactivity_timeout_minutes"
DEFAULT_SESSION_TIMEOUT = 30

@router.get("/session", response_model=SessionConfigOut)
def get_session_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna la configuración actual del tiempo de inactividad de sesión (en minutos).
    """
    timeout_val = DEFAULT_SESSION_TIMEOUT
    updated_at = None
    user_name = None

    try:
        conf = db.query(ConfiguracionSistema).filter(
            ConfiguracionSistema.clave == CONFIG_KEY_SESSION_TIMEOUT
        ).first()

        if conf:
            try:
                timeout_val = int(conf.valor)
            except (ValueError, TypeError):
                timeout_val = DEFAULT_SESSION_TIMEOUT
            updated_at = conf.updated_at
            if conf.usuario_actualizador:
                user_name = conf.usuario_actualizador.nombre_completo
    except Exception as e:
        print(f"Aviso al consultar ConfiguracionSistema: {e}")
        timeout_val = DEFAULT_SESSION_TIMEOUT

    return SessionConfigOut(
        timeout_minutes=timeout_val,
        clave=CONFIG_KEY_SESSION_TIMEOUT,
        updated_at=updated_at,
        usuario_actualizador=user_name
    )

@router.put("/session", response_model=SessionConfigOut)
def update_session_config(
    config_in: SessionConfigIn,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Actualiza el tiempo de inactividad de sesión. Exclusivo para administradores.
    """
    conf = db.query(ConfiguracionSistema).filter(
        ConfiguracionSistema.clave == CONFIG_KEY_SESSION_TIMEOUT
    ).first()

    if not conf:
        conf = ConfiguracionSistema(
            uid=uuid.uuid4(),
            clave=CONFIG_KEY_SESSION_TIMEOUT,
            valor=str(config_in.timeout_minutes),
            descripcion="Tiempo máximo de inactividad de sesión de usuarios en minutos antes del cierre automático",
            usuario_actualizador_uid=admin.uid
        )
        db.add(conf)
    else:
        conf.valor = str(config_in.timeout_minutes)
        conf.usuario_actualizador_uid = admin.uid
        conf.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(conf)

    return SessionConfigOut(
        timeout_minutes=int(conf.valor),
        clave=CONFIG_KEY_SESSION_TIMEOUT,
        updated_at=conf.updated_at,
        usuario_actualizador=admin.nombre_completo
    )
