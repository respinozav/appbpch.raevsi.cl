import uuid
from sqlalchemy import (
    Column, BigInteger, String, Text, Boolean, DateTime, Date, ForeignKey, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base

class Role(Base):
    __tablename__ = "roles"
    __table_args__ = {"schema": "bdbioplastchile"}

    uid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid(), index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    usuarios = relationship("User", back_populates="rol")
    modulos = relationship("RolModulo", back_populates="rol", cascade="all, delete-orphan")


class RolModulo(Base):
    __tablename__ = "rol_modulos"
    __table_args__ = {"schema": "bdbioplastchile"}

    uid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid(), index=True)
    rol_uid = Column(UUID(as_uuid=True), ForeignKey("bdbioplastchile.roles.uid", ondelete="CASCADE"), nullable=False)
    modulo_id = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    rol = relationship("Role", back_populates="modulos")


class User(Base):
    __tablename__ = "usuarios"
    __table_args__ = {"schema": "bdbioplastchile"}

    uid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid(), index=True)
    nombre_completo = Column(String(255), nullable=False)
    correo = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol_uid = Column(UUID(as_uuid=True), ForeignKey("bdbioplastchile.roles.uid"), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    rol = relationship("Role", back_populates="usuarios")
    producciones_creadas = relationship("Production", back_populates="usuario_creador")


class Estado(Base):
    __tablename__ = "estados"
    __table_args__ = {"schema": "bdbioplastchile"}

    uid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid(), index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    color = Column(String(20), default="#22C55E")

    producciones = relationship("Production", back_populates="estado")


class Production(Base):
    __tablename__ = "production"
    __table_args__ = {"schema": "bdbioplastchile"}

    uid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid(), index=True)
    codigo_interno = Column(BigInteger, nullable=False, index=True)
    fecha = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    numero_maquina = Column(Integer, nullable=False) if "Integer" in globals() else Column(BigInteger, nullable=False)
    turno = Column(BigInteger, nullable=False)
    operador = Column(BigInteger, nullable=False)
    cantidad = Column(BigInteger, nullable=False)
    lote = Column(BigInteger, nullable=False, index=True)
    unidad_embalaje = Column(String(50), nullable=False)
    peso = Column(String(50), default="N/A", nullable=False)
    articulo = Column(String(255), nullable=False)
    material = Column(String(100), nullable=False)
    color_bidon = Column(String(100), nullable=False)
    color_asa = Column(String(100), nullable=False)
    uid_estado = Column(UUID(as_uuid=True), ForeignKey("bdbioplastchile.estados.uid"), nullable=False, index=True)
    usuario_creador_uid = Column(UUID(as_uuid=True), ForeignKey("bdbioplastchile.usuarios.uid"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    estado = relationship("Estado", back_populates="producciones")
    usuario_creador = relationship("User", back_populates="producciones_creadas")
    historial = relationship("HistorialEstado", back_populates="production", cascade="all, delete-orphan", order_by="desc(HistorialEstado.fecha_hora)")
    certificados = relationship("Certificado", back_populates="production", cascade="all, delete-orphan")


class HistorialEstado(Base):
    __tablename__ = "historial_estados"
    __table_args__ = {"schema": "bdbioplastchile"}

    uid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid(), index=True)
    production_uid = Column(UUID(as_uuid=True), ForeignKey("bdbioplastchile.production.uid"), nullable=False, index=True)
    estado_anterior_uid = Column(UUID(as_uuid=True), ForeignKey("bdbioplastchile.estados.uid"), nullable=True)
    estado_nuevo_uid = Column(UUID(as_uuid=True), ForeignKey("bdbioplastchile.estados.uid"), nullable=False)
    usuario_uid = Column(UUID(as_uuid=True), ForeignKey("bdbioplastchile.usuarios.uid"), nullable=True)
    fecha_hora = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    observaciones = Column(Text, nullable=True)

    production = relationship("Production", back_populates="historial")
    estado_anterior = relationship("Estado", foreign_keys=[estado_anterior_uid])
    estado_nuevo = relationship("Estado", foreign_keys=[estado_nuevo_uid])
    usuario = relationship("User")


class Certificado(Base):
    __tablename__ = "certificados"
    __table_args__ = {"schema": "bdbioplastchile"}

    uid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid(), index=True)
    numero_certificado = Column(String(50), nullable=False)
    production_uid = Column(UUID(as_uuid=True), ForeignKey("bdbioplastchile.production.uid"), nullable=False)
    codigo_interno = Column(BigInteger, nullable=False)
    lote = Column(BigInteger, nullable=False)
    cliente = Column(String(255), default="ALIASE")
    despacho = Column(String(100), default="336")
    factura = Column(String(100), default="")
    fecha = Column(Date, server_default=func.current_date())
    aprobado_por = Column(String(255), default="Susana Avila C.")
    cargo = Column(String(255), default="DEPTO. CONTROL DE CALIDAD")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    production = relationship("Production", back_populates="certificados")


class ConfiguracionSistema(Base):
    __tablename__ = "configuracion_sistema"
    __table_args__ = {"schema": "bdbioplastchile"}

    uid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid(), index=True)
    clave = Column(String(100), unique=True, nullable=False, index=True)
    valor = Column(Text, nullable=False)
    descripcion = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    usuario_actualizador_uid = Column(UUID(as_uuid=True), ForeignKey("bdbioplastchile.usuarios.uid"), nullable=True)

    usuario_actualizador = relationship("User")


class AuditoriaLogin(Base):
    __tablename__ = "auditoria_logins"
    __table_args__ = {"schema": "bdbioplastchile"}

    uid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid(), index=True)
    correo = Column(String(255), nullable=False)
    usuario_uid = Column(UUID(as_uuid=True), ForeignKey("bdbioplastchile.usuarios.uid", ondelete="SET NULL"), nullable=True)
    exitoso = Column(Boolean, default=False, nullable=False)
    ip_origen = Column(String(100), nullable=True)
    user_agent = Column(Text, nullable=True)
    motivo_fallo = Column(String(255), nullable=True)
    fecha_hora = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    usuario = relationship("User")


class SapCodigoInterno(Base):
    __tablename__ = "sapcodigointerno"
    __table_args__ = {"schema": "bdbioplastchile"}

    uid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid(), index=True)
    codigosap = Column(String(100), unique=True, nullable=False, index=True)
    codigointerno = Column(String(100), unique=True, nullable=False, index=True)
    articulo = Column(String(255), nullable=False, index=True)
    materia = Column(String(100), nullable=True)
    color = Column(String(100), nullable=True)
    colorasa = Column(String(100), nullable=True)
    cantidad = Column(BigInteger, default=0, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

