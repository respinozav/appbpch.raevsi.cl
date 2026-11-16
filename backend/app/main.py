import os
import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import SessionLocal, engine, Base
from app.models.models import Role, User, Estado, ConfiguracionSistema
from app.core.security import get_password_hash
from app.api.endpoints import auth, users, production, certificates, public, dashboard, config, codigos_internos

def seed_initial_data():
    # Asegurar que todas las tablas existan en la base de datos
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        roles_data = [
            ("Administrador", "Acceso total a todos los módulos y menús"),
            ("Jefatura", "Roles de supervisión y gestión operativa"),
            ("Colaborador", "Operación en planta y registro")
        ]
        roles_map = {}
        for nombre, desc in roles_data:
            role = db.query(Role).filter(Role.nombre == nombre).first()
            if not role:
                role = Role(uid=uuid.uuid4(), nombre=nombre, descripcion=desc)
                db.add(role)
                db.flush()
            roles_map[nombre] = role

        estados_data = [
            ("Producción", "Lote en proceso de producción inicial", "#15803D"),
            ("Almacenaje", "Lote en bodega / almacenaje de planta", "#3B82F6"),
            ("Despacho", "Lote preparado o en ruta de despacho", "#8B5CF6"),
            ("Liberado", "Lote certificado y liberado por Calidad", "#10B981"),
            ("Retenido", "Lote retenido por control de calidad / auditoría", "#EF4444")
        ]
        for nombre, desc, col in estados_data:
            est = db.query(Estado).filter(Estado.nombre == nombre).first()
            if not est:
                est = Estado(uid=uuid.uuid4(), nombre=nombre, descripcion=desc, color=col)
                db.add(est)

        admin_email = "admin@bioplastchile.cl"
        admin = db.query(User).filter(User.correo == admin_email).first()
        if not admin and "Administrador" in roles_map:
            admin = User(
                uid=uuid.uuid4(),
                nombre_completo="Administrador General Bioplast",
                correo=admin_email,
                password_hash=get_password_hash("Admin2026!"),
                rol_uid=roles_map["Administrador"].uid,
                activo=True
            )
            db.add(admin)

        # Configuración inicial del sistema: Tiempo de inactividad de sesión (30 minutos por defecto)
        conf_session = db.query(ConfiguracionSistema).filter(
            ConfiguracionSistema.clave == "session_inactivity_timeout_minutes"
        ).first()
        if not conf_session:
            conf_session = ConfiguracionSistema(
                uid=uuid.uuid4(),
                clave="session_inactivity_timeout_minutes",
                valor="30",
                descripcion="Tiempo máximo de inactividad de sesión de usuarios en minutos antes del cierre automático"
            )
            db.add(conf_session)

        db.commit()
    except Exception as e:
        print(f"Error in seed_initial_data: {e}")
        db.rollback()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_initial_data()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend de Trazabilidad Industrial y Operaciones para Bioplast Chile SpA",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://appbpch.raevsi.cl",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(production.router, prefix=settings.API_V1_STR)
app.include_router(certificates.router, prefix=settings.API_V1_STR)
app.include_router(public.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(config.router, prefix=settings.API_V1_STR)
app.include_router(codigos_internos.router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Bioplast Chile API"}

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
