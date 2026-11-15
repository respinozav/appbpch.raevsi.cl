#!/usr/bin/env bash
# ==============================================================================
# Script de Despliegue Automatizado - appbpch.raevsi.cl
# Servidor: AWS EC2 / Ubicación: /var/www/appbpch.raevsi.cl
# ==============================================================================

set -euo pipefail

# 1. Definición de Variables y Directorios de Trabajo
PROJECT_DIR="/var/www/appbpch.raevsi.cl"
LOG_DIR="$PROJECT_DIR/logs"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_DIR="$PROJECT_DIR/backend"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="$LOG_DIR/deploy-$TIMESTAMP.log"

# Asegurar existencia del directorio de logs
mkdir -p "$LOG_DIR"

# Duplicar toda la salida (stdout y stderr) hacia la consola y hacia el archivo de log
exec > >(tee -a "$LOG_FILE") 2>&1

log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "=================================================================="
log "Iniciando despliegue de appbpch.raevsi.cl"
log "Directorio del proyecto: $PROJECT_DIR"
log "Archivo de log: $LOG_FILE"
log "=================================================================="

# 2. Control y Actualización de Código
cd "$PROJECT_DIR"

log "Actualizando repositorio local desde origin main..."
git fetch origin main
git reset --hard origin/main || git pull origin main

DEPLOYED_COMMIT=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B | head -n 1)
COMMIT_AUTHOR=$(git log -1 --pretty="%an <%ae>")

log "Commit desplegado: $DEPLOYED_COMMIT - '$COMMIT_MSG' ($COMMIT_AUTHOR)"

# 3. Detección y Compilación del Frontend (React + Vite)
if [ -d "$FRONTEND_DIR" ]; then
    log "Frontend detectado en $FRONTEND_DIR. Iniciando instalación y build..."
    cd "$FRONTEND_DIR"

    # Verificar que npm esté disponible
    if command -v npm &> /dev/null; then
        if [ -f "package-lock.json" ]; then
            log "Ejecutando npm ci para instalación limpia y determinista..."
            npm ci --prefer-offline || npm install
        else
            log "Ejecutando npm install..."
            npm install
        fi

        log "Compilando aplicación frontend para producción..."
        npm run build

        if [ -d "$FRONTEND_DIR/dist" ]; then
            log "Frontend compilado exitosamente en $FRONTEND_DIR/dist."
        else
            log "ADVERTENCIA: No se encontró la carpeta $FRONTEND_DIR/dist tras el build."
        fi
    else
        log "ERROR: npm no está instalado en el sistema. Omitiendo build de frontend."
        exit 1
    fi
else
    log "No se detectó directorio frontend/. Omitiendo fase de frontend."
fi

# 4. Detección, Dependencias y Servicio del Backend (FastAPI + Python)
if [ -d "$BACKEND_DIR" ]; then
    log "Backend detectado en $BACKEND_DIR. Configurando entorno virtual..."
    cd "$BACKEND_DIR"

    VENV_DIR="$BACKEND_DIR/venv"
    if [ ! -d "$VENV_DIR" ]; then
        log "Creando entorno virtual Python en $VENV_DIR..."
        python3 -m venv "$VENV_DIR"
    fi

    log "Activando entorno virtual ($VENV_DIR)..."
    # shellcheck disable=SC1091
    source "$VENV_DIR/bin/activate"

    log "Actualizando pip..."
    pip install --upgrade pip --quiet

    if [ -f "$BACKEND_DIR/requirements.txt" ]; then
        log "Instalando dependencias desde $BACKEND_DIR/requirements.txt..."
        pip install -r "$BACKEND_DIR/requirements.txt" --quiet
    elif [ -f "$PROJECT_DIR/requirements.txt" ]; then
        log "Instalando dependencias desde $PROJECT_DIR/requirements.txt..."
        pip install -r "$PROJECT_DIR/requirements.txt" --quiet
    else
        log "ADVERTENCIA: No se encontró requirements.txt en backend ni en la raíz."
    fi

    # Ejecutar script de migraciones / verificación de base de datos si existe
    if [ -f "$PROJECT_DIR/init_db.py" ]; then
        log "Verificando esquema / migración inicial de base de datos..."
        python "$PROJECT_DIR/init_db.py" || log "Aviso: init_db.py finalizó con advertencia, continuando..."
    fi

    # Instalar / actualizar y reiniciar servicio systemd appbpch
    SERVICE_NAME="appbpch"
    log "Configurando y reiniciando servicio systemd $SERVICE_NAME..."

    if [ -f "$PROJECT_DIR/deploy/server/appbpch.service" ]; then
        log "Copiando definicion $PROJECT_DIR/deploy/server/appbpch.service a /etc/systemd/system/$SERVICE_NAME.service..."
        sudo cp "$PROJECT_DIR/deploy/server/appbpch.service" "/etc/systemd/system/$SERVICE_NAME.service"
    fi

    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME.service" || true

    log "Reiniciando servicio systemd $SERVICE_NAME..."
    sudo systemctl restart "$SERVICE_NAME" || sudo systemctl restart "appbpch-api" || true

    # Forzar recarga de workers uvicorn antiguos si existieran
    sudo pkill -f "uvicorn app.main:app" || true
    sleep 2
    sudo systemctl restart "$SERVICE_NAME" || true
    
    # Verificar estado del servicio
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log "Servicio $SERVICE_NAME reiniciado y ACTIVO exitosamente."
    else
        log "ADVERTENCIA: $SERVICE_NAME no se encuentra activo después del reinicio."
        sudo systemctl status "$SERVICE_NAME" --no-pager -l || true
    fi
else
    log "No se detectó directorio backend/. Omitiendo fase de backend."
fi

# 5. Comprobación y Recarga de Nginx
log "Verificando sintaxis de configuración de Nginx..."
if sudo nginx -t; then
    log "Configuración de Nginx válida. Recargando servidor web..."
    sudo systemctl reload nginx
    log "Nginx recargado correctamente."
else
    log "ERROR: Error de sintaxis en la configuración de Nginx. No se recargó."
    exit 1
fi

# 6. Ajuste Estricto de Permisos
log "Ajustando permisos en $PROJECT_DIR para el usuario y grupo www-data..."
sudo chown -R "${USER:-ubuntu}:www-data" "$PROJECT_DIR"
sudo chmod -R 775 "$PROJECT_DIR"

# 7. Rotación de Logs de Despliegue (mantener los 15 más recientes)
log "Limpiando logs antiguos (conservando los 15 más recientes)..."
cd "$LOG_DIR"
# shellcheck disable=SC2012
ls -tp deploy-*.log 2>/dev/null | grep -v '/$' | tail -n +16 | xargs -I {} rm -- {} 2>/dev/null || true

log "=================================================================="
log "Despliegue de appbpch.raevsi.cl finalizado con ÉXITO."
log "Commit en producción: $DEPLOYED_COMMIT"
log "Fecha y hora: $(date +'%Y-%m-%d %H:%M:%S')"
log "=================================================================="

exit 0
