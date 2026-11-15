import React from 'react';
import { 
  Printer, CheckCircle2, ShieldCheck, HelpCircle, Layers, 
  FileCheck, QrCode, Settings, Users, AlertTriangle, ArrowRight,
  Factory, Calendar, Award, BookOpen, Clock, Lock, Sparkles, Check
} from 'lucide-react';

interface ManualDocumentProps {
  onPrint?: () => void;
  activeSectionId?: string;
}

export const ManualDocument: React.FC<ManualDocumentProps> = ({ onPrint, activeSectionId }) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Action Toolbar (Hidden when printing) */}
      <div className="w-full max-w-[900px] flex flex-col sm:flex-row justify-between items-center mb-6 no-print px-2 gap-3">
        <div className="flex items-center gap-2.5 text-sm text-[#0D3B22]">
          <ShieldCheck className="w-5 h-5 text-[#15803D]" />
          <div>
            <span className="font-bold">Documento Oficial Controlado · MAN-SGI-01</span>
            <span className="block text-[11px] text-neutral-500">
              Sistema de Gestión Integrado · Bioplast Chile SpA · Planta Quilicura
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803D] text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
            <span>Versión v2.5 Vigente</span>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-[#0D3B22] text-white hover:bg-[#15803D] shadow-sm transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Official Manual Document Container (Matches Certificate format & margins) */}
      <div 
        id="manual-printable-area"
        className="printable-area bg-white text-black p-6 sm:p-12 w-full max-w-[900px] shadow-lg border border-neutral-300 font-sans text-xs leading-relaxed"
        style={{ fontFamily: '"Arial", "Helvetica", sans-serif' }}
      >
        {/* Header 3-Column Box (Identical structure to CertificateDocument.tsx) */}
        <div className="border border-black grid grid-cols-12 mb-6">
          {/* Col 1: Logo Bioplast */}
          <div className="col-span-3 border-r border-black p-3 flex flex-col justify-center items-center text-center bg-white">
            <img 
              src="/logo-bioplast.png" 
              alt="Bioplast Ecological Innovation" 
              className="h-11 max-h-12 w-auto object-contain"
            />
          </div>

          {/* Col 2: Title Centered */}
          <div className="col-span-6 border-r border-black p-3 flex flex-col items-center justify-center text-center">
            <h1 className="font-bold text-sm sm:text-base tracking-wider uppercase leading-tight">
              MANUAL DE OPERACIONES Y TRAZABILIDAD INDUSTRIAL
            </h1>
            <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-1">
              SISTEMA DE GESTIÓN B2B & LEY REP 20.920
            </span>
          </div>

          {/* Col 3: Document Metadata */}
          <div className="col-span-3 text-[9px] font-sans">
            <div className="border-b border-black p-1 px-2 font-medium">
              Código: <span className="font-bold">MAN-SGI-01</span>
            </div>
            <div className="border-b border-black p-1 px-2 font-medium">
              Versión: <span className="font-bold">v2.5</span>
            </div>
            <div className="border-b border-black p-1 px-2 font-medium">
              Actualización: <span className="font-bold">15-Nov-2026</span>
            </div>
            <div className="p-1 px-2 font-medium">
              Ámbito: <span className="font-bold">Planta Quilicura</span>
            </div>
          </div>
        </div>

        {/* Control de Versiones y Aprobaciones */}
        <div className="border border-black mb-6 overflow-hidden">
          <div className="bg-neutral-100 border-b border-black p-1.5 px-3 font-bold text-[10px] uppercase tracking-wide">
            Control de Revisiones y Aprobaciones del Documento
          </div>
          <table className="w-full text-center border-collapse text-[9px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-black font-semibold">
                <th className="border-r border-black p-1">Rev.</th>
                <th className="border-r border-black p-1">Fecha</th>
                <th className="border-r border-black p-1">Elaborado por</th>
                <th className="border-r border-black p-1">Revisado por</th>
                <th className="border-r border-black p-1">Aprobado por</th>
                <th className="p-1">Descripción del Cambio</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-200">
                <td className="border-r border-black p-1 font-mono">v1.0</td>
                <td className="border-r border-black p-1">10-Ene-2026</td>
                <td className="border-r border-black p-1">Ing. Operaciones</td>
                <td className="border-r border-black p-1">Jefatura Planta</td>
                <td className="border-r border-black p-1">Gerencia Técnica</td>
                <td className="p-1 text-left px-2">Emisión inicial de procedimientos de soplado y códigos QR.</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="border-r border-black p-1 font-mono">v2.0</td>
                <td className="border-r border-black p-1">01-Oct-2026</td>
                <td className="border-r border-black p-1">Equipo TI / SGI</td>
                <td className="border-r border-black p-1">Control de Calidad</td>
                <td className="border-r border-black p-1">Gerencia Operaciones</td>
                <td className="p-1 text-left px-2">Integración de plataforma web, módulo R-CAL-07 y sábana de trazabilidad.</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="border-r border-black p-1 font-mono">v2.4</td>
                <td className="border-r border-black p-1">15-Nov-2026</td>
                <td className="border-r border-black p-1">Tech Lead TI</td>
                <td className="border-r border-black p-1">Susana Avila C.</td>
                <td className="border-r border-black p-1">Dirección General</td>
                <td className="p-1 text-left px-2">Ajustes de inactividad de sesión, filtros fecha mes actual, gráfico donut de turnos y manual unificado.</td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="border-r border-black p-1 font-mono font-bold">v2.5</td>
                <td className="border-r border-black p-1 font-bold">15-Nov-2026</td>
                <td className="border-r border-black p-1">Tech Lead TI</td>
                <td className="border-r border-black p-1">Control de Calidad</td>
                <td className="border-r border-black p-1">Gerencia Operaciones</td>
                <td className="p-1 text-left px-2 font-medium">Bento Header con Lotes Retenidos, evolución diaria full-width, exportación CSV, validación estricta de 5 campos en certificados e interactividad global de menú.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Declaración de Propósito y Alcance */}
        <div className="mb-6 p-3 bg-neutral-50 border border-neutral-300 rounded-lg text-[10px] leading-relaxed text-neutral-800">
          <div className="font-bold uppercase tracking-wider text-neutral-900 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Propósito y Marco Regulatorio</span>
          </div>
          <p className="text-justify">
            El presente manual establece el procedimiento operativo formal para el uso de la plataforma digital <strong>appbpch.raevsi.cl</strong> en la Planta Quilicura de Bioplast Chile SpA. Su propósito es garantizar la <strong>trazabilidad unitaria ininterrumpida</strong> de envases y bidones fabricados con polímeros reciclados de alta densidad (HDPE PCR) y vírgenes, dando pleno cumplimiento a las metas de valorización de la <strong>Ley REP N° 20.920</strong> y asegurando la conformidad técnica requerida por clientes industriales de clase mundial.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 1: DASHBOARD EJECUTIVO */}
        {/* ========================================================================= */}
        <section id="sec-dashboard" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">1</span>
              <span>Módulo 1 · Dashboard Ejecutivo (Inteligencia Operativa & OEE)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /dashboard</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            El Dashboard centraliza las métricas en tiempo real de la planta de producción. Brinda a la gerencia y supervisores una radiografía instantánea del volumen procesado, la eficiencia de los turnos, el cumplimiento frente a la meta operacional y la exportación masiva de datos auditados.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="border border-neutral-200 p-2.5 rounded bg-white">
              <div className="font-bold text-[10.5px] text-[#0D3B22] mb-1">
                A. Cuadrícula Bento Header (4 Tarjetas Operativas Clave)
              </div>
              <p className="text-[10px] text-neutral-600">
                Centraliza las 4 métricas críticas de flujo: <strong>Producción Acumulada</strong> (unidades totales y tiradas), <strong>Lotes Liberados</strong> (aprobación Ficha F-0101 con porcentaje), <strong>En Proceso / Tránsito</strong> (lotes activos en planta) y <strong>Lotes Retenidos</strong> (alerta preventiva de no conformidad con bloqueo de despacho).
              </p>
            </div>

            <div className="border border-neutral-200 p-2.5 rounded bg-white">
              <div className="font-bold text-[10.5px] text-[#0D3B22] mb-1">
                B. Evolución de Producción Diaria vs. Meta (30.000 UND/día)
              </div>
              <p className="text-[10px] text-neutral-600">
                Visualización a <strong>ancho completo (full-width)</strong> con barras diarias estilizadas y línea punteada de meta de planta. Incluye cálculo automático de días activos, promedio diario y tooltips detallados por tirada.
              </p>
            </div>

            <div className="border border-neutral-200 p-2.5 rounded bg-white">
              <div className="font-bold text-[10.5px] text-[#0D3B22] mb-1">
                C. Simetría Inferior: Estados, Auditoría y Gráfico Donut
              </div>
              <p className="text-[10px] text-neutral-600">
                Estructura balanceada en dos columnas coordinadas en altura: la columna izquierda integra el <strong>Gráfico de Barras de Trazabilidad</strong> arriba y el <strong>Timeline de Actividad Reciente</strong> en tiempo real abajo, alineada con el <strong>Donut Chart de Eficiencia por Turno y Máquina</strong> en la columna derecha.
              </p>
            </div>

            <div className="border border-neutral-200 p-2.5 rounded bg-white">
              <div className="font-bold text-[10.5px] text-[#0D3B22] mb-1">
                D. Exportación de Lotes a CSV / Excel con UTF-8 BOM
              </div>
              <p className="text-[10px] text-neutral-600">
                Botón integrado en la barra de filtros que descarga instantáneamente la sábana de lotes del período seleccionado en formato delimitado por punto y coma, con codificación compatible con acentos y caracteres de Microsoft Excel.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 2: INICIAR PRODUCCIÓN */}
        {/* ========================================================================= */}
        <section id="sec-iniciar" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">2</span>
              <span>Módulo 2 · Iniciar Producción (Emisión de Tiradas & Etiquetas Zebra)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /iniciar</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Punto de entrada físico en planta donde el operador de máquina registra la tirada de producción y emite las etiquetas térmicas con código QR para cada uno de los paquetes o pallets.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Protocolo de Registro de Tirada:</div>
            <ol className="list-decimal pl-5 space-y-1.5 text-neutral-700">
              <li>
                <strong>Código Interno Automatizado:</strong> El sistema asigna un folio secuencial único de 9 dígitos que inicia en la base <code>110000000+</code>.
              </li>
              <li>
                <strong>Generación de Lotes Consecutivos:</strong> A partir del correlativo base <code>10000+</code>, cada tirada genera 10 lotes individuales consecutivos (por ejemplo, del lote 10001 al 10010).
              </li>
              <li>
                <strong>Parámetros de Operación:</strong> Se selecciona Máquina (Línea 1, 2, 3), Turno (1, 2, 3), Operador (1 a 10), Tipo de Artículo (Bidón 20L, Bidón 5L, etc.), Material (HDPE Virgen, PCR Reciclado), Color de Bidón y Color de Asa.
              </li>
              <li>
                <strong>Previsualización en Vivo de la Etiqueta Zebra:</strong> Antes de confirmar, el operador visualiza el ticket térmico exacto que se imprimirá, incluyendo el código QR que enlaza a la trazabilidad pública.
              </li>
              <li>
                <strong>Emisión Térmica:</strong> Al confirmar, el sistema registra los 10 registros en PostgreSQL y lanza la impresión térmica en impresoras Zebra ZPL o formato Web directo.
              </li>
            </ol>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 3: PRODUCCIÓN Y SÁBANA */}
        {/* ========================================================================= */}
        <section id="sec-produccion" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">3</span>
              <span>Módulo 3 · Producción & Sábana de Lotes (Trazabilidad Continua)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /produccion</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Constituye el corazón operativo de la trazabilidad. Permite auditar, filtrar y modificar el estado de cada tirada y de cada lote individual a medida que avanza por la cadena logística de planta.
          </p>

          <div className="border border-black p-3 mb-3 bg-white">
            <div className="font-bold text-[11px] mb-1.5 text-neutral-900">
              Secuencia Oficial del Flujo de Estados Operativos:
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
              <span className="px-2.5 py-1 rounded bg-[#15803D] text-white">1. Producción</span>
              <span>➔</span>
              <span className="px-2.5 py-1 rounded bg-[#1D4ED8] text-white">2. Almacenaje</span>
              <span>➔</span>
              <span className="px-2.5 py-1 rounded bg-[#6D28D9] text-white">3. Despacho</span>
              <span>➔</span>
              <span className="px-2.5 py-1 rounded bg-[#059669] text-white">4. Liberado (Calidad)</span>
              <span>|</span>
              <span className="px-2.5 py-1 rounded bg-[#DC2626] text-white">5. Retenido (Alerta)</span>
            </div>
          </div>

          <div className="space-y-2 text-[10.5px] text-neutral-700">
            <p>
              • <strong>Filtros Temporales Inteligentes:</strong> La sábana se inicializa de forma predeterminada con el rango del mes en curso (desde el 1° del mes hasta el día actual), optimizando el rendimiento y mostrando siempre los lotes vigentes, con la opción de restaurar el rango con el botón <em>"Mes en curso"</em>.
            </p>
            <p>
              • <strong>Expansión de la Sábana:</strong> Al hacer clic sobre cualquier fila de código interno, se despliega la sábana interna mostrando los 10 lotes hijos, su peso registrado, operador, estado actual, botón de reimpresión de ticket y acceso al historial inmutable.
            </p>
            <p>
              • <strong>Cambio de Estado Masivo o Individual:</strong> Se puede cambiar el estado de toda la tirada en bloque o de un lote específico (por ejemplo, retener un bidón con defecto de espesor sin frenar el resto del pallet). Cada cambio exige observaciones y queda registrado en la bitácora con usuario, fecha y hora UTC.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 4: CERTIFICADOS DE CALIDAD */}
        {/* ========================================================================= */}
        <section id="sec-certificados" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">4</span>
              <span>Módulo 4 · Certificados de Calidad R-CAL-07</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /certificados</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Módulo normativo reservado para la emisión de los certificados oficiales de conformidad técnica e inocuidad alimentaria que acompañan a cada despacho comercial.
          </p>

          <div className="p-3 bg-amber-50 border border-amber-300 rounded text-[10.5px] text-amber-900 mb-3 space-y-1.5">
            <strong className="block mb-1 text-amber-950 font-bold uppercase tracking-wide">REGLA DE NEGOCIO CRÍTICA DE CALIDAD & BLOQUEO PREVENTIVO:</strong>
            <p>
              1. <strong>Elegibilidad Operativa:</strong> Únicamente los lotes en estado <strong>"Despacho"</strong> o <strong>"Liberado"</strong> son elegibles para emitir certificados R-CAL-07. Lotes en <em>Producción</em>, <em>Almacenaje</em> o <em>Retenido</em> están estrictamente bloqueados por el sistema.
            </p>
            <p>
              2. <strong>Campos Obligatorios Ineludibles:</strong> No es posible imprimir ni emitir un certificado si alguno de los siguientes 5 campos se encuentra vacío: <strong>Nombre del Cliente</strong>, <strong>N° de Despacho</strong>, <strong>N° de Factura</strong>, <strong>Responsable de Aprobación</strong> y <strong>Cargo / Departamento</strong>.
            </p>
            <p>
              3. <strong>Valores Vacíos por Defecto:</strong> Para salvaguardar la veracidad legal y técnica del documento, el sistema inicializa todos estos campos vacíos por defecto, prohibiendo precargas automáticas no auditadas.
            </p>
          </div>

          <div className="space-y-1.5 text-[10.5px] text-neutral-700">
            <p>
              • <strong>Validación en Tiempo Real:</strong> El botón <em>"Imprimir / PDF"</em> permanece deshabilitado hasta que se guarden los 5 metadatos obligatorios en la base de datos de producción.
            </p>
            <p>
              • <strong>Estandarización del Documento:</strong> Diseño corporativo formal con código oficial R-CAL-07, declaraciones de conformidad técnica Ficha Nº 0101, condiciones de almacenamiento hasta 18 meses y firma digital de jefatura.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 5: CONSULTA PÚBLICA QR */}
        {/* ========================================================================= */}
        <section id="sec-qr" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">5</span>
              <span>Módulo 5 · Consulta Pública de Trazabilidad (Escaneo QR)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /trazabilidad/:uid</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Permite a clientes, operadores logísticos, recicladores finales y fiscalizadores de la Superintendencia del Medio Ambiente verificar la autenticidad del envase escaneando directamente con su smartphone el código QR de la etiqueta Zebra.
          </p>

          <div className="border border-neutral-200 p-2.5 rounded bg-white text-[10px] space-y-1 text-neutral-700">
            <p>• <strong>Acceso Público Seguro:</strong> No requiere usuario ni contraseña; consulta de forma segura un endpoint de solo lectura (<code>/api/public/trazabilidad/:uid</code>).</p>
            <p>• <strong>Ficha de Origen:</strong> Expone fecha de fabricación, máquina, turno, resina empleada, porcentaje de PCR, estado del lote y certificación de conformidad.</p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 6: CONFIGURACIÓN GLOBAL */}
        {/* ========================================================================= */}
        <section id="sec-config" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">6</span>
              <span>Módulo 6 · Configuración del Sistema & Ajustes de Sesión</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /configuracion</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Exclusivo para administradores del sistema. Permite parametrizar las políticas globales de seguridad operacional y gobernanza de datos de la plataforma en AWS RDS.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 text-[10.5px] space-y-2 text-neutral-700">
            <div className="font-bold text-neutral-900">Control de Inactividad de Sesión:</div>
            <p>
              Previene que terminales de planta o estaciones de trabajo queden abiertas sin supervisión. El administrador puede parametrizar el tiempo de expiración entre <strong>5 y 480 minutos</strong> (con preajustes recomendados de 15 min para planta compartida, 30 min estándar, 60 min supervisores y 120 min administración).
            </p>
            <p>
              Un detector global monitorea actividad de teclado, ratón y toques. Cuando resta <strong>1 minuto</strong> para el cierre, despliega un aviso modal en pantalla con cuenta regresiva en segundos, permitiendo extender la sesión o cerrarla de manera segura.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 7: USUARIOS Y ROLES */}
        {/* ========================================================================= */}
        <section id="sec-usuarios" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">7</span>
              <span>Módulo 7 · Administración de Usuarios & Matriz RBAC</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /usuarios</span>
          </div>

          <div className="border border-black overflow-hidden mb-3">
            <table className="w-full text-center border-collapse text-[9.5px]">
              <thead>
                <tr className="bg-neutral-100 border-b border-black font-bold">
                  <th className="border-r border-black p-1.5">Rol</th>
                  <th className="border-r border-black p-1.5">Dashboard</th>
                  <th className="border-r border-black p-1.5">Iniciar Prod.</th>
                  <th className="border-r border-black p-1.5">Sábana & Lotes</th>
                  <th className="border-r border-black p-1.5">Certificados</th>
                  <th className="border-r border-black p-1.5">Configuración</th>
                  <th className="p-1.5">Usuarios</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="border-r border-black p-1.5 font-bold text-left px-2">Administrador</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="p-1.5 text-emerald-700 font-bold">Total</td>
                </tr>
                <tr className="border-b border-neutral-200">
                  <td className="border-r border-black p-1.5 font-bold text-left px-2">Jefatura</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Emitir / Auditar</td>
                  <td className="border-r border-black p-1.5 text-neutral-400">Sin acceso</td>
                  <td className="p-1.5 text-neutral-400">Sin acceso</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-left px-2">Colaborador / Planta</td>
                  <td className="border-r border-black p-1.5 text-neutral-600">Visualizar</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Registrar</td>
                  <td className="border-r border-black p-1.5 text-neutral-600">Consulta</td>
                  <td className="border-r border-black p-1.5 text-neutral-400">Sin acceso</td>
                  <td className="border-r border-black p-1.5 text-neutral-400">Sin acceso</td>
                  <td className="p-1.5 text-neutral-400">Sin acceso</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 8: PREGUNTAS FRECUENTES (FAQ) Y CONTINGENCIAS */}
        {/* ========================================================================= */}
        <section id="sec-faq" className="mb-6 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">8</span>
              <span>Sección 8 · Preguntas Frecuentes (FAQ) & Protocolos de Contingencia</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Soporte Técnico</span>
          </div>

          <div className="space-y-3 text-[10.5px]">
            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P1: ¿Por qué no puedo emitir el certificado de un lote recién producido?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Por política estricta de calidad, un lote no puede certificarse mientras esté en estado <em>Producción</em> o <em>Almacenaje</em>. Debe avanzar primero a <strong>Despacho</strong> o ser evaluado e inspeccionado por el área de Aseguramiento de Calidad para pasar a <strong>Liberado</strong>.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P2: ¿Cómo proceder si un bidón sale con defecto durante la tirada?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Ingrese a <em>Producción & Sábana</em>, localice el código interno de la tirada y despliegue los lotes. Busque el lote específico afectado, presione el botón de estado y cámbielo a <strong>Retenido</strong> indicando en las notas el motivo (ej. <em>"Falla de espesor en asa, retenido para molienda interna"</em>). El resto de los 9 lotes continuará su ciclo normal.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P3: ¿Qué hacer si la impresora Zebra se queda sin etiquetas o se traba?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> No vuelva a crear la tirada para evitar duplicar códigos internos. Una vez resuelto el problema mecánico de la impresora, abra la sábana de la tirada creada y presione el icono de impresora en el lote que necesite reimprimir.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P4: ¿Por qué se cerró mi sesión mientras estaba en la línea de soplado?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Por protocolo de ciberseguridad, el sistema cuenta con un temporizador de inactividad configurable (por defecto 30 minutos). Si transcurre el tiempo sin interacción, la sesión se cierra automáticamente. Para evitarlo, preste atención a la advertencia sonora y visual que se muestra 60 segundos antes del vencimiento y pulse <em>"Extender Sesión"</em>.
              </p>
            </div>
          </div>
        </section>

        {/* Firmas y Cierre Formal del Documento */}
        <div className="grid grid-cols-12 pt-6 mt-10 border-t border-neutral-300 break-inside-avoid">
          <div className="col-span-6 flex flex-col justify-end items-center text-center">
            <div className="w-48 border-b-2 border-black mb-1">
              <div className="text-[10px] text-neutral-400 italic mb-1 select-none">
                Firmado digitalmente
              </div>
            </div>
            <div className="font-bold text-xs uppercase tracking-tight">
              Susana Avila C.
            </div>
            <div className="font-bold text-[9px] uppercase tracking-wider text-neutral-600">
              Jefatura de Calidad & SGI · Bioplast Chile
            </div>
          </div>

          <div className="col-span-6 flex flex-col justify-end items-center text-center">
            <div className="w-48 border-b-2 border-black mb-1">
              <div className="text-[10px] text-neutral-400 italic mb-1 select-none">
                Firmado digitalmente
              </div>
            </div>
            <div className="font-bold text-xs uppercase tracking-tight">
              Roderick Espinoza V.
            </div>
            <div className="font-bold text-[9px] uppercase tracking-wider text-neutral-600">
              Dirección de Tecnologías & Operaciones
            </div>
          </div>
        </div>

        {/* Pie de página oficial */}
        <div className="mt-8 text-center text-[8.5px] text-neutral-400 font-mono">
          Bioplast Chile SpA · Sistema de Gestión Integrado (SGI) · Documento Controlado MAN-SGI-01 · Planta Quilicura, Santiago, Chile.
        </div>
      </div>
    </div>
  );
};
