import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.db.session import get_db
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.models import ConfiguracionSistema, User, Role, RolModulo, AuditoriaLogin
from app.schemas.schemas import SessionConfigIn, SessionConfigOut, RoleOut, RoleCreate, RoleUpdate, AuditoriaLoginOut
from app.core.security import get_current_user, require_admin

router = APIRouter(prefix="/config", tags=["Configuración"])

CONFIG_KEY_SESSION_TIMEOUT = "session_inactivity_timeout_minutes"
DEFAULT_SESSION_TIMEOUT = 30

# --- SESIÓN ---
@router.get("/session", response_model=SessionConfigOut)
def get_session_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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

# --- ROLES & PERMISOS DINÁMICOS (RBAC) ---
@router.get("/roles", response_model=List[RoleOut])
def list_roles_with_modules(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    roles = db.query(Role).order_by(Role.created_at.asc()).all()
    res = []
    for r in roles:
        mod_ids = [m.modulo_id for m in r.modulos] if r.modulos else []
        res.append(RoleOut(
            uid=r.uid,
            nombre=r.nombre,
            descripcion=r.descripcion,
            activo=r.activo,
            modulos=mod_ids
        ))
    return res

@router.post("/roles", response_model=RoleOut, status_code=status.HTTP_201_CREATED)
def create_role(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    nom = role_in.nombre.strip()
    existing = db.query(Role).filter(Role.nombre.ilike(nom)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un rol con ese nombre.")

    new_role = Role(
        uid=uuid.uuid4(),
        nombre=nom,
        descripcion=role_in.descripcion.strip() if role_in.descripcion else None,
        activo=True
    )
    db.add(new_role)
    db.flush()

    for mod in role_in.modulos:
        rm = RolModulo(uid=uuid.uuid4(), rol_uid=new_role.uid, modulo_id=mod)
        db.add(rm)

    db.commit()
    db.refresh(new_role)

    return RoleOut(
        uid=new_role.uid,
        nombre=new_role.nombre,
        descripcion=new_role.descripcion,
        activo=new_role.activo,
        modulos=[m.modulo_id for m in new_role.modulos]
    )

@router.put("/roles/{role_uid}", response_model=RoleOut)
def update_role(
    role_uid: uuid.UUID,
    role_in: RoleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    role = db.query(Role).filter(Role.uid == role_uid).first()
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado.")

    # Regla inquebrantable de seguridad
    is_super_admin = role.nombre == "Administrador"

    if role_in.nombre is not None and not is_super_admin:
        role.nombre = role_in.nombre.strip()

    if role_in.descripcion is not None:
        role.descripcion = role_in.descripcion.strip()

    if role_in.activo is not None:
        if is_super_admin and not role_in.activo:
            raise HTTPException(status_code=400, detail="El rol Administrador no puede ser desactivado.")
        role.activo = role_in.activo

    if role_in.modulos is not None:
        selected_mods = list(set(role_in.modulos))
        if is_super_admin and "configuracion" not in selected_mods:
            selected_mods.append("configuracion")

        # Limpiar y reasignar
        db.query(RolModulo).filter(RolModulo.rol_uid == role.uid).delete()
        for mod in selected_mods:
            rm = RolModulo(uid=uuid.uuid4(), rol_uid=role.uid, modulo_id=mod)
            db.add(rm)

    db.commit()
    db.refresh(role)

    return RoleOut(
        uid=role.uid,
        nombre=role.nombre,
        descripcion=role.descripcion,
        activo=role.activo,
        modulos=[m.modulo_id for m in role.modulos]
    )

# --- AUDITORÍA DE INICIOS DE SESIÓN ---
@router.get("/audit/logins")
def list_login_audit_logs(
    search: Optional[str] = Query(None, description="Filtrar por correo o IP"),
    exitoso: Optional[bool] = Query(None, description="Filtrar por estado exitoso/fallido"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=10, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    query = db.query(AuditoriaLogin)

    if exitoso is not None:
        query = query.filter(AuditoriaLogin.exitoso == exitoso)

    if search:
        s = search.strip().lower()
        query = query.filter(
            (AuditoriaLogin.correo.ilike(f"%{s}%")) |
            (AuditoriaLogin.ip_origen.ilike(f"%{s}%"))
        )

    total = query.count()
    logs = query.order_by(desc(AuditoriaLogin.fecha_hora)).offset((page - 1) * limit).limit(limit).all()

    items = []
    for l in logs:
        items.append({
            "uid": str(l.uid),
            "correo": l.correo,
            "usuario_nombre": l.usuario.nombre_completo if l.usuario else None,
            "exitoso": l.exitoso,
            "ip_origen": l.ip_origen or "Desconocida",
            "user_agent": l.user_agent,
            "motivo_fallo": l.motivo_fallo,
            "fecha_hora": l.fecha_hora.isoformat()
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }
