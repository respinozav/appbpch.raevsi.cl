import React from 'react';
import { 
  Printer, CheckCircle2, ShieldCheck, HelpCircle, Layers, 
  FileCheck, QrCode, Settings, Users, AlertTriangle, ArrowRight,
  Factory, Calendar, Award, BookOpen, Clock, Lock, Sparkles, Check,
  Database, Tag, PackageCheck
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
            <span>Versión v3.0 Vigente</span>
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
              Versión: <span className="font-bold">v3.0</span>
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
                <td className="border-r border-black p-1 font-mono">v2.6</td>
                <td className="border-r border-black p-1">15-Nov-2026</td>
                <td className="border-r border-black p-1">Tech Lead TI</td>
                <td className="border-r border-black p-1">Susana Avila C.</td>
                <td className="border-r border-black p-1">Dirección General</td>
                <td className="p-1 text-left px-2">Administrador de Roles (RBAC), auditoría de logins y exportación CSV.</td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="border-r border-black p-1 font-mono font-bold">v3.0</td>
                <td className="border-r border-black p-1 font-bold">16-Nov-2026</td>
                <td className="border-r border-black p-1">Tech Lead TI</td>
                <td className="border-r border-black p-1">Control de Calidad</td>
                <td className="border-r border-black p-1">Gerencia Operaciones</td>
                <td className="p-1 text-left px-2 font-medium">Nuevo Módulo Códigos Internos SAP (CRUD sapcodigointerno), emisión con 1 solo lote por tirada y correlativo por unidad de embalaje (0001 a NNNN), agrupación de Producción por Lote, y Certificados exclusivos para Despacho/Liberado con remoción de código interno en R-CAL-07.</td>
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
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 2: CÓDIGOS INTERNOS & SAP */}
        {/* ========================================================================= */}
        <section id="sec-codigos-sap" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">2</span>
              <span>Módulo 2 · Códigos Internos & SAP (Catálogo Maestro)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /codigos-internos</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Administra el catálogo maestro de homologación entre códigos de sistema ERP SAP (<code>codigosap</code>) y la codificación interna de planta (<code>codigointerno</code>). Esta tabla centraliza los parámetros estándar de fabricación para cada tipo de envase y bidón.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Estructura de la Tabla SAP / Códigos Internos:</div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
              <li><strong>Código SAP:</strong> Identificador comercial asignado en el ERP empresarial.</li>
              <li><strong>Código Interno:</strong> Clave única interna de planta (ej. 110000001).</li>
              <li><strong>Artículo:</strong> Denominación formal del envase (ej. Bidón 20 Litros Natural Asa Azul).</li>
              <li><strong>Materia Prima:</strong> Tipo de polímero estándar (HDPE Virgen, HDPE PCR Reciclado, etc.).</li>
              <li><strong>Color Bidón / Color Asa:</strong> Coloración predeterminada del cuerpo y del componente.</li>
              <li><strong>Cantidad por Embalaje:</strong> Número estándar de unidades contenidas en cada pallet o paquete.</li>
            </ul>
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[9.5px] text-emerald-950 font-medium mt-2">
              <strong>Autocompletado Operacional:</strong> En el módulo de Iniciar Producción, el operador puede seleccionar directamente un SKU del catálogo de Códigos Internos para autocompletar artículo, materia prima, colores y cantidad estándar en un solo clic.
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 3: INICIAR PRODUCCIÓN */}
        {/* ========================================================================= */}
        <section id="sec-iniciar" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">3</span>
              <span>Módulo 3 · Iniciar Producción (1 Solo Lote + Unidades 0001 a NNNN)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /iniciar</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Punto de registro de tiradas de soplado en línea de planta. Modificado en la versión 3.0 para implementar la <strong>regla de Lote Único por Emisión</strong>.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Protocolo de Registro y Correlativo por Embalaje:</div>
            <ol className="list-decimal pl-5 space-y-1.5 text-neutral-700">
              <li>
                <strong>Un Solo Lote por Tirada:</strong> Al emitir N tickets para una orden (ej. 10 paquetes), ya no se generan 10 lotes distintos. Se calcula <strong>un único número de lote</strong> para toda la emisión (tomando el consecutivo máximo + 1).
              </li>
              <li>
                <strong>Correlativo de Unidad por Embalaje:</strong> Cada ticket individual dentro del lote recibe su identificador correlativo formateado a 4 dígitos: <code>0001</code>, <code>0002</code>, ... hasta <code>0010</code> (o N).
              </li>
              <li>
                <strong>Etiquetas Térmicas Zebra:</strong> Cada etiqueta impresa incluye el Número de Lote común, su Unidad de Embalaje individual (ej. <code>0001</code>), cantidad unitaria, operador, máquina y su código QR de verificación pública.
              </li>
            </ol>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 4: PRODUCCIÓN Y SÁBANA */}
        {/* ========================================================================= */}
        <section id="sec-produccion" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">4</span>
              <span>Módulo 4 · Producción & Sábana (Jerarquía Lote ➔ Unidades de Embalaje)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /produccion</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            La vista de Producción y Sábana agrupa los registros directamente por <strong>Lote de Producción</strong>.
          </p>

          <div className="space-y-2 text-[10.5px] text-neutral-700 mb-3">
            <p>
              • <strong>Agrupación por Lote Principal:</strong> La tabla principal lista los lotes producidos, mostrando fecha, máquina, turno, artículo y total de unidades de embalaje contenidas.
            </p>
            <p>
              • <strong>Despliegue de Unidades de Embalaje:</strong> Al presionar sobre un lote, se expande la sub-tabla con cada una de las unidades de embalaje (<code>0001</code>, <code>0002</code>...).
            </p>
            <p>
              • <strong>Gestión Individual de Estados:</strong> Cada unidad de embalaje posee su estado operativo independiente (<em>Producción</em>, <em>Almacenaje</em>, <em>Despacho</em>, <em>Liberado</em> o <em>Retenido</em>). Si una unidad sufre un incidente de calidad, se puede marcar como Retenida sin afectar al resto de unidades del lote.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 5: CERTIFICADOS DE CALIDAD */}
        {/* ========================================================================= */}
        <section id="sec-certificados" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">5</span>
              <span>Módulo 5 · Certificados de Calidad R-CAL-07</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /certificados</span>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-300 rounded text-[10.5px] text-amber-900 mb-3 space-y-1.5">
            <strong className="block mb-1 text-amber-950 font-bold uppercase tracking-wide">REGLAS NORMATIVAS DE EMISIÓN DE CERTIFICADOS:</strong>
            <p>
              1. <strong>Filtro Exclusivo Despacho y Liberado:</strong> En este módulo solo se cargan lotes que posean unidades en estado <strong>Despacho</strong> o <strong>Liberado</strong>.
            </p>
            <p>
              2. <strong>Selección de Unidad de Embalaje:</strong> Al pinchar un lote, se muestran sus unidades de embalaje habilitadas para seleccionar cuál certificar.
            </p>
            <p>
              3. <strong>Remoción de Código Interno:</strong> Conforme al nuevo estándar de aseguramiento de calidad, el <em>código interno</em> ha sido eliminado de la interfaz de certificados y de la tabla técnica del documento impreso R-CAL-07 (mostrando únicamente Item, Artículo, Lote, Unid. Embalaje, Material, Color Bidón, Color Asa, Cantidad y Aprobación A/R).
            </p>
            <p>
              4. <strong>5 Campos Obligatorios:</strong> Se mantiene el bloqueo estricto que exige completar Cliente, N° Despacho, N° Factura, Responsable y Cargo antes de imprimir.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 6: CONSULTA PÚBLICA QR */}
        {/* ========================================================================= */}
        <section id="sec-qr" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">6</span>
              <span>Módulo 6 · Consulta Pública de Trazabilidad (Escaneo QR)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /trazabilidad/:uid</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Permite a clientes finales, transportistas y auditores verificar la trazabilidad y validez de la unidad de embalaje escaneando el código QR de la etiqueta sin necesidad de autenticación.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 7: CONFIGURACIÓN GLOBAL */}
        {/* ========================================================================= */}
        <section id="sec-config" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">7</span>
              <span>Módulo 7 · Configuración, Roles (RBAC) & Auditoría de Logins</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /configuracion</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Administración de políticas de inactividad de sesión (5 a 480 minutos), gestión de matriz RBAC de roles y visor de auditoría forense de inicios de sesión en AWS RDS.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 8: USUARIOS Y ROLES */}
        {/* ========================================================================= */}
        <section id="sec-usuarios" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">8</span>
              <span>Módulo 8 · Administración de Usuarios & Permisos</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /usuarios</span>
          </div>

          <div className="border border-black overflow-hidden mb-3">
            <table className="w-full text-center border-collapse text-[9.5px]">
              <thead>
                <tr className="bg-neutral-100 border-b border-black font-bold">
                  <th className="border-r border-black p-1.5">Rol</th>
                  <th className="border-r border-black p-1.5">Dashboard</th>
                  <th className="border-r border-black p-1.5">Códigos SAP</th>
                  <th className="border-r border-black p-1.5">Iniciar Prod.</th>
                  <th className="border-r border-black p-1.5">Sábana & Lotes</th>
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
                  <td className="p-1.5 text-emerald-700 font-bold">Total</td>
                </tr>
                <tr className="border-b border-neutral-200">
                  <td className="border-r border-black p-1.5 font-bold text-left px-2">Jefatura</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Gestión</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Total</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Emitir</td>
                  <td className="p-1.5 text-neutral-400">Sin acceso</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-left px-2">Colaborador / Planta</td>
                  <td className="border-r border-black p-1.5 text-neutral-600">Visualizar</td>
                  <td className="border-r border-black p-1.5 text-neutral-600">Consulta</td>
                  <td className="border-r border-black p-1.5 text-emerald-700 font-bold">Registrar</td>
                  <td className="border-r border-black p-1.5 text-neutral-600">Consulta</td>
                  <td className="border-r border-black p-1.5 text-neutral-400">Sin acceso</td>
                  <td className="p-1.5 text-neutral-400">Sin acceso</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 9: PREGUNTAS FRECUENTES (FAQ) Y CONTINGENCIAS */}
        {/* ========================================================================= */}
        <section id="sec-faq" className="mb-6 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">9</span>
              <span>Sección 9 · Preguntas Frecuentes (FAQ) & Protocolos de Contingencia</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Soporte Técnico</span>
          </div>

          <div className="space-y-3 text-[10.5px]">
            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P1: ¿Por qué en una tirada de 10 paquetes todos tienen el mismo lote?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> A partir de la versión v3.0, el sistema asigna un solo número de Lote para la tirada completa de producción. La distinción entre cada paquete o pallet se realiza mediante la <strong>Unidad de Embalaje</strong> numerada correlativamente (<code>0001</code> a <code>0010</code>).
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P2: ¿Por qué ya no aparece el "Código Interno" en el Certificado R-CAL-07?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Por directriz técnica de Calidad, el código interno es un identificador de uso exclusivo de planta que no debe ser expuesto al cliente final. El documento oficial de calidad se rige exclusivamente por el Artículo, Número de Lote y Unidad de Embalaje.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P3: ¿Qué lotes aparecen disponibles en el módulo de Certificados?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Únicamente aquellos lotes cuyas unidades de embalaje se encuentren en estado <strong>Despacho</strong> o <strong>Liberado</strong>. Al hacer clic sobre el lote, se desplegarán las unidades correspondientes para seleccionar cuál emitir.
              </p>
            </div>

            <div className="border border-neutral-300 p-2.5 rounded bg-white">
              <div className="font-bold text-neutral-900 mb-1">
                P4: ¿Cómo agrego un nuevo artículo al catálogo para no tener que escribirlo siempre?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> Ingrese al módulo <em>"Códigos Internos"</em> desde el menú lateral y pulse el botón <em>"+ Nuevo Código Interno"</em>. Complete el Código SAP, Código Interno, nombre del Artículo, Materia, Colores y Cantidad estándar. Quedará disponible de inmediato en el formulario de Iniciar Producción.
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
