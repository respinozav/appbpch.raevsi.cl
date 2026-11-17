import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ProductionTicket } from '../api/client';
import { ZebraConfig, getStoredZebraConfig } from '../utils/zebraConfig';
import { Printer, ExternalLink, Settings } from 'lucide-react';

interface ZebraLabelProps {
  ticket: ProductionTicket;
  showPrintButton?: boolean;
  zebraConfig?: ZebraConfig;
}

export const ZebraLabel: React.FC<ZebraLabelProps> = ({ 
  ticket, 
  showPrintButton = true,
  zebraConfig
}) => {
  const activeConfig = zebraConfig || getStoredZebraConfig();
  const qrUrl = ticket.qr_url || `https://appbpch.raevsi.cl/trazabilidad/${ticket.uid}`;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(ticket.fecha).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const shortUid = typeof ticket.uid === 'string' ? ticket.uid.slice(0, 8) : ticket.uid;

  return (
    <div className="flex flex-col items-center">
      {/* Physical Zebra Ticket Container */}
      <div 
        className="printable-area printable-ticket bg-white text-black border-2 border-black p-4 w-[380px] sm:w-[420px] shadow-md select-none font-sans"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        {/* Top Header: BIOPLAST SPA in black box */}
        <div className="border-4 border-black p-1 text-center bg-black text-white tracking-[0.25em] font-black text-2xl uppercase">
          BIOPLAST SPA
        </div>

        {/* Product / Article Name */}
        <div className="border-x-2 border-b-2 border-black px-2 py-1 text-center font-black text-xl uppercase tracking-tight text-neutral-900 border-t-0">
          {ticket.articulo || 'ENVASE TRAVERSO 1000-24'}
        </div>

        {/* Internal Code Bar */}
        <div className="text-center font-bold tracking-widest text-xs py-1 border-x-2 border-b-2 border-black flex items-center justify-center gap-2">
          <span>CODIGO INTERNO</span>
          <span className="font-mono text-sm font-black px-1.5 py-0.5 bg-neutral-100 border border-black/40">
            {ticket.codigosap || ticket.codigo_interno}
          </span>
        </div>

        {/* Operational Grid Table */}
        <div className="border-2 border-black mt-1 text-xs">
          {/* Row 1: Fecha */}
          <div className="grid grid-cols-12 border-b-2 border-black">
            <div className="col-span-5 font-bold uppercase p-1.5 border-r-2 border-black bg-neutral-100/60 flex items-center">
              FECHA
            </div>
            <div className="col-span-7 font-mono font-bold p-1.5 text-sm flex items-center">
              {formattedDate}
            </div>
          </div>

          {/* Row 2: Máquina / Turno / Operador */}
          <div className="grid grid-cols-12 border-b-2 border-black">
            <div className="col-span-5 font-bold uppercase p-1.5 border-r-2 border-black bg-neutral-100/60 flex items-center">
              MÁQ. / TURNO / OP
            </div>
            <div className="col-span-7 font-mono font-bold p-1.5 text-sm sm:text-base flex items-center truncate" title={ticket.operador_nombre || String(ticket.operador)}>
              {ticket.numero_maquina} / {ticket.turno} / {ticket.operador_nombre || ticket.operador}
            </div>
          </div>

          {/* Row 3: Cantidad */}
          <div className="grid grid-cols-12 border-b-2 border-black">
            <div className="col-span-5 font-bold uppercase p-1.5 border-r-2 border-black bg-neutral-100/60 flex items-center">
              CANTIDAD
            </div>
            <div className="col-span-7 font-mono font-extrabold p-1.5 text-lg flex items-center">
              {ticket.cantidad.toLocaleString('es-CL')} UND.
            </div>
          </div>

          {/* Row 4: Lote */}
          <div className="grid grid-cols-12 border-b-2 border-black">
            <div className="col-span-5 font-bold uppercase p-1.5 border-r-2 border-black bg-neutral-100/60 flex items-center">
              LOTE
            </div>
            <div className="col-span-7 font-mono font-black p-1 text-2xl text-center tracking-wider">
              {ticket.lote}
            </div>
          </div>

          {/* Row 5: Unidad de Embalaje */}
          <div className="grid grid-cols-12 border-b-2 border-black">
            <div className="col-span-5 font-bold uppercase p-1.5 border-r-2 border-black bg-neutral-100/60 flex items-center">
              UNIDAD DE EMBALAJE
            </div>
            <div className="col-span-7 font-mono font-black p-1 text-2xl text-center tracking-wider">
              {ticket.unidad_embalaje}
            </div>
          </div>

          {/* Row 6: Peso + QR Code corner */}
          <div className="grid grid-cols-12 relative min-h-[70px]">
            <div className="col-span-5 font-bold uppercase p-1.5 border-r-2 border-black bg-neutral-100/60 flex items-center">
              PESO
            </div>
            <div className="col-span-4 font-mono font-bold p-1.5 text-base flex items-center">
              {ticket.peso || 'N/A'}
            </div>
            {/* Miniature QR visible in bottom right corner */}
            <div className="col-span-3 border-l-2 border-black p-1 flex flex-col items-center justify-center bg-white">
              <QRCodeSVG 
                value={qrUrl} 
                size={54} 
                level="M" 
                includeMargin={false}
              />
              <span className="text-[7px] font-mono tracking-tighter text-neutral-600 mt-0.5 truncate max-w-[70px]" title={String(ticket.uid)}>
                UID {shortUid}
              </span>
            </div>
          </div>
        </div>

        {/* Traceability footer indicator & active Zebra dimensions */}
        <div className="mt-1 flex justify-between items-center text-[9px] text-neutral-500 font-mono">
          <span>{ticket.material} · {ticket.color_bidon} / {ticket.color_asa}</span>
          <span className="font-bold text-neutral-600">
            {activeConfig.anchoMm}x{activeConfig.altoMm}mm · {activeConfig.dpi}DPI
          </span>
        </div>
      </div>

      {/* Action Buttons (Hidden on Print) */}
      {showPrintButton && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 no-print">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0D3B22] text-white hover:bg-[#15803D] transition shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Ticket ({activeConfig.anchoMm}x{activeConfig.altoMm}mm)
          </button>
          <a
            href={`/trazabilidad/${ticket.uid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E5ECE6] text-[#0F1F16] hover:bg-[#EEF6F0] transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            Probar Link QR
          </a>
        </div>
      )}
    </div>
  );
};
