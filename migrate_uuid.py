import psycopg2
import bcrypt

password = r"aDxD*,r.lNk`5lY8eN+^ABk3T+*97W`N"
host = "ls-b12cc9081f17b594187264e8c7fe42119a9bb93f.cgt2s428cp85.us-east-1.rds.amazonaws.com"
user = "dbmasteruser"

conn = psycopg2.connect(host=host, user=user, password=password, dbname="postgres", connect_timeout=10)
conn.autocommit = True
cur = conn.cursor()

cur.execute("SET search_path TO bdbioplastchile, bioplastchile, public;")

print("Dropping old integer UID tables if exist...")
cur.execute("DROP TABLE IF EXISTS certificados CASCADE;")
cur.execute("DROP TABLE IF EXISTS historial_estados CASCADE;")
cur.execute("DROP TABLE IF EXISTS production CASCADE;")
cur.execute("DROP TABLE IF EXISTS usuarios CASCADE;")
cur.execute("DROP TABLE IF EXISTS roles CASCADE;")
cur.execute("DROP TABLE IF EXISTS estados CASCADE;")

print("Creating UUID tables...")

# 1. ROLES with UUID
cur.execute("""
CREATE TABLE roles (
    uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
""")

# 2. USUARIOS with UUID
cur.execute("""
CREATE TABLE usuarios (
    uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_uid UUID NOT NULL REFERENCES roles(uid),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
""")

# 3. ESTADOS with UUID
cur.execute("""
CREATE TABLE estados (
    uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT '#22C55E'
);
""")

# 4. PRODUCTION with UUID
cur.execute("""
CREATE TABLE production (
    uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_interno BIGINT NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    numero_maquina INTEGER NOT NULL,
    turno INTEGER NOT NULL,
    operador INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    lote INTEGER NOT NULL,
    unidad_embalaje VARCHAR(50) NOT NULL,
    peso VARCHAR(50) DEFAULT 'N/A' NOT NULL,
    articulo VARCHAR(255) NOT NULL,
    material VARCHAR(100) NOT NULL,
    color_bidon VARCHAR(100) NOT NULL,
    color_asa VARCHAR(100) NOT NULL,
    uid_estado UUID NOT NULL REFERENCES estados(uid),
    usuario_creador_uid UUID REFERENCES usuarios(uid),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_production_codigo_interno ON production(codigo_interno);
CREATE INDEX idx_production_lote ON production(lote);
CREATE INDEX idx_production_estado ON production(uid_estado);
""")

# 5. HISTORIAL_ESTADOS with UUID
cur.execute("""
CREATE TABLE historial_estados (
    uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_uid UUID NOT NULL REFERENCES production(uid) ON DELETE CASCADE,
    estado_anterior_uid UUID REFERENCES estados(uid),
    estado_nuevo_uid UUID NOT NULL REFERENCES estados(uid),
    usuario_uid UUID REFERENCES usuarios(uid),
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    observaciones TEXT
);

CREATE INDEX idx_historial_production ON historial_estados(production_uid);
""")

# 6. CERTIFICADOS with UUID
cur.execute("""
CREATE TABLE certificados (
    uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_certificado VARCHAR(50) NOT NULL,
    production_uid UUID NOT NULL REFERENCES production(uid) ON DELETE CASCADE,
    codigo_interno BIGINT NOT NULL,
    lote INTEGER NOT NULL,
    cliente VARCHAR(255) DEFAULT 'ALIASE',
    despacho VARCHAR(100) DEFAULT '336',
    factura VARCHAR(100) DEFAULT '',
    fecha DATE DEFAULT CURRENT_DATE,
    aprobado_por VARCHAR(255) DEFAULT 'Susana Avila C.',
    cargo VARCHAR(255) DEFAULT 'DEPTO. CONTROL DE CALIDAD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
""")

print("UUID tables created successfully!")

# Seed Roles
roles = [
    ("Administrador", "Acceso total a todos los módulos y menús"),
    ("Jefatura", "Roles de supervisión y gestión operativa"),
    ("Colaborador", "Operación en planta y registro")
]
roles_map = {}
for nombre, desc in roles:
    cur.execute("INSERT INTO roles (nombre, descripcion) VALUES (%s, %s) RETURNING uid;", (nombre, desc))
    roles_map[nombre] = cur.fetchone()[0]

# Seed Estados
estados = [
    ("Producción", "Lote en proceso de producción inicial", "#15803D"),
    ("Almacenaje", "Lote en bodega / almacenaje de planta", "#3B82F6"),
    ("Despacho", "Lote preparado o en ruta de despacho", "#8B5CF6"),
    ("Liberado", "Lote certificado y liberado por Calidad", "#10B981"),
    ("Retenido", "Lote retenido por control de calidad / auditoría", "#EF4444")
]
estados_map = {}
for nombre, desc, col in estados:
    cur.execute("INSERT INTO estados (nombre, descripcion, color) VALUES (%s, %s, %s) RETURNING uid;", (nombre, desc, col))
    estados_map[nombre] = cur.fetchone()[0]

def hash_pw(pw):
    return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Seed Users
users = [
    ("Administrador General Bioplast", "admin@bioplastchile.cl", hash_pw("Admin2026!"), roles_map["Administrador"]),
    ("Jefatura de Operaciones", "jefatura@bioplastchile.cl", hash_pw("Jefatura2026!"), roles_map["Jefatura"]),
    ("Operador de Planta Quilicura", "colaborador@bioplastchile.cl", hash_pw("Planta2026!"), roles_map["Colaborador"])
]
for nom, email, hpw, r_uid in users:
    cur.execute("""
        INSERT INTO usuarios (nombre_completo, correo, password_hash, rol_uid, activo)
        VALUES (%s, %s, %s, %s, TRUE);
    """, (nom, email, hpw, r_uid))

print("Seeding completed successfully with UUIDs!")
cur.execute("SELECT uid, nombre_completo, correo, rol_uid FROM usuarios;")
for row in cur.fetchall():
    print("User:", row)

conn.close()
