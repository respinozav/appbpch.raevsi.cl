import React from 'react';
import { CertificateData } from '../api/client';
import { Printer, CheckCircle, ShieldCheck } from 'lucide-react';

interface CertificateDocumentProps {
  data: CertificateData;
  onPrint?: () => void;
  isComplete?: boolean;
  onCompleteRequest?: () => void;
}

export const CertificateDocument: React.FC<CertificateDocumentProps> = ({ 
  data, 
  onPrint, 
  isComplete = true,
  onCompleteRequest 
}) => {
  const handlePrint = () => {
    if (!isComplete && onCompleteRequest) {
      onCompleteRequest();
      return;
    }
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Action Toolbar (Hidden when printing) */}
      <div className="w-full max-w-[800px] flex justify-between items-center mb-4 no-print px-2">
        <div className="flex items-center gap-2 text-sm text-[#0D3B22]">
          <ShieldCheck className="w-4 h-4 text-[#15803D]" />
          <span className="font-semibold">Documento Oficial de Calidad · R-CAL-07</span>
        </div>
        <button
          onClick={handlePrint}
          disabled={!isComplete}
          title={
            isComplete
              ? 'Imprimir o Exportar PDF'
              : 'Debe completar los datos obligatorios (Cliente, Despacho, Factura, Responsable y Cargo) antes de imprimir'
          }
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition ${
            isComplete
              ? 'bg-[#0D3B22] text-white hover:bg-[#15803D] cursor-pointer active:scale-95'
              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-60'
          }`}
        >
          <Printer className="w-4 h-4" />
          Imprimir / Exportar PDF
        </button>
      </div>

      {/* Official Certificate Paper Container */}
      <div 
        className="printable-area bg-white text-black p-8 sm:p-12 w-full max-w-[820px] shadow-lg border border-neutral-300 font-sans text-xs leading-relaxed"
        style={{ minHeight: '1050px', fontFamily: '"Arial", "Helvetica", sans-serif' }}
      >
        {/* Header 3-Column Box */}
        <div className="border border-black grid grid-cols-12 mb-3">
          {/* Col 1: Logo Bioplast */}
          <div className="col-span-3 border-r border-black p-2 flex flex-col justify-center items-center text-center bg-white">
            <img 
              src="/logo-bioplast.png" 
              alt="Bioplast Ecological Innovation" 
              className="h-11 max-h-12 w-auto object-contain"
            />
          </div>

          {/* Col 2: Title Centered */}
          <div className="col-span-6 border-r border-black p-3 flex items-center justify-center text-center">
            <h1 className="font-bold text-base tracking-wider uppercase">
              {data.header.titulo}
            </h1>
          </div>

          {/* Col 3: Document Metadata */}
          <div className="col-span-3 text-[9px] font-sans">
            <div className="border-b border-black p-1 px-2 font-medium">
              Código: <span className="font-bold">{data.header.codigo_documento}</span>
            </div>
            <div className="border-b border-black p-1 px-2 font-medium">
              Versión: <span className="font-bold">{data.header.version}</span>
            </div>
            <div className="border-b border-black p-1 px-2 font-medium">
              Fecha: <span className="font-bold">{data.header.fecha_documento}</span>
            </div>
            <div className="p-1 px-2 font-medium">
              Página: <span className="font-bold">{data.header.pagina}</span>
            </div>
          </div>
        </div>



        {/* Legal & Technical Declarations */}
        <div className="space-y-2 mb-5 text-[11px] text-justify text-neutral-800 leading-normal">
          <p>{data.declaraciones.conformidad}</p>
          <p>{data.declaraciones.inocuidad}</p>
        </div>

        {/* Technical Data Table */}
        <div className="border border-black mb-6 overflow-hidden">
          <table className="w-full text-center border-collapse text-[9.5px]">
            <thead>
              <tr className="bg-neutral-100 border-b border-black font-bold">
                <th className="border-r border-black p-1.5 w-8">Item</th>
                <th className="border-r border-black p-1.5">Artículo</th>
                <th className="border-r border-black p-1.5">Lote</th>
                <th className="border-r border-black p-1.5">Unid. Embalaje</th>
                <th className="border-r border-black p-1.5">Material</th>
                <th className="border-r border-black p-1.5">Color Bidón</th>
                <th className="border-r border-black p-1.5">Color Asa</th>
                <th className="border-r border-black p-1.5">Cantidad (unidad)</th>
                <th className="p-1.5">A/R</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">{data.item.numero}</td>
                <td className="border-r border-black p-2 font-semibold uppercase">{data.item.articulo}</td>
                <td className="border-r border-black p-2 font-mono font-bold">{data.item.lote}</td>
                <td className="border-r border-black p-2 font-mono">{data.item.unidad_embalaje}</td>
                <td className="border-r border-black p-2">{data.item.material}</td>
                <td className="border-r border-black p-2">{data.item.color_bidon}</td>
                <td className="border-r border-black p-2">{data.item.color_asa}</td>
                <td className="border-r border-black p-2 font-mono font-bold">
                  {data.item.cantidad_unidad.toLocaleString('es-CL')}
                </td>
                <td className="p-2 font-bold text-neutral-900 flex items-center justify-center gap-1">
                  <span>{data.item.resultado}</span>
                  <CheckCircle className="w-3 h-3 text-black inline" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Condiciones de Almacenamiento */}
        <div className="mb-8 text-[10.5px] leading-relaxed text-neutral-800">
          <div className="font-bold underline mb-1">Condiciones de almacenamiento:</div>
          <p className="mb-1">{data.condiciones_almacenamiento.descripcion}</p>
          <p className="font-medium">{data.condiciones_almacenamiento.duracion}</p>
        </div>

        {/* Footer Grid: Client / Dispatch Metadata on Left, Signature on Right */}
        <div className="grid grid-cols-12 pt-6 mt-16 border-t border-neutral-300">
          {/* Left Metadata */}
          <div className="col-span-6 space-y-1 text-xs">
            <div className="grid grid-cols-12">
              <span className="col-span-4 font-bold">Cliente</span>
              <span className="col-span-1">:</span>
              <span className="col-span-7 font-semibold uppercase">
                {data.metadatos_despacho.cliente || '(PENDIENTE DE ASIGNACIÓN)'}
              </span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 font-bold">Despacho</span>
              <span className="col-span-1">:</span>
              <span className="col-span-7 font-mono">
                {data.metadatos_despacho.despacho || '(PENDIENTE)'}
              </span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 font-bold">Factura</span>
              <span className="col-span-1">:</span>
              <span className="col-span-7 font-mono">
                {data.metadatos_despacho.factura || '(PENDIENTE)'}
              </span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 font-bold">Fecha</span>
              <span className="col-span-1">:</span>
              <span className="col-span-7 font-mono">{data.metadatos_despacho.fecha}</span>
            </div>
          </div>

          {/* Right Signature Block */}
          <div className="col-span-6 flex flex-col justify-end items-center text-center">
            <div className="w-64 border-b-2 border-black mb-1">
              <div className="text-[10px] text-neutral-400 italic mb-2 select-none">
                {data.responsable.nombre ? 'Firmado digitalmente' : '(Firma pendiente)'}
              </div>
            </div>
            <div className="font-bold text-xs uppercase tracking-tight">
              {data.responsable.nombre || '_______________________________'}
            </div>
            <div className="font-bold text-[9px] uppercase tracking-wider text-neutral-600">
              {data.responsable.cargo || 'DEPTO. CONTROL DE CALIDAD'}
            </div>
          </div>
        </div>

        {/* Watermark / Footer note */}
        <div className="mt-16 text-center text-[8px] text-neutral-400 font-mono">
          Bioplast Chile SpA · Sistema de Aseguramiento de Calidad · Ley REP 20.920 · Documento R-CAL-07
        </div>
      </div>
    </div>
  );
};
