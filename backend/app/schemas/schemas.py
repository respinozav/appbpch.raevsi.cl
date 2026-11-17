from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime, date
from uuid import UUID

# --- ROLES ---
class RoleBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    activo: bool = True

class RoleOut(RoleBase):
    uid: UUID
    modulos: List[str] = []

    @field_validator("modulos", mode="before")
    @classmethod
    def extract_modulos(cls, v):
        if not v:
            return []
        res = []
        for item in v:
            if isinstance(item, str):
                res.append(item)
            elif hasattr(item, "modulo_id"):
                res.append(item.modulo_id)
        return res

    class Config:
        from_attributes = True

class RoleCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    modulos: List[str] = []

class RoleUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    activo: Optional[bool] = None
    modulos: Optional[List[str]] = None

# --- AUDITORIA LOGINS ---
class AuditoriaLoginOut(BaseModel):
    uid: UUID
    correo: str
    usuario_nombre: Optional[str] = None
    exitoso: bool
    ip_origen: Optional[str] = None
    user_agent: Optional[str] = None
    motivo_fallo: Optional[str] = None
    fecha_hora: datetime

    class Config:
        from_attributes = True

# --- USUARIOS ---
class UserBase(BaseModel):
    nombre_completo: str
    correo: EmailStr
    activo: bool = True

class UserCreate(UserBase):
    password: str
    rol_uid: UUID

class UserUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    password: Optional[str] = None
    rol_uid: Optional[UUID] = None
    activo: Optional[bool] = None

class UserProfileUpdate(BaseModel):
    nombre_completo: str
    password: Optional[str] = None
    current_password: Optional[str] = None

class UserOut(UserBase):
    uid: UUID
    rol_uid: UUID
    rol: Optional[RoleOut] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- AUTH ---
class LoginRequest(BaseModel):
    correo: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- ESTADOS ---
class EstadoOut(BaseModel):
    uid: UUID
    nombre: str
    descripcion: Optional[str] = None
    color: Optional[str] = None

    class Config:
        from_attributes = True

# --- PRODUCCION ---
class ProductionBatchCreate(BaseModel):
    numero_maquina: int = Field(..., ge=1, description="Número de máquina (int)")
    turno: int = Field(..., ge=1, le=3, description="Turno de trabajo (1-3)")
    operador: int = Field(..., ge=1, description="Código del operador (int)")
    operador_nombre: Optional[str] = Field(None, description="Nombre del operador seleccionado")
    cantidad: int = Field(..., ge=1, description="Cantidad en unidades (int)")
    cantidad_lotes: int = Field(..., ge=1, le=500, description="Cantidad de unidades de embalaje / tickets a emitir")
    peso: str = Field(default="N/A", description="Unidad de peso en kilos o N/A")
    articulo: str = Field(..., description="Nombre del artículo / envase")
    material: str = Field(..., description="Material (PET, rPET, HDPE, etc.)")
    color_bidon: str = Field(..., description="Color del bidón / cuerpo")
    color_asa: str = Field(..., description="Color del asa")
    codigosap: Optional[str] = Field(None, description="Código SAP / Código Interno unificado")

class ProductionOut(BaseModel):
    uid: UUID
    codigo_interno: int
    codigosap: Optional[str] = None
    fecha: datetime
    numero_maquina: int
    turno: int
    operador: int
    operador_nombre: Optional[str] = None
    cantidad: int
    lote: int
    unidad_embalaje: str
    peso: str
    articulo: str
    material: str
    color_bidon: str
    color_asa: str
    uid_estado: UUID
    estado: Optional[EstadoOut] = None
    created_at: Optional[datetime] = None
    qr_url: Optional[str] = None

    class Config:
        from_attributes = True

