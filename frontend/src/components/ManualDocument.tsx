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
            <span>Versión v3.2 Vigente</span>
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
              Versión: <span className="font-bold">v3.2</span>
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
              <tr className="bg-emerald-50/40">
                <td className="border-r border-black p-1 font-mono font-bold">v3.2</td>
                <td className="border-r border-black p-1 font-bold">16-Nov-2026</td>
                <td className="border-r border-black p-1">Tech Lead TI</td>
                <td className="border-r border-black p-1">Control de Calidad</td>
                <td className="border-r border-black p-1">Gerencia Operaciones</td>
                <td className="p-1 text-left px-2 font-medium">Nuevo Módulo "Gestión de Estados" con máquina de flujo obligatorio (Producción ➔ Almacenaje ➔ Despacho ➔ Liberado/Retenido), soporte dual para Pistola QR y Cámara Celular/Web (jsQR), extracción de UUID por regex/split, y sincronización horaria de sábana de lotes.</td>
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
              <span>Módulo 4 · Iniciar Producción (Reglas Operativas v3.1)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /iniciar</span>
          </div>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Nuevas Reglas de Entrada en Planta:</div>
            <ol className="list-decimal pl-5 space-y-1.5 text-neutral-700">
              <li>
                <strong>Denominación "Color":</strong> Se simplifica el término visual a <em>Color</em> para el cuerpo principal y <em>Color Asa</em> para el componente.
              </li>
              <li>
                <strong>Materia Prima Automática:</strong> El campo Materia ya no es editable manualmente; se fija y visualiza automáticamente al seleccionar el artículo del catálogo SAP.
              </li>
              <li>
                <strong>Operador Seleccionable & Nombre en Etiqueta:</strong> El operador se selecciona desde la lista de operadores activos. En la etiqueta física Zebra se imprime exclusivamente el nombre del operador en la fila <code>MÁQ. / TURNO / OP</code>.
              </li>
              <li>
                <strong>Turnos Restringidos (1 a 3):</strong> Las opciones válidas se limitan estrictamente a los turnos operacionales 1, 2 y 3.
              </li>
              <li>
                <strong>Unidades de Embalaje y Peso:</strong> Se define el total de embalajes a generar (<code>0001</code> al <code>00NN</code>) y se registra el campo de peso por unidad/pallet (ej. N/A o 18.5 kg).
              </li>
              <li>
                <strong>Tickets Zebra:</strong> La casilla central mantiene el rótulo oficial <code>CODIGO INTERNO</code>, imprimiendo el código SAP correspondiente.
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
              <span>Módulo 6 · Gestión de Estados (Flujo Obligatorio & Lectura QR)</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /gestion-estados</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Módulo especializado para el cambio de etapas de envases en línea de planta y bodega, mediante captura óptica de códigos QR de tickets Zebra y cumplimiento estricto de la máquina de estados reglamentaria.
          </p>

          <div className="border border-neutral-300 p-3 rounded bg-neutral-50 mb-3 space-y-2 text-[10.5px]">
            <div className="font-bold text-neutral-900 underline">Reglas y Operatoria del Módulo:</div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
              <li>
                <strong>Máquina de Estados Estricta:</strong> Flujo obligatorio unidireccional: <code>Producción ➔ Almacenaje ➔ Despacho ➔ Liberado / Retenido</code>. Los estados fuera de secuencia están bloqueados por sistema (ej. una unidad en <em>Producción</em> no puede saltar directo a <em>Despacho</em> o <em>Liberado</em> sin pasar por <em>Almacenaje</em>).
              </li>
              <li>
                <strong>Modalidad 1 · Pistola Láser/Bluetooth:</strong> Diseñada para puestos fijos de embalaje y pesaje. Cuenta con caja de texto con autofocus permanente que procesa lecturas continuas sin necesidad de clics manuales del operario.
              </li>
              <li>
                <strong>Modalidad 2 · Cámara Celular / Web:</strong> Diseñada para supervisores y operarios móviles en bodega, utilizando la cámara posterior con detección de códigos en tiempo real (librería <code>jsQR</code>) y confirmación sonora de captura.
              </li>
              <li>
                <strong>Extracción Automática de UUID:</strong> Si el código QR contiene la URL oficial <code>https://appbpch.raevsi.cl/trazabilidad/&lt;UUID&gt;</code>, el sistema aísla por regex/split el UUID exacto para consultar el registro en la base de datos sin errores de digitación.
              </li>
              <li>
                <strong>Trazabilidad y Cuarentena:</strong> Permite ingresar observaciones de justificación en cada transición y enviar cualquier envase a <em>Retenido</em> en caso de no-conformidad visual o química.
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
              <span>Módulo 7 · Certificados de Calidad R-CAL-07</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /certificados</span>
          </div>

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
        {/* SECCIÓN 8: CONFIGURACIÓN GLOBAL & RBAC */}
        {/* ========================================================================= */}
        <section id="sec-config" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">8</span>
              <span>Módulo 8 · Configuración, Roles (RBAC) & Auditoría</span>
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Ruta: /configuracion</span>
          </div>

          <p className="text-justify text-[11px] mb-3 text-neutral-700">
            Control de inactividad de sesión (5 a 480 minutos) y matriz de asignación granular de módulos para roles (incluyendo <em>Códigos Internos SAP</em>, <em>Operadores</em> y <em>Gestión de Estados</em>).
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 9: USUARIOS Y MATRIZ RBAC */}
        {/* ========================================================================= */}
        <section id="sec-usuarios" className="mb-8 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">9</span>
              <span>Módulo 9 · Matriz de Roles y Módulos RBAC</span>
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
        {/* SECCIÓN 10: PREGUNTAS FRECUENTES (FAQ) Y CONTINGENCIAS */}
        {/* ========================================================================= */}
        <section id="sec-faq" className="mb-6 break-inside-avoid scroll-mt-20">
          <div className="border-b-2 border-black pb-1 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px]">10</span>
              <span>Sección 10 · Preguntas Frecuentes (FAQ) & Protocolos de Planta</span>
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
                P4: ¿Cómo funciona la lectura QR con pistola láser o cámara celular en Gestión de Estados?
              </div>
              <p className="text-neutral-700 text-justify">
                <strong>Respuesta:</strong> En la opción Pistola QR el sistema mantiene el foco permanente en el lector; al escanear, el software procesa el QR o la URL pública, extrae el UUID de la unidad y muestra los botones de transición válidos según la regla <code>Producción ➔ Almacenaje ➔ Despacho ➔ Liberado/Retenido</code>. En la opción Cámara, enfoca el ticket Zebra con el lente de tu móvil o tablet y el sistema detectará el QR en tiempo real con confirmación sonora.
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
