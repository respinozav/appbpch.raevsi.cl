#!/usr/bin/env bash
# ==============================================================================
# Script de Aprovisionamiento y Configuración Inicial del Servidor AWS
# Dominio: appbpch.raevsi.cl
# Ubicación física: /var/www/appbpch.raevsi.cl
# ==============================================================================

set -euo pipefail

DOMAIN="appbpch.raevsi.cl"
PROJECT_DIR="/var/www/$DOMAIN"
LOG_DIR="$PROJECT_DIR/logs"
NGINX_AVAILABLE="/etc/nginx/sites-available/$DOMAIN"
NGINX_ENABLED="/etc/nginx/sites-enabled/$DOMAIN"
SYSTEMD_SERVICE="/etc/systemd/system/appbpch.service"
CURRENT_USER="${USER:-ubuntu}"

log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "=================================================================="
log "Iniciando configuración y aprovisionamiento del servidor para $DOMAIN"
log "=================================================================="

# 1. Asegurar Estructura de Directorios en /var/www/
log "Creando directorios en $PROJECT_DIR..."
sudo mkdir -p "$PROJECT_DIR"
sudo mkdir -p "$LOG_DIR"
sudo mkdir -p "$PROJECT_DIR/frontend/dist"
sudo mkdir -p "$PROJECT_DIR/backend"
sudo mkdir -p /var/www/certbot

# 2. Configurar Permisos Base
log "Configurando permisos de directorio para $CURRENT_USER:www-data..."
sudo chown -R "$CURRENT_USER:www-data" "$PROJECT_DIR"
sudo chmod -R 775 "$PROJECT_DIR"

# 3. Configurar Entorno Virtual Python si no existe
if [ ! -d "$PROJECT_DIR/backend/venv" ]; then
    log "Creando entorno virtual Python en $PROJECT_DIR/backend/venv..."
    python3 -m venv "$PROJECT_DIR/backend/venv"
    # shellcheck disable=SC1091
    source "$PROJECT_DIR/backend/venv/bin/activate"
    pip install --upgrade pip
    if [ -f "$PROJECT_DIR/backend/requirements.txt" ]; then
        pip install -r "$PROJECT_DIR/backend/requirements.txt"
    fi
    deactivate
fi

# 4. Instalar y Habilitar Servicio Systemd
log "Instalando servicio systemd appbpch..."
if [ -f "$PROJECT_DIR/deploy/server/appbpch.service" ]; then
    sudo cp "$PROJECT_DIR/deploy/server/appbpch.service" "$SYSTEMD_SERVICE"
    sudo systemctl daemon-reload
    sudo systemctl enable appbpch.service
    log "Servicio appbpch.service habilitado."
else
    log "ADVERTENCIA: No se encontró $PROJECT_DIR/deploy/server/appbpch.service"
fi

# 5. Configuración de Nginx y Certificados SSL Let's Encrypt
log "Configurando servidor web Nginx..."
if [ -f "$PROJECT_DIR/deploy/server/nginx-appbpch.conf" ]; then
    sudo cp "$PROJECT_DIR/deploy/server/nginx-appbpch.conf" "$NGINX_AVAILABLE"
    sudo ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"
    log "Enlace simbólico creado en $NGINX_ENABLED."

    # Verificar si ya existen los certificados SSL
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ]; then
        log "Certificados SSL detectados para $DOMAIN."
    else
        log "Los certificados SSL para $DOMAIN aún no existen en /etc/letsencrypt/live/$DOMAIN/."
        log "Intentando emitir certificados mediante Certbot..."
        if command -v certbot &> /dev/null; then
            # Si nginx falla por falta de certificados en la conf, generar conf temporal HTTP
            if ! sudo nginx -t &> /dev/null; then
                log "Creando configuración temporal HTTP para verificación ACME de Certbot..."
                sudo tee "$NGINX_AVAILABLE" > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    root $PROJECT_DIR/frontend/dist;
    index index.html;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
                sudo systemctl reload nginx || sudo systemctl restart nginx
            fi

            log "Ejecutando certbot para $DOMAIN..."
            sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@raevsi.cl" --redirect || true

            # Restaurar configuración completa Nginx
            sudo cp "$PROJECT_DIR/deploy/server/nginx-appbpch.conf" "$NGINX_AVAILABLE"
        else
            log "AVISO: Certbot no está instalado en el servidor. Instálalo con: sudo apt install certbot python3-certbot-nginx"
        fi
    fi

    # Verificar y recargar Nginx
    log "Comprobando sintaxis de Nginx..."
    if sudo nginx -t; then
        sudo systemctl reload nginx
        log "Nginx recargado correctamente."
    else
        log "ERROR: Error en la sintaxis de Nginx."
    fi
else
    log "ADVERTENCIA: No se encontró $PROJECT_DIR/deploy/server/nginx-appbpch.conf"
fi

# 6. Reajuste de Permisos Final
sudo chown -R "$CURRENT_USER:www-data" "$PROJECT_DIR"
sudo chmod -R 775 "$PROJECT_DIR"

log "=================================================================="
log "Aprovisionamiento de $DOMAIN completado con ÉXITO."
log "=================================================================="
