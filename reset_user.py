import psycopg2
import bcrypt
import uuid

password = r"aDxD*,r.lNk`5lY8eN+^ABk3T+*97W`N"
host = "ls-b12cc9081f17b594187264e8c7fe42119a9bb93f.cgt2s428cp85.us-east-1.rds.amazonaws.com"
user = "dbmasteruser"

conn = psycopg2.connect(host=host, user=user, password=password, dbname="postgres", connect_timeout=10)
conn.autocommit = True
cur = conn.cursor()

cur.execute("SET search_path TO bdbioplastchile, bioplastchile, public;")

target_email = "roderick.espinoza@gmail.com"
target_pass = "12345678"
password_hash = bcrypt.hashpw(target_pass.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# Get Administrador role UID
cur.execute("SELECT uid FROM roles WHERE nombre = 'Administrador';")
role_row = cur.fetchone()
if not role_row:
    admin_uid = str(uuid.uuid4())
    cur.execute("INSERT INTO roles (uid, nombre, descripcion) VALUES (%s, 'Administrador', 'Acceso total a todos los módulos y menús');", (admin_uid,))
else:
    admin_uid = str(role_row[0])

# Check if user exists
cur.execute("SELECT uid, nombre_completo, correo, rol_uid, activo FROM usuarios WHERE correo = %s;", (target_email,))
user_row = cur.fetchone()

if user_row:
    cur.execute("""
        UPDATE usuarios 
        SET password_hash = %s, rol_uid = %s, activo = TRUE, updated_at = NOW()
        WHERE correo = %s
        RETURNING uid, nombre_completo, correo;
    """, (password_hash, admin_uid, target_email))
    updated = cur.fetchone()
    print(f"Usuario existente actualizado: {updated}")
else:
    user_uid = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO usuarios (uid, nombre_completo, correo, password_hash, rol_uid, activo)
        VALUES (%s, 'Roderick Espinoza', %s, %s, %s, TRUE)
        RETURNING uid, nombre_completo, correo;
    """, (user_uid, target_email, password_hash, admin_uid))
    created = cur.fetchone()
    print(f"Nuevo usuario administrador creado: {created}")

conn.close()
print("Operacion completada exitosamente!")