class ProductionBatchSummary(BaseModel):
    codigo_interno: int
    codigosap: Optional[str] = None
    fecha: datetime
    articulo: str
    material: str
    color_bidon: str
    color_asa: str
    numero_maquina: int
    turno: int
    operador: int
    operador_nombre: Optional[str] = None
    cantidad_unitaria: int
    total_lotes: int
    lote_inicio: int
    lote_fin: int
    peso: str
    uid_estado: UUID
    estado: Optional[EstadoOut] = None
    lotes: List[ProductionOut] = []

class ProductionBatchStateUpdate(BaseModel):
    nuevo_estado_uid: UUID
    observaciones: Optional[str] = None
    aplicar_a_todo_el_lote: bool = True

class HistorialEstadoOut(BaseModel):
    uid: UUID
    production_uid: UUID
    estado_anterior: Optional[EstadoOut] = None
    estado_nuevo: Optional[EstadoOut] = None
    usuario_nombre: Optional[str] = None
    fecha_hora: datetime
    observaciones: Optional[str] = None

# --- CERTIFICADOS ---
class CertificadoCreate(BaseModel):
    production_uid: UUID
    cliente: str = ""
    despacho: str = ""
    factura: str = ""
    fecha: Optional[date] = None
    aprobado_por: str = ""
    cargo: str = ""

class CertificadoOut(BaseModel):
    uid: UUID
    numero_certificado: str
    production_uid: UUID
    codigo_interno: int
    lote: int
    cliente: str
    despacho: str
    factura: Optional[str] = None
    fecha: Optional[date] = None
    aprobado_por: str
    cargo: str
    created_at: Optional[datetime] = None
    production: Optional[ProductionOut] = None

    class Config:
        from_attributes = True

# --- PUBLIC CONSULTATION (QR SCAN) ---
class PublicTrazabilidadOut(BaseModel):
    uid: UUID
    verificado: bool = True
    codigo_interno: int
    codigosap: Optional[str] = None
    lote: int
    unidad_embalaje: str
    articulo: str
    material: str
    color_bidon: str
    color_asa: str
    cantidad: int
    peso: str
    numero_maquina: int
    turno: int
    operador: int
    operador_nombre: Optional[str] = None
    fecha_fabricacion: datetime
    estado_actual: str
    estado_color: str
    certificado_numero: Optional[str] = None
    aprobado_calidad: bool = False
    historial: List[HistorialEstadoOut] = []

# --- CONFIGURACION DEL SISTEMA ---
class SessionConfigIn(BaseModel):
    timeout_minutes: int = Field(..., ge=5, le=480, description="Tiempo de inactividad de sesión en minutos (5 a 480)")

class SessionConfigOut(BaseModel):
    timeout_minutes: int
    clave: str = "session_inactivity_timeout_minutes"
    updated_at: Optional[datetime] = None
    usuario_actualizador: Optional[str] = None

# --- CODIGOS INTERNOS SAP ---
class SapCodigoInternoBase(BaseModel):
    codigosap: str
    codigointerno: Optional[str] = None
    articulo: str
    materia: Optional[str] = None
    color: Optional[str] = None
    colorasa: Optional[str] = None
    cantidad: Optional[int] = 0

class SapCodigoInternoCreate(SapCodigoInternoBase):
    pass

class SapCodigoInternoUpdate(BaseModel):
    codigosap: Optional[str] = None
    codigointerno: Optional[str] = None
    articulo: Optional[str] = None
    materia: Optional[str] = None
    color: Optional[str] = None
    colorasa: Optional[str] = None
    cantidad: Optional[int] = None

class SapCodigoInternoOut(SapCodigoInternoBase):
    uid: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- OPERADORES ---
class OperadorBase(BaseModel):
    nombre: str
    rut: Optional[str] = None
    activo: bool = True

class OperadorCreate(OperadorBase):
    pass

class OperadorUpdate(BaseModel):
    nombre: Optional[str] = None
    rut: Optional[str] = None
    activo: Optional[bool] = None

class OperadorOut(OperadorBase):
    uid: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

