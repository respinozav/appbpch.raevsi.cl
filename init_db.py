import psycopg2

password = r"aDxD*,r.lNk`5lY8eN+^ABk3T+*97W`N"
host = "ls-b12cc9081f17b594187264e8c7fe42119a9bb93f.cgt2s428cp85.us-east-1.rds.amazonaws.com"
user = "dbmasteruser"

conn = psycopg2.connect(host=host, user=user, password=password, dbname="postgres", connect_timeout=10)
conn.autocommit = True
cur = conn.cursor()

# Ensure schema exists
cur.execute("CREATE SCHEMA IF NOT EXISTS bdbioplastchile;")
cur.execute("CREATE SCHEMA IF NOT EXISTS bioplastchile;")

cur.execute("SET search_path TO bdbioplastchile, bioplastchile, public;")

print("Schemas verified. Creating tables...")

# 1. Roles table
cur.execute("""
CREATE TABLE IF NOT EXISTS roles (
    uid SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
""")

# 2. Usuarios table
cur.execute("""
CREATE TABLE IF NOT EXISTS usuarios (
    uid SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_uid INTEGER NOT NULL REFERENCES roles(uid),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
""")

# 3. Estados table
cur.execute("""
CREATE TABLE IF NOT EXISTS estados (
    uid SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT '#22C55E'
);
""")

# 4. Production table
# Correlativo codigo_interno starts at 110000000
# Lotes start at 10000
cur.execute("""
CREATE SEQUENCE IF NOT EXISTS seq_codigo_interno START WITH 110000000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS seq_lote START WITH 10000 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS production (
    uid SERIAL PRIMARY KEY,
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
    uid_estado INTEGER NOT NULL REFERENCES estados(uid),
    usuario_creador_uid INTEGER REFERENCES usuarios(uid),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_production_codigo_interno ON production(codigo_interno);
CREATE INDEX IF NOT EXISTS idx_production_lote ON production(lote);
CREATE INDEX IF NOT EXISTS idx_production_estado ON production(uid_estado);
""")

# 5. Historial estados (Auditoría)
cur.execute("""
CREATE TABLE IF NOT EXISTS historial_estados (
    uid SERIAL PRIMARY KEY,
    production_uid INTEGER NOT NULL REFERENCES production(uid) ON DELETE CASCADE,
    estado_anterior_uid INTEGER REFERENCES estados(uid),
    estado_nuevo_uid INTEGER NOT NULL REFERENCES estados(uid),
    usuario_uid INTEGER REFERENCES usuarios(uid),
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    observaciones TEXT
);

CREATE INDEX IF NOT EXISTS idx_historial_production ON historial_estados(production_uid);
""")

# 6. Certificados
cur.execute("""
CREATE TABLE IF NOT EXISTS certificados (
    uid SERIAL PRIMARY KEY,
    numero_certificado VARCHAR(50) NOT NULL,
    production_uid INTEGER NOT NULL REFERENCES production(uid) ON DELETE CASCADE,
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

print("Tables created successfully!")

# Seed Roles
roles = [
    ("Administrador", "Acceso total a todos los módulos y menús"),
    ("Jefatura", "Roles de supervisión y gestión operativa"),
    ("Colaborador", "Operación en planta y registro")
]
for nombre, desc in roles:
    cur.execute("""
        INSERT INTO roles (nombre, descripcion)
        VALUES (%s, %s)
        ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion;
    """, (nombre, desc))

# Seed Estados
estados = [
    ("Producción", "Lote en proceso de producción inicial", "#15803D"),
    ("Almacenaje", "Lote en bodega / almacenaje de planta", "#3B82F6"),
    ("Despacho", "Lote preparado o en ruta de despacho", "#8B5CF6"),
    ("Liberado", "Lote certificado y liberado por Calidad", "#10B981"),
    ("Retenido", "Lote retenido por control de calidad / auditoría", "#EF4444")
]
for nombre, desc, col in estados:
    cur.execute("""
        INSERT INTO estados (nombre, descripcion, color)
        VALUES (%s, %s, %s)
        ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion, color = EXCLUDED.color;
    """, (nombre, desc, col))

# 7. Configuracion table
cur.execute("""
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_actualizador_uid UUID REFERENCES usuarios(uid)
);
""")
cur.execute("""
INSERT INTO configuracion_sistema (clave, valor, descripcion)
VALUES ('session_inactivity_timeout_minutes', '30', 'Tiempo de inactividad de sesión en minutos antes del cierre automático')
ON CONFLICT (clave) DO NOTHING;
""")

# Also ensure table views exist in bioplastchile or alias if desired
cur.execute("""
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'bdbioplastchile';
""")
print("Tables in bdbioplastchile:", cur.fetchall())

conn.close()
print("Database initialization script finished successfully!")
