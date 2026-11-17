import React from 'react';
import { 
  CheckCircle2, ShieldCheck, HelpCircle, Layers, 
  FileCheck, QrCode, Settings, Users, AlertTriangle, ArrowRight,
  Factory, Calendar, Award, BookOpen, Clock, Lock, Sparkles, Check,
  Sliders, UserCheck, Package, Printer, Barcode, Scan, Camera
} from 'lucide-react';

interface ManualDocumentProps {
  onPrint?: () => void;
  activeSectionId?: string;
}

export const ManualDocument: React.FC<ManualDocumentProps> = ({ activeSectionId }) => {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Banner (Hidden when printing) - No duplicate print button */}
      <div className="w-full max-w-[900px] flex flex-col sm:flex-row justify-between items-center mb-6 no-print px-2 gap-3">
        <div className="flex items-center gap-2.5 text-sm text-[#0D3B22]">
          <ShieldCheck className="w-5 h-5 text-[#15803D]" />
          <div>
            <span className="font-bold">Manual de Usuario & Operaciones de Planta · MAN-SGI-01</span>
            <span className="block text-[11px] text-neutral-500">
              Guía Operativa Oficial · Bioplast Chile SpA · Planta Quilicura
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803D] text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
            <span>Versión v3.5 Vigente</span>
          </div>
        </div>
      </div>

      {/* Official Manual Document Container */}
      <div 
        id="manual-printable-area"
        className="printable-area bg-white text-black p-6 sm:p-12 w-full max-w-[900px] shadow-lg border border-neutral-300 font-sans text-xs leading-relaxed"
        style={{ fontFamily: '"Arial", "Helvetica", sans-serif' }}
      >
        {/* Header 3-Column Box */}
        <div className="border border-black grid grid-cols-12 mb-6">
          {/* Col 1: Logo Bioplast */}
          <div className="col-span-3 border-r border-black p-3 flex flex-col items-center justify-center text-center bg-neutral-50">
            <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-[#0D3B22]">
              <span className="w-4 h-4 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">B</span>
              <span>BIOPLAST</span>
            </div>
            <span className="text-[8px] font-mono tracking-widest text-[#15803D] uppercase font-bold mt-0.5">
              CHILE SpA
            </span>
            <span className="text-[7.5px] text-neutral-500 mt-1">Planta Quilicura</span>
          </div>

          {/* Col 2: Document Title */}
          <div className="col-span-6 border-r border-black p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">
              Sistema de Gestión Integrado (SGI)
            </span>
            <h1 className="font-extrabold text-xs sm:text-sm uppercase tracking-wide text-black mt-0.5">
              Manual de Usuario & Operaciones
            </h1>
            <span className="text-[9px] font-semibold text-neutral-700 mt-0.5">
              Guía de Operación Paso a Paso de Módulos de Planta
            </span>
          </div>

          {/* Col 3: Metadata Box */}
          <div className="col-span-3 p-2 text-[8.5px] font-mono space-y-1 flex flex-col justify-center bg-neutral-50">
            <div><strong>CÓDIGO:</strong> MAN-SGI-01</div>
            <div><strong>REVISIÓN:</strong> v3.5</div>
            <div><strong>FECHA:</strong> 17-Nov-2026</div>
            <div><strong>PÁGINA:</strong> 1 de 1</div>
          </div>
        </div>

        {/* Control de Revisiones del Documento */}
        <div className="mb-6">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-neutral-700 mb-1 flex items-center justify-between">
            <span>Historial y Control de Versiones</span>
            <span className="font-mono text-neutral-400">ISO 9001:2015 § 7.5.3</span>
          </div>
          <table className="w-full text-center border border-black border-collapse text-[8.5px]">
            <thead>
              <tr className="bg-neutral-100 border-b border-black font-bold">
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
                <td className="border-r border-black p-1 font-mono">v3.0</td>
                <td className="border-r border-black p-1">16-Nov-2026</td>
                <td className="border-r border-black p-1">Equipo TI</td>
                <td className="border-r border-black p-1">Jefatura Calidad</td>
                <td className="border-r border-black p-1">Dirección General</td>
                <td className="p-1 text-left px-2">Lote único por emisión y correlativo de embalajes 0001-NNNN.</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="border-r border-black p-1 font-mono">v3.3</td>
                <td className="border-r border-black p-1">16-Nov-2026</td>
                <td className="border-r border-black p-1">Equipo TI</td>
                <td className="border-r border-black p-1">Control de Calidad</td>
                <td className="border-r border-black p-1">Gerencia Operaciones</td>
                <td className="p-1 text-left px-2">Modo Continuo de Gestión de Estados: soporte Pistola QR y Cámara Celular con regla estricta de flujo.</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="border-r border-black p-1 font-mono">v3.4</td>
                <td className="border-r border-black p-1">16-Nov-2026</td>
                <td className="border-r border-black p-1">Equipo TI</td>
                <td className="border-r border-black p-1">Control de Calidad</td>
                <td className="border-r border-black p-1">Gerencia Operaciones</td>
                <td className="p-1 text-left px-2">Blindaje de formulario de producción con atributos bloqueados de solo lectura y retiro de accesos directos redundantes.</td>
              </tr>
              <tr className="bg-emerald-50/50">
                <td className="border-r border-black p-1 font-mono font-bold">v3.5</td>
                <td className="border-r border-black p-1 font-bold">17-Nov-2026</td>
                <td className="border-r border-black p-1">Equipo TI</td>
                <td className="border-r border-black p-1">Control de Calidad</td>
                <td className="border-r border-black p-1">Gerencia Operaciones</td>
                <td className="p-1 text-left px-2 font-medium">Unificación total a Código Interno, Embudo de Operadores (Funnel Chart) en Dashboard, botón único Exportar a PDF y reescritura de manual para usuario final.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Declaración de Propósito y Alcance para el Usuario */}
        <div className="mb-6 p-3 bg-neutral-50 border border-neutral-300 rounded-lg text-[10.5px] leading-relaxed text-neutral-800">
          <div className="font-bold uppercase tracking-wider text-neutral-900 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Propósito de la Plataforma & Guía Rápida</span>
          </div>
          <p className="text-justify">
            Este manual explica de forma clara y sencilla cómo utilizar cada pantalla de la plataforma <strong>appbpch.raevsi.cl</strong>. Su objetivo es acompañar a los operarios, jefes de turno, personal de calidad y bodega en sus labores cotidianas, asegurando que cada envase fabricado en Planta Quilicura cuente con su etiqueta térmica, código QR y registro de avance en el sistema.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 1: DASHBOARD EJECUTIVO */}
        {/* ========================================================================= */}
        <section id="sec-dashboard" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">1</span>
              <span>Módulo 1 · Dashboard Ejecutivo (Control de Planta)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Menú: Dashboard</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Es la pantalla de inicio del sistema. Te muestra en tiempo real cómo avanza la producción de la planta, el total de unidades fabricadas y el estado de los lotes.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">¿Qué encuentras en esta pantalla?</div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
              <li><strong>Barra de Filtros Superiores:</strong> Permite filtrar por fechas (Hoy, 7 días, Este Mes o fechas personalizadas) y por tipo de resina plástica (HDPE, rPET, PET).</li>
              <li><strong>Botón "Exportar Lotes":</strong> Descarga un archivo Excel/CSV con el detalle de todos los lotes producidos en el rango seleccionado.</li>
              <li><strong>Tarjetas de Resumen (KPIs):</strong> Muestran Producción Acumulada (en unidades), Lotes Liberados por Calidad, Lotes en Proceso y Lotes Retenidos (en cuarentena).</li>
              <li><strong>Distribución por Estados:</strong> Gráfico de barras que indica cuántos lotes se encuentran en cada una de las etapas: <em>Producción, Almacenaje, Despacho, Liberado o Retenido</em>.</li>
              <li><strong>Embudo de Producción por Operador (Funnel Chart):</strong> Gráfico escalonado que destaca el volumen de lotes y unidades producidas por cada operador de máquina en el período, facilitando el balance de carga de trabajo.</li>
              <li><strong>Pestaña de Transiciones en Vivo:</strong> Bitácora en tiempo real que lista los últimos envases que cambiaron de estado, indicando quién realizó el movimiento y la hora exacta.</li>
            </ul>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 2: CÓDIGOS INTERNOS */}
        {/* ========================================================================= */}
        <section id="sec-codigos-sap" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">2</span>
              <span>Módulo 2 · Catálogo de Códigos Internos</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Menú: Códigos Internos</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            En este módulo se encuentra el catálogo oficial de todos los productos y envases que fabrica Bioplast Chile. Cada artículo tiene un <strong>Código Interno</strong> único que reúne todas sus características.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Datos registrados por cada artículo:</div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
              <li><strong>Código Interno:</strong> Número identificador único del envase (ej: <code>10024</code>).</li>
              <li><strong>Artículo / Denominación:</strong> Nombre oficial del envase (ej: <code>BIDON 5L RECTANGULAR NATURAL</code>).</li>
              <li><strong>Materia Prima:</strong> Tipo de plástico asociado (ej: <code>HDPE VIRGEN</code> o <code>HDPE PCR RECICLADO</code>). Se asigna automáticamente para evitar errores de tipeo.</li>
              <li><strong>Color de Bidón y Color de Asa:</strong> Colores preestablecidos en la ficha técnica del producto.</li>
              <li><strong>Cantidad Estándar por Pallet:</strong> Número de bidones que componen una unidad de embalaje habitual.</li>
            </ul>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 3: OPERADORES DE PLANTA */}
        {/* ========================================================================= */}
        <section id="sec-operadores" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">3</span>
              <span>Módulo 3 · Operadores de Planta</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Menú: Operadores</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Administra la lista de operarios autorizados para fabricar tiradas y operar las sopladoras de la planta.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Instrucciones de Uso:</div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
              <li><strong>Registrar nuevo operario:</strong> Presiona el botón <em>"+ Nuevo Operador"</em>, ingresa su nombre completo, RUT y código asignado.</li>
              <li><strong>Activar / Desactivar:</strong> Si un operario ya no está en turno o deja la empresa, haz clic en el botón de alternar estado. Por seguridad y auditoría histórica, los operarios <strong>no se eliminan</strong> para conservar el historial de etiquetas impresas en el pasado.</li>
            </ul>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 4: INICIAR PRODUCCIÓN */}
        {/* ========================================================================= */}
        <section id="sec-iniciar" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">4</span>
              <span>Módulo 4 · Iniciar Producción & Emisión de Tickets</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Menú: Iniciar Producción</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Este es el módulo principal del operador en la línea de soplado. Permite registrar una tirada de fabricación y generar las etiquetas térmicas Zebra con código QR que irán pegadas en cada pallet o paquete.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Paso a Paso para Emitir una Tirada:</div>
            <ol className="list-decimal pl-5 space-y-1.5 text-neutral-700">
              <li>
                <strong>Paso 1 · Seleccionar el Código Interno:</strong> En la sección 1, despliega la lista y elige el artículo a fabricar. Notarás que el <em>Artículo</em>, <em>Materia Prima</em>, <em>Color</em> y <em>Color Asa</em> se completan automáticamente y quedan protegidos (no se pueden modificar a mano, evitando equivocaciones).
              </li>
              <li>
                <strong>Paso 2 · Datos de la Máquina:</strong> Indica el número de máquina sopladora (ej. 7), el turno operacional (1, 2 o 3) y selecciona el nombre del operario responsable de la tirada.
              </li>
              <li>
                <strong>Paso 3 · Cantidad y Embalajes:</strong> Define cuántos envases lleva cada bulto/pallet y cuántas unidades de embalaje vas a producir (ej. 10 embalajes numerados del 0001 al 0010). Puedes anotar el peso promedio si aplica.
              </li>
              <li>
                <strong>Paso 4 · Emitir Tirada:</strong> El botón <em>"Emitir Tirada"</em> estará bloqueado hasta que selecciones un Código Interno válido. Al presionarlo, el sistema guarda la producción en la base de datos y <strong>limpia de inmediato la sección del artículo</strong> para que no se repita por error en la siguiente tirada.
              </li>
              <li>
                <strong>Paso 5 · Imprimir Tickets:</strong> Se habilitará el botón verde <em>"Imprimir Tickets"</em> para enviar a imprimir las etiquetas en formato oficial Zebra ZPL con su código QR.
              </li>
            </ol>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 5: PRODUCCIÓN Y SÁBANA DE LOTES */}
        {/* ========================================================================= */}
        <section id="sec-produccion" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">5</span>
              <span>Módulo 5 · Producción & Sábana de Lotes</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Menú: Producción & Sábana</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Permite consultar todas las tiradas fabricadas en la historia de la planta. Agrupa la información por <strong>Número de Lote</strong> y permite desplegar cada unidad de embalaje individual (del 0001 al 00NN).
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Funcionalidades Principales:</div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
              <li><strong>Búsqueda Rápida:</strong> Puedes buscar por número de lote, código interno, artículo u operario.</li>
              <li><strong>Desplegar Embalajes:</strong> Al hacer clic en un lote, verás cada una de sus unidades con su estado actual (ej. Almacenaje o Despacho).</li>
              <li><strong>Reimpresión de Etiquetas:</strong> Si una etiqueta física se deterioró o despegó, puedes reimprimir el ticket individual o el lote completo desde el botón con ícono de impresora.</li>
            </ul>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 6: GESTIÓN DE ESTADOS (PISTOLA QR & CÁMARA) */}
        {/* ========================================================================= */}
        <section id="sec-gestion-estados" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">6</span>
              <span>Módulo 6 · Gestión de Estados (Pistola QR & Cámara Celular)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Menú: Gestión Estado</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Diseñado para mover rápidamente los envases de una etapa a otra mediante escaneo de código QR en la bodega o patio de despacho. Funciona tanto con pistola lectora conectada al computador como con la cámara del celular.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Regla Obligatoria de Avance de Estados:</div>
            <p className="text-neutral-700">
              Para garantizar la calidad ante los clientes y auditorías, el sistema exige cumplir el flujo oficial:
            </p>
            <div className="p-2 rounded bg-white border border-[#15803D]/30 font-bold text-center text-[#0D3B22] font-mono text-xs">
              Producción ➔ Almacenaje ➔ Despacho ➔ Liberado / Retenido
            </div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-700 mt-1">
              <li>Un envase recién soplado parte en <strong>Producción</strong>.</li>
              <li>Al entrar a bodega, debe pistolearse a <strong>Almacenaje</strong>.</li>
              <li>Al prepararse en pallet para despacho, pasa a <strong>Despacho</strong>.</li>
              <li>Tras la inspección final de calidad, se autoriza a <strong>Liberado</strong>.</li>
              <li>En cualquier momento, si un envase tiene fallas o golpes, se puede enviar directamente a <strong>Retenido</strong> (cuarentena).</li>
            </ul>

            <div className="font-bold text-neutral-900 underline mt-3">¿Cómo usar la lectura en Modo Continuo?</div>
            <ol className="list-decimal pl-5 space-y-1.5 text-neutral-700">
              <li>
                <strong>Elige el Estado Destino:</strong> En la parte superior de la pantalla, selecciona a qué estado quieres pasar los envases (ej. <em>"Mover a Almacenaje"</em> o <em>"Mover a Despacho"</em>).
              </li>
              <li>
                <strong>Escanea el Código QR:</strong> Apunta con la pistola lectora o enfoca con la cámara del celular al código QR de la etiqueta.
              </li>
              <li>
                <strong>Confirmación:</strong>
                <ul className="list-disc pl-5 mt-0.5 space-y-0.5">
                  <li><span className="text-emerald-700 font-bold">Si el flujo es correcto:</span> Suena un pitido agudo (beep), la pantalla muestra un mensaje verde de éxito indicando el lote y número de embalaje, y se añade a la lista de escaneados.</li>
                  <li><span className="text-red-700 font-bold">Si el salto no es válido:</span> Suena una alerta y la pantalla te explica en rojo por qué no se puede pasar (ej. <em>"No puedes pasar directo de Producción a Despacho sin ingresar a Almacenaje"</em>).</li>
                </ul>
              </li>
            </ol>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 7: CERTIFICADOS DE CALIDAD */}
        {/* ========================================================================= */}
        <section id="sec-certificados" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">7</span>
              <span>Módulo 7 · Certificados de Calidad R-CAL-07</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Menú: Certificados</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Permite al área de Calidad emitir los certificados oficiales que se entregan al cliente junto con el pedido.
          </p>

          <div className="p-3 bg-neutral-50 border border-neutral-300 rounded text-[10.5px] text-neutral-700 mb-3 space-y-1.5">
            <p>
              • <strong>Requisito de Estado:</strong> Solo aparecen disponibles para certificar aquellos lotes que ya alcanzaron el estado <em>Despacho</em> o <em>Liberado</em>.
            </p>
            <p>
              • <strong>Descarga en PDF:</strong> Al seleccionar el lote, puedes revisar en pantalla los parámetros de inocuidad y resistencia, y presionar <em>"Descargar Certificado PDF"</em> para entregárselo al cliente.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 8: CONSULTA PÚBLICA QR */}
        {/* ========================================================================= */}
        <section id="sec-qr" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">8</span>
              <span>Módulo 8 · Consulta Pública de Trazabilidad QR</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Escaneo de etiqueta por el cliente</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Cualquier cliente o auditor externo que escanee con su teléfono celular el código QR de un bidón entrará directamente a esta página pública, <strong>sin necesidad de iniciar sesión</strong>.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-1 text-[10.5px] text-neutral-700">
            <div>• <strong>Información que ve el cliente:</strong> Nombre del producto, tipo de plástico (reciclado o virgen), lote de fabricación, fecha de soplado y confirmación de que fue elaborado en Bioplast Chile SpA.</div>
            <div>• <strong>Seguridad:</strong> El cliente no puede modificar ningún dato, solo comprobar la autenticidad del envase.</div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 9: CONFIGURACIÓN GLOBAL */}
        {/* ========================================================================= */}
        <section id="sec-config" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">9</span>
              <span>Módulo 9 · Configuración Global del Sistema</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Menú: Configuración</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Módulo reservado para Administradores y Jefatura. Permite ajustar parámetros generales como el <strong>tiempo de inactividad de sesión</strong> (para que el sistema se bloquee automáticamente si se deja desatendido) y gestionar qué módulos puede ver cada rol de usuario.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 10: USUARIOS Y PERMISOS */}
        {/* ========================================================================= */}
        <section id="sec-usuarios" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">10</span>
              <span>Módulo 10 · Usuarios & Permisos de Acceso</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Menú: Usuarios</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Cada trabajador de la planta tiene un usuario y contraseña asociado a un rol específico, asegurando que cada persona acceda a las herramientas que le corresponden en su puesto:
          </p>

          <div className="border border-black overflow-hidden mb-3">
            <table className="w-full text-center border-collapse text-[9px]">
              <thead>
                <tr className="bg-neutral-100 border-b border-black font-bold">
                  <th className="border-r border-black p-1.5 text-left">Rol de Usuario</th>
                  <th className="border-r border-black p-1.5">Módulos que puede usar</th>
                  <th className="p-1.5">Responsabilidad en Planta</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="border-r border-black p-1.5 font-bold text-left px-2">Administrador / Gerencia</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-semibold">Acceso total a todos los módulos</td>
                  <td className="p-1.5 text-left text-neutral-700 px-2">Gestión global, configuración y usuarios.</td>
                </tr>
                <tr className="border-b border-neutral-200">
                  <td className="border-r border-black p-1.5 font-bold text-left px-2">Jefatura de Turno / Operaciones</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-semibold">Dashboard, Producción, Operadores, Estados, Certificados</td>
                  <td className="p-1.5 text-left text-neutral-700 px-2">Supervisión diaria de línea y control de avance.</td>
                </tr>
                <tr className="border-b border-neutral-200">
                  <td className="border-r border-black p-1.5 font-bold text-left px-2">Control de Calidad</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-semibold">Dashboard, Gestión Estados, Certificados R-CAL-07</td>
                  <td className="p-1.5 text-left text-neutral-700 px-2">Inspección, liberación de lotes y cuarentena de retenidos.</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-left px-2">Operador de Planta / Bodega</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-semibold">Iniciar Producción, Gestión de Estados, Sábana</td>
                  <td className="p-1.5 text-left text-neutral-700 px-2">Fabricación, impresión de tickets y pistoleo en bodega.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 11: PREGUNTAS FRECUENTES (FAQ) PARA PLANTA */}
        {/* ========================================================================= */}
        <section id="sec-faq" className="mb-6 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">11</span>
              <span>Sección 11 · Preguntas Frecuentes (FAQ) de Planta</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ayuda Operativa</span>
          </div>

          <div className="space-y-3 text-[10.5px]">
            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P1: ¿Por qué no puedo editar la materia prima ni los colores en Iniciar Producción?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Están protegidos intencionalmente para evitar equivocaciones. Al seleccionar el Código Interno del artículo, el sistema carga automáticamente la resina oficial (ej. HDPE Virgen) y sus colores correspondientes según la ficha técnica aprobada.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P2: ¿Qué debo hacer si el botón "Emitir Tirada" aparece deshabilitado?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Revisa la parte superior del formulario: debes seleccionar obligatoriamente un <em>Código Interno</em> en el menú desplegable. Una vez elegido el producto, el botón se pondrá verde y podrás emitir la tirada.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P3: ¿Qué significa si al pistolear un código QR la pantalla dice "Transición Rechazada"?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Significa que estás intentando saltarte un paso obligatorio. Recuerda la regla: <code>Producción ➔ Almacenaje ➔ Despacho ➔ Liberado</code>. Por ejemplo, no puedes pasar un envase directamente de <em>Producción</em> a <em>Despacho</em> sin haberlo ingresado antes a bodega en <em>Almacenaje</em>.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P4: ¿Cómo aparto un envase que salió defectuoso o con golpes?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> En el módulo <em>Gestión de Estados</em>, selecciona en la parte superior el estado <em>"Mover a Retenido"</em> y escanea la etiqueta del envase. El envase quedará bloqueado en cuarentena hasta que Calidad defina su disposición.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P5: ¿Qué hago si la impresora Zebra se atascó o una etiqueta salió borrosa?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Ingresa al módulo <em>"Producción & Sábana"</em>, busca el número de lote de tu tirada, haz clic sobre él para ver los embalajes y presiona el ícono de impresora para reimprimir únicamente la etiqueta dañada.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P6: ¿Cómo exporto este manual completo a un archivo PDF?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> En la parte superior derecha de esta pantalla encontrarás el botón verde <strong>"Exportar a PDF"</strong>. Al presionarlo se abrirá la ventana de impresión de tu navegador, donde podrás seleccionar "Guardar como PDF".
              </p>
            </div>
          </div>
        </section>

        {/* Pie de página oficial y limpio - Sin bloque de firmas */}
        <div className="mt-8 pt-4 border-t border-neutral-300 text-center text-[9px] text-neutral-500 font-mono">
          Bioplast Chile SpA · Sistema de Gestión Integrado (SGI) · Documento Controlado MAN-SGI-01 · Planta Quilicura, Santiago, Chile.
        </div>
      </div>
    </div>
  );
};