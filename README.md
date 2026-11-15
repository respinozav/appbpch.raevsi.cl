# Bioplast Chile SpA · Plataforma Operativa y de Trazabilidad B2B

Sistema de gestión industrial, emisión térmica Zebra, sábana de lotes y certificación de calidad conforme a la Ley REP 20.920.

**Dominio de Producción:** `https://appbpch.raevsi.cl`  
**Base de Datos:** AWS RDS PostgreSQL (us-east-1)  
**Esquema:** `bdbioplastchile` / `bioplastchile`

---

## 1. Arquitectura Técnica

### Backend (Python + FastAPI)
- **Framework:** FastAPI con arquitectura modular limpia (`core`, `db`, `models`, `schemas`, `api`).
- **ORM & DB Driver:** SQLAlchemy 2.0 con `psycopg2` y pooling de conexiones contra AWS RDS PostgreSQL.
- **Seguridad:** Hash seguro mediante `bcrypt` y tokens JWT (HS256) con expiración configurable.
- **Correlativos Estrictos:**
  - `codigo_interno`: Inicia en `110000000` (mismo código para todos los lotes de la misma tirada).
  - `lote`: Inicia en `10000` (correlativo ascendente por cada ticket generado).
  - `unidad_embalaje`: Formato correlativo 4 dígitos (`0001`, `0002`...).
- **Trazabilidad & Auditoría:** Tabla `historial_estados` que audita cada transición de estado con marca temporal precisa, usuario responsable y observaciones.

### Frontend (React 19 + TypeScript + Vite + Tailwind CSS v4)
- **Identidad Visual:** Climate-Tech B2B minimalista (Linear / Stripe Climate / Vercel).
  - **Paleta Cromática (60-30-10):**
    - 60% Base: Blanco Puro (`#FFFFFF`) y Blanco Botánico (`#F7FAF7`) con textura sutil de puntos botánicos.
    - 30% Estructura y Contraste: Verde Pino Profundo (`#0D3B22`), Verde Menta Suave (`#EEF6F0`) y Bordes Finos (`#E5ECE6`).
    - 10% Acento: Verde Esmeralda (`#15803D` a `#22C55E`).
  - **Tipografía:**
    - Display: *Bricolage Grotesque*.
    - Interfaz: *Plus Jakarta Sans*.
    - Métricas y Folios: *JetBrains Mono* con `tabular-nums`.
- **Efectos y Micro-interacciones:** Transiciones fluidas con Motion, paleta de comandos rápida (`Ctrl+K` / `⌘K`), acordión expansivo con "Efecto Sábana" y optimización `@media print` para tickets Zebra y Certificados PDF.

---

## 2. Credenciales y Usuarios Iniciales Sembrados

| Rol | Correo Electrónico (Credencial Única) | Contraseña Inicial | Alcance |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@bioplastchile.cl` | `Admin2026!` | Acceso total a todos los módulos y CRUD de usuarios |
| **Jefatura** | `jefatura@bioplastchile.cl` | `Jefatura2026!` | Supervisión operativa, producción y certificados |
| **Colaborador** | `colaborador@bioplastchile.cl` | `Planta2026!` | Operación en planta y emisión de tickets |

---

## 3. Módulos Implementados

### Módulo 1: Autenticación y Control de Usuarios (CRUD)
- Pantalla Split-Screen corporativa con selectores rápidos por rol.
- Perfil personal de usuario para cambio de nombre y contraseña (correo inalterable).
- Panel de Administración completo para altas, bajas y edición de usuarios y roles.

### Módulo 2: Iniciar Producción e Impresión Zebra
- Formulario 100% responsivo para tablets de planta y móviles.
- Previsualización en vivo del ticket físico idéntico al formato térmico de Bioplast SpA:
  - Cabecera en bloque negro `BIOPLAST SPA`.
  - Nombre del artículo en tipografía extendida.
  - Bloque `CODIGO INTERNO [ 110000000 ]`.
  - Tabla operativa: `FECHA`, `MÁQ. / TURNO / OP`, `CANTIDAD UND.`, `LOTE`, `UNIDAD DE EMBALAJE`, `PESO`.
  - Código QR miniatura en esquina inferior derecha vinculado a la llave interna `UID` con URL pública `https://appbpch.raevsi.cl/trazabilidad/{uid}`.

### Módulo 3: Producción y Sábana de Lotes
- Filtrado por estados: *Producción* (por defecto), *Almacenaje*, *Despacho*, *Liberado*, *Retenido*.
- Paginación configurable (10, 20, 50, 100) y buscador rápido.
- **Efecto Sábana:** Despliegue fluido hacia abajo al hacer clic sobre cualquier código interno, mostrando todos los lotes individuales asociados.
- Modales de cambio de estado masivo o individual con registro automático en el historial de auditoría.

### Módulo 4: Certificados y Emisión PDF
- Filtro exclusivo para lotes en estado **Liberado**.
- Previsualización interactiva idéntica al documento oficial **R-CAL-07** (Versión 00) de Bioplast Chile.
- Edición de metadatos de despacho (Cliente, Despacho, Factura, Fecha, Responsable de Calidad).
- Botón de exportación e impresión directa en PDF a escala real.

### Módulo 5: Consulta Pública QR (No Editable)
- Ruta pública `/trazabilidad/:uid` accesible sin autenticación para clientes y auditores que escanean el código QR impreso en el envase o pallet.
- Formulario de verificación y cadena de custodia auditada en solo lectura.

---

## 4. Instrucciones de Ejecución Local

### Backend
```bash
# Iniciar backend FastAPI
python run_backend.py
```
El servidor quedará disponible en `http://localhost:8000`.  
Documentación interactiva Swagger: `http://localhost:8000/docs`.

### Frontend en Desarrollo
```bash
cd frontend
npm run dev
```
La aplicación cliente iniciará en `http://localhost:5173`.
