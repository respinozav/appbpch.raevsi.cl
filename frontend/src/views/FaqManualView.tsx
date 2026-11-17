import React, { useState } from 'react';
import { ManualDocument } from '../components/ManualDocument';
import { 
  BookOpen, Search, Printer, Layers, HelpCircle, 
  ChevronRight, Bookmark, ArrowUpRight, Sparkles, Shield, Database, Download
} from 'lucide-react';

export const FaqManualView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('sec-dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    { id: 'sec-dashboard', label: '1. Dashboard Ejecutivo', desc: 'KPIs, embudo de operadores y metas de planta' },
    { id: 'sec-codigos-sap', label: '2. Códigos Internos', desc: 'Catálogo de artículos y materias estándar' },
    { id: 'sec-operadores', label: '3. Operadores de Planta', desc: 'Personal autorizado y asignación activa' },
    { id: 'sec-iniciar', label: '4. Iniciar Producción', desc: 'Tiradas, un solo lote y embalajes 0001-NNNN' },
    { id: 'sec-produccion', label: '5. Producción & Sábana', desc: 'Jerarquía por Lote y unidades de embalaje' },
    { id: 'sec-gestion-estados', label: '6. Gestión de Estados', desc: 'Modo continuo, pistola QR, cámara y flujo obligatorio' },
    { id: 'sec-certificados', label: '7. Certificados R-CAL-07', desc: 'Emisión para lotes en despacho y liberados' },
    { id: 'sec-qr', label: '8. Consulta Pública QR', desc: 'Verificación externa sin login' },
    { id: 'sec-config', label: '9. Configuración Global', desc: 'Inactividad de sesión, roles y parámetros Zebra' },
    { id: 'sec-usuarios', label: '10. Usuarios & Permisos', desc: 'Matriz de roles RBAC con nuevos módulos' },
    { id: 'sec-faq', label: '11. Preguntas Frecuentes (FAQ)', desc: 'Protocolos de contingencia en planta' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* View Header (Hidden in Print) */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15803D]">
              Sistema de Gestión Integrado · Calidad & Operaciones
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0D3B22] tracking-tight mt-1 flex items-center gap-3">
            <span>Manual de Operaciones & FAQ</span>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-[#EEF6F0] text-[#15803D] border border-[#15803D]/20">
              MAN-SGI-01 · v3.6
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Base de conocimiento oficial de Bioplast Chile SpA. Documento controlado con especificación módulo por módulo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-[#0D3B22] text-white hover:bg-[#15803D] shadow-sm transition active:scale-95 cursor-pointer"
            title="Exportar documento oficial a formato PDF"
          >
            <Download className="w-4 h-4" />
            <span>Exportar a PDF</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Confluence Side Index on Desktop, Document on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Navigation Table of Contents (Confluence style) */}
        <aside className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#E5ECE6] shadow-sm no-print sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE6] mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#15803D]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0D3B22]">
                Índice del Manual
              </h2>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">11 Módulos</span>
          </div>

          <div className="space-y-1.5">
            {sections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between group ${
                    isActive
                      ? 'bg-[#EEF6F0] text-[#0D3B22] font-bold border border-[#15803D]/20 shadow-2xs'
                      : 'text-neutral-600 hover:bg-[#F7FAF7] hover:text-[#0D3B22]'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-neutral-900 group-hover:text-[#15803D] transition">
                      {sec.label}
                    </div>
                    <div className="text-[10.5px] text-neutral-400 font-normal mt-0.5">
                      {sec.desc}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-[#15803D] translate-x-0.5' : 'text-neutral-300 group-hover:text-neutral-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick Help Box */}
          <div className="mt-6 p-4 rounded-xl bg-[#F7FAF7] border border-[#E5ECE6] text-xs">
            <div className="flex items-center gap-2 font-bold text-[#0D3B22] mb-1">
              <HelpCircle className="w-4 h-4 text-[#15803D]" />
              <span>Soporte In-Situ</span>
            </div>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Para reportar bloqueos de tickets Zebra o anomalías en bases de datos AWS RDS, contacte inmediatamente a la Jefatura de Planta o Departamento de TI.
            </p>
          </div>
        </aside>

        {/* Right Side: Printable Manual Container */}
        <main className="lg:col-span-8 flex justify-center">
          <ManualDocument activeSectionId={activeSection} onPrint={handlePrint} />
        </main>
      </div>
    </div>
  );
};
