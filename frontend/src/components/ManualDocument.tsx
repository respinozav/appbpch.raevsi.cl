import React from 'react';
import { 
  Printer, CheckCircle2, ShieldCheck, HelpCircle, Layers, 
  FileCheck, QrCode, Settings, Users, AlertTriangle, ArrowRight,
  Factory, Calendar, Award, BookOpen, Clock, Lock, Sparkles, Check,
  Database, Tag, PackageCheck, Barcode, Users2
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
            <span>Versión v3.4 Vigente</span>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-[#0D3B22] text-white hover:bg-[#15803D] shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Exportar PDF</span>
          </button>
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
              Versión: <span className="font-bold">v3.4</span>
            </div>
            <div className="border-b border-black p-1 px-2 font-medium">
              Actualización: <span className="font-bold">16-Nov-2026</span>
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
                <td className="border-r border-black p-1 font-mono">v3.0</td>
                <td className="border-r border-black p-1">16-Nov-2026</td>
                <td className="border-r border-black p-1">Tech Lead TI</td>
                <td className="border-r border-black p-1">Susana Avila C.</td>
                <td className="border-r border-black p-1">Dirección General</td>
                <td className="p-1 text-left px-2">Módulo Códigos SAP, Lote único por emisión y correlativo 0001-NNNN.</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="border-r border-black p-1 font-mono">v3.1</td>
                <td className="border-r border-black p-1">16-Nov-2026</td>
                <td className="border-r border-black p-1">Tech Lead TI</td>
                <td className="border-r border-black p-1">Control de Calidad</td>
                <td className="border-r border-black p-1">Gerencia Operaciones</td>
                <td className="p-1 text-left px-2">Materia fija automática, CRUD Operadores, turnos 1-3, rango 0001-00NN y unificación SAP.</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="border-r border-black p-1 font-mono">v3.2</td>
                <td className="border-r border-black p-1">16-Nov-2026</td>
                <td className="border-r border-black p-1">Tech Lead TI</td>
                <td className="border-r border-black p-1">Control de Calidad</td>
                <td className="border-r border-black p-1">Gerencia Operaciones</td>
                <td className="p-1 text-left px-2">Módulo Gestión de Estados con flujo estricto (Producción ➔ Almacenaje ➔ Despacho ➔ Liberado/Retenido), soporte Pistola QR y Cámara Celular/Web (jsQR).</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="border-r border-black p-1 font-mono">v3.3</td>
                <td className="border-r border-black p-1">16-Nov-2026</td>
                <td className="border-r border-black p-1">Tech Lead TI</td>
                <td className="border-r border-black p-1">Control de Calidad</td>
                <td className="border-r border-black p-1">Gerencia Operaciones</td>
                <td className="p-1 text-left px-2">Modo Continuo de Gestión de Estados: preselección previa de estado destino, alertas de flujo inválido y bitácora de sesión en tiempo real.</td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="border-r border-black p-1 font-mono font-bold">v3.4</td>
                <td className="border-r border-black p-1 font-bold">16-Nov-2026</td>
                <td className="border-r border-black p-1">Tech Lead TI</td>
                <td className="border-r border-black p-1">Control de Calidad</td>
                <td className="border-r border-black p-1">Gerencia Operaciones</td>
                <td className="p-1 text-left px-2 font-medium">Formulario de Iniciar Producción blindado: Artículo, Materia Prima, Color y Color Asa 100% no editables / derivados de Códigos SAP; Dashboard Ejecutivo con accesos rápidos directos a los 11 módulos de planta y formalización rigurosa de la máquina de estados.</td>
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
              <span>Módulo 1 · Dashboard Ejecutivo (Inteligencia Operativa, Accesos Directos & OEE)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /dashboard</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            El Dashboard centraliza las métricas en tiempo real de la planta de producción. Brinda a la gerencia y supervisores una radiografía instantánea del volumen procesado, la eficiencia de los turnos, el cumplimiento frente a la meta operacional, la barra de accesos rápidos a los 11 módulos de planta y la exportación masiva de datos auditados a CSV.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Componentes Clave del Dashboard:</div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
              <li><strong>Barra de Accesos Rápidos:</strong> Enlaces directos a Iniciar Producción, Gestión de Estados, Sábana de Lotes, Códigos SAP, Operadores y Certificados.</li>
              <li><strong>KPIs Bento Principales:</strong> Producción Acumulada (UND), Lotes Liberados (Ficha F-0101), En Tránsito y Lotes Retenidos (Cuarentena).</li>
              <li><strong>Evolución Diaria vs Meta:</strong> Curva continua de tendencia y barras diarias con porcentaje de cumplimiento de planta.</li>
              <li><strong>Distribución por Estados:</strong> Conteo gráfico de unidades según la secuencia oficial <code>Producción ➔ Almacenaje ➔ Despacho ➔ Liberado / Retenido</code>.</li>
            </ul>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 2: CÓDIGOS INTERNOS & SAP */}
        {/* ========================================================================= */}
        <section id="sec-codigos-sap" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">2</span>
              <span>Módulo 2 · Códigos Internos & SAP (Unificación de Código Interno)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /codigos-internos</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Administra el catálogo maestro de artículos. A partir de la versión v3.1, el <strong>Código SAP es el único Código Interno oficial</strong> del sistema.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Parámetros Maestros Estandarizados:</div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
              <li><strong>Código SAP:</strong> Clave única oficial y obligatoria del artículo.</li>
              <li><strong>Artículo / Denominación:</strong> Nombre formal del producto envasado.</li>
              <li><strong>Materia Prima Estándar:</strong> HDPE Virgen, HDPE PCR, rPET, etc. (se enlaza automáticamente en la producción).</li>
              <li><strong>Colores y Cantidad Estándar:</strong> Parámetros predefinidos por pallet o paquete.</li>
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
              <span>Módulo 3 · Operadores de Planta (Gestión de Personal)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /operadores</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Módulo dedicado al registro, edición y control de estado de los operadores de planta. Por motivos de auditoría y trazabilidad histórica de órdenes previas, los operadores <strong>no se eliminan físicamente</strong>; únicamente se habilitan o deshabilitan mediante el control de estado.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 4: INICIAR PRODUCCIÓN */}
        {/* ========================================================================= */}
        <section id="sec-iniciar" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">4</span>
              <span>Módulo 4 · Iniciar Producción (Campos Maestros Bloqueados & Emisión Zebra ZPL)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /iniciar</span>
          </div>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Blindaje Operativo de Formulario (v3.4):</div>
            <ol className="list-decimal pl-5 space-y-1.5 text-neutral-700">
              <li>
                <strong>Campos Maestros Bloqueados (Solo Lectura):</strong> Al seleccionar el Código SAP, los campos <em>Artículo / Denominación</em>, <em>Materia Prima</em>, <em>Color (Bidón)</em> y <em>Color Asa</em> se completan automáticamente y quedan estrictamente bloqueados (no editables). Esto suprime por completo los errores de digitación en planta y asegura conformidad con el catálogo oficial.
              </li>
              <li>
                <strong>Operador Seleccionable & Nombre en Etiqueta:</strong> El operador responsable se selecciona desde la lista de operadores activos. En la etiqueta física Zebra se imprime exclusivamente el nombre del operador en la fila <code>MÁQ. / TURNO / OP</code>.
              </li>
              <li>
                <strong>Turnos Restringidos (1 a 3):</strong> Las opciones válidas se limitan estrictamente a los turnos operacionales 1, 2 y 3.
              </li>
              <li>
                <strong>Unidades de Embalaje y Peso:</strong> Se define el total de embalajes a generar (<code>0001</code> al <code>00NN</code>), cantidad por unidad y se registra el peso por pallet/bulto (ej. N/A o 18.5 kg).
              </li>
              <li>
                <strong>Tickets Zebra:</strong> La casilla central mantiene el rótulo oficial <code>CODIGO INTERNO</code>, imprimiendo el código SAP correspondiente junto al código QR con URL de trazabilidad.
              </li>
            </ol>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 5: PRODUCCIÓN Y SÁBANA */}
        {/* ========================================================================= */}
        <section id="sec-produccion" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">5</span>
              <span>Módulo 5 · Producción & Sábana (Jerarquía Lote ➔ Unidades de Embalaje)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /produccion</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Agrupa la producción por Número de Lote. Al desplegar cada lote se acceden a las unidades de embalaje (0001 a NNNN), permitiendo auditar y modificar el estado operativo de forma unitaria sin frenar el lote completo. Cuenta con ventana de consulta sincronizada con la zona horaria de planta para visualización inmediata de lotes recién emitidos.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 6: GESTIÓN DE ESTADOS (PISTOLA QR & CÁMARA) */}
        {/* ========================================================================= */}
        <section id="sec-gestion-estados" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">6</span>
              <span>Módulo 6 · Gestión de Estados (Modo Continuo & Lectura QR)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /gestion-estados</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Módulo de alta velocidad diseñado para el control de etapas de envases en línea de planta y bodega. Integra un <strong>Modo Continuo de Transición Automática</strong> que permite a los operarios procesar decenas de unidades por minuto mediante pistola láser o cámara móvil sin necesidad de interactuar con el mouse.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Protocolo Operativo de 2 Pasos:</div>
            <ol className="list-decimal pl-5 space-y-1.5 text-neutral-700">
              <li>
                <strong>Paso 1 · Preselección de Estado Destino:</strong> Antes de iniciar la lectura masiva, el operario selecciona el estado objetivo (ej. <em>Mover a Almacenaje</em> al recibir en bodega, <em>Mover a Despacho</em> al preparar pallet de carga, o <em>Mover a Liberado</em> en control de calidad final). También dispone del modo <em>Solo Inspección</em> para auditoría sin alteración de datos.
              </li>
              <li>
                <strong>Paso 2 · Lectura Óptica Ininterrumpida:</strong> Al disparar la pistola o enfocar con la cámara del celular, el sistema captura el UUID y aplica de inmediato la transición hacia el estado preseleccionado.
              </li>
            </ol>

            <div className="font-bold text-neutral-900 underline mt-2">Mecanismo de Validación & Retroalimentación:</div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
              <li>
                <strong>Transición Exitosa:</strong> Si el cambio cumple el flujo obligatorio, emite un tono auditivo agudo (beep 880 Hz), despliega una notificación de éxito con datos de lote y embalaje (ej. <em>"✓ Envase Lote #10010 - Emb. 0001: Pasó exitosamente al estado [Almacenaje]"</em>), lo anota en la bitácora de sesión y mantiene el foco listo para el siguiente envase.
              </li>
              <li>
                <strong>Transición Rechazada por Flujo Inválido:</strong> Si la unidad se encuentra en una etapa no compatible con el destino preseleccionado, el sistema bloquea el cambio, emite una señal sonora de advertencia y presenta un mensaje explicativo (ej. <em>"✕ Transición Rechazada: La unidad se encuentra en estado 'Producción' y no puede pasar a 'Despacho'. Flujo obligatorio: Producción ➔ Almacenaje ➔ Despacho ➔ Liberado/Retenido"</em>).
              </li>
              <li>
                <strong>Bitácora en Tiempo Real:</strong> Registra cada envase escaneado durante la sesión con su correlativo, hora exacta y estado anterior/nuevo, permitiendo al supervisor comprobar el total de unidades pistoleadas en su turno.
              </li>
            </ul>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 7: CERTIFICADOS DE CALIDAD */}
        {/* ========================================================================= */}
        <section id="sec-certificados" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">7</span>
              <span>Módulo 7 · Certificados de Calidad R-CAL-07 Oficiales</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /certificados</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Generador oficial del documento R-CAL-07 exigido por clientes B2B. Acredita la inocuidad, materialidad y parámetros de control del producto terminado.
          </p>

          <div className="p-3 bg-amber-50 border border-amber-300 rounded text-[10.5px] text-amber-900 mb-3 space-y-1.5">
            <p>
              • <strong>Filtro Exclusivo Despacho y Liberado:</strong> Solo se habilitan lotes que posean unidades en estado <em>Despacho</em> o <em>Liberado</em>.
            </p>
            <p>
              • <strong>Sin Código Interno Visible:</strong> El documento oficial R-CAL-07 no expone códigos internos de planta al cliente final, rigiéndose por Artículo, Lote y Unidad de Embalaje.
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
              <span>Módulo 8 · Consulta Pública de Trazabilidad QR (Portal B2B)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /trazabilidad/:uuid</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Portal web de libre acceso (sin requerir credenciales de usuario) diseñado para clientes finales, inspectores de aduanas y auditores que escanean el código QR impreso en el ticket térmico Zebra de cada envase.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-1 text-[10.5px] text-neutral-700">
            <div><strong>Verificación Inmutable:</strong> Certifica la autenticidad del envase producido en Planta Quilicura.</div>
            <div><strong>Atributos Desplegados:</strong> Artículo, Material (HDPE/PCR), Colores, Lote, Unidad de Embalaje, Fecha de Fabricación, Estado Actual y el Historial de Trazabilidad completo registrado en la nube.</div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 9: CONFIGURACIÓN GLOBAL & RBAC */}
        {/* ========================================================================= */}
        <section id="sec-config" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">9</span>
              <span>Módulo 9 · Configuración del Sistema, Políticas RBAC & Auditoría</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /configuracion</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Control de inactividad de sesión (5 a 480 minutos), matriz de asignación granular de módulos para roles (con actualización y sincronización instantánea en tiempo real sin requerir relogin) y bitácora de auditoría de inicios de sesión en AWS RDS.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 10: USUARIOS Y MATRIZ RBAC */}
        {/* ========================================================================= */}
        <section id="sec-usuarios" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">10</span>
              <span>Módulo 10 · Usuarios & Matriz de Roles (Control de Accesos RBAC)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /usuarios</span>
          </div>

          <div className="border border-black overflow-hidden mb-3">
            <table className="w-full text-center border-collapse text-[9px]">
              <thead>
                <tr className="bg-neutral-100 border-b border-black font-bold">
                  <th className="border-r border-black p-1.5">Rol</th>
                  <th className="border-r border-black p-1.5">Dashboard</th>
                  <th className="border-r border-black p-1.5">Códigos SAP</th>
                  <th className="border-r border-black p-1.5">Operadores</th>
                  <th className="border-r border-black p-1.5">Iniciar Prod.</th>
                  <th className="border-r border-black p-1.5">Sábana</th>
                  <th className="border-r border-black p-1.5">Gestión Estados</th>
                  <th className="border-r border-black p-1.5">Certificados</th>
                  <th className="p-1.5">Configuración</th>
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
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="p-1.5 text-emerald-700 font-bold">Total</td>
                </tr>
                <tr className="border-b border-neutral-200">
                  <td className="border-r border-black p-1.5 font-bold text-left px-2">Jefatura</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Gestión</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Gestión</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Emitir</td>
                  <td className="p-1.5 text-neutral-400">Sin acceso</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-left px-2">Colaborador / Planta</td>
                  <td className="border-r border-black p-1.5 text-neutral-600">Visualizar</td>
                  <td className="border-r border-black p-1.5 text-neutral-600">Consulta</td>
                  <td className="border-r border-black p-1.5 text-neutral-400">Sin acceso</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Registrar</td>
                  <td className="border-r border-black p-1.5 text-neutral-600">Consulta</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Operar</td>
                  <td className="border-r border-black p-1.5 text-neutral-400">Sin acceso</td>
                  <td className="p-1.5 text-neutral-400">Sin acceso</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 11: PREGUNTAS FRECUENTES (FAQ) Y CONTINGENCIAS */}
        {/* ========================================================================= */}
        <section id="sec-faq" className="mb-6 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">11</span>
              <span>Sección 11 · Preguntas Frecuentes (FAQ) & Protocolos de Planta</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Soporte Técnico</span>
          </div>

          <div className="space-y-3 text-[10.5px]">
            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P1: ¿Por qué el campo Materia no se puede modificar manualmente al iniciar producción?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Para evitar errores de rotulación técnica en la etiqueta Zebra, la materia prima se asigna de manera automática según el artículo seleccionado desde el catálogo de Códigos SAP.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P2: ¿Cómo se administra a un nuevo operador de máquina y por qué no hay botón de eliminar?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Ingrese al módulo <em>"Operadores"</em> desde el menú lateral y pulse <em>"+ Nuevo Operador"</em>. Por política de integridad referencial y auditoría, los operadores nunca se eliminan físicamente de la base de datos; simplemente se desactivan con el botón de alternar estado, preservando el histórico de sus tiradas.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P3: ¿Qué código y operador se imprimen en la etiqueta térmica Zebra?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> En la casilla central de <strong>CODIGO INTERNO</strong> se imprime el código SAP asignado, y en la fila <code>MÁQ. / TURNO / OP</code> se imprime exclusivamente el nombre del operador seleccionado para fácil lectura de supervisores y clientes.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P4: ¿Cómo opera el Modo Continuo en Gestión de Estados con pistola láser y cámara?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> El operario selecciona en el encabezado el estado destino al que deben pasar los envases (ej. <em>Almacenaje</em> o <em>Despacho</em>). A partir de ese momento, cada lectura con pistola o cámara transiciona automáticamente la unidad. Si cumple el flujo reglamentario, emite un tono agudo y muestra un mensaje de éxito; si la unidad no cumple la regla de avance, emite una alerta sonora grave y rechaza el cambio explicando detalladamente el porqué.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P5: ¿Qué hacer si el sistema arroja "Transición Rechazada" al pistolear un envase?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Verifique en pantalla el estado actual del envase. Si está en <em>Producción</em>, debe ser recibido en <em>Almacenaje</em> antes de enviarse a <em>Despacho</em>. La máquina de estados impide saltos arbitrarios para resguardar la trazabilidad ante auditorías ISO y clientes. Si el envase tiene una falla de calidad, puede ser apartado inmediatamente a <em>Retenido</em> desde cualquier etapa.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P6: ¿Cómo se actualizan los permisos de módulos para cada rol y cuándo se aplican?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Desde el módulo <em>Configuración ➔ Administrador de Roles</em>, el Administrador puede marcar o desmarcar módulos por rol. El cambio se persiste de inmediato en la base de datos (tabla <code>bdbioplastchile.rol_modulos</code>) y se sincroniza en tiempo real con la barra de navegación del usuario sin necesidad de reiniciar la sesión.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P7: ¿Cuál es la regla obligatoria de estados y por qué el sistema prohíbe saltar etapas?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> La máquina de estados oficial sigue estrictamente el ciclo de vida: <code>Producción ➔ Almacenaje ➔ Despacho ➔ Liberado / Retenido</code>. Un envase recién soplado no puede ser despachado sin ingresar formalmente a bodega (Almacenaje), y ningún lote puede ser liberado sin haber pasado por control de despacho e inspección R-CAL-07. Desde cualquier etapa, un envase puede ser enviado a <em>Retenido (Cuarentena)</em> si presenta defectos visuales o técnicos, y solo retornará al flujo tras la disposición formal del área de Calidad.
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
