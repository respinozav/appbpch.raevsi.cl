import React, { useState } from 'react';
import { api, ProductionBatchSummary, ProductionTicket } from '../api/client';
import { ZebraLabel } from '../components/ZebraLabel';
import { 
  PlusCircle, Printer, CheckCircle2, AlertCircle, RefreshCw, 
  Package, Sliders, Hash, ArrowRight
} from 'lucide-react';

export const IniciarProduccionView: React.FC<{ onNavigateToBatch?: (codigo: number) => void }> = ({ onNavigateToBatch }) => {
  // Form state
  const [numeroMaquina, setNumeroMaquina] = useState<number | ''>('');
  const [turno, setTurno] = useState<number | ''>('');
  const [operador, setOperador] = useState<number | ''>('');
  const [cantidad, setCantidad] = useState<number | ''>('');
  const [cantidadLotes, setCantidadLotes] = useState<number | ''>(10);
  const [peso, setPeso] = useState<string>('');
  const [articulo, setArticulo] = useState<string>('ENVASE TRAVERSO 1000-24');
  const [material, setMaterial] = useState<string>('PET');
  const [colorBidon, setColorBidon] = useState<string>('');
  const [colorAsa, setColorAsa] = useState<string>('');

  // Request & Feedback states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBatch, setCreatedBatch] = useState<ProductionBatchSummary | null>(null);
  const [selectedTicketIndex, setSelectedTicketIndex] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.createBatch({
        numero_maquina: Number(numeroMaquina) || 1,
        turno: Number(turno) || 1,
        operador: Number(operador) || 1,
        cantidad: Number(cantidad) || 1,
        cantidad_lotes: Number(cantidadLotes) || 1,
        peso: peso.trim() || 'N/A',
        articulo: articulo.trim().toUpperCase(),
        material: material.trim().toUpperCase(),
        color_bidon: (colorBidon.trim() || 'TRANSPARENTE').toUpperCase(),
        color_asa: (colorAsa.trim() || 'VERDE').toUpperCase(),
      });

      setCreatedBatch(res);
      setSelectedTicketIndex(0);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar tirada de producción.');
    } finally {
      setSubmitting(false);
    }
  };

  // Virtual ticket for live preview before creating
  const previewTicket: ProductionTicket = {
    uid: '00000000-0000-0000-0000-000000000000',
    codigo_interno: 110000000,
    fecha: new Date().toISOString(),
    numero_maquina: numeroMaquina !== '' ? Number(numeroMaquina) : 7,
    turno: turno !== '' ? Number(turno) : 1,
    operador: operador !== '' ? Number(operador) : 104,
    cantidad: cantidad !== '' ? Number(cantidad) : 2600,
    lote: 10001,
    unidad_embalaje: '0001',
    peso: peso.trim() || 'N/A',
    articulo: (articulo.trim() || 'ENVASE TRAVERSO 1000-24').toUpperCase(),
    material: (material.trim() || 'PET').toUpperCase(),
    color_bidon: (colorBidon.trim() || 'TRANSPARENTE').toUpperCase(),
    color_asa: (colorAsa.trim() || 'VERDE').toUpperCase(),
    uid_estado: '00000000-0000-0000-0000-000000000000',
    qr_url: 'https://appbpch.raevsi.cl/trazabilidad/preview',
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title: "Iniciar Producción" (without "e impresión zebra") */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15803D]">
              Módulo 2 · Línea de Planta
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0F1F16] tracking-tight mt-1">
            Iniciar Producción
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Formulario 100% adaptable para operadores en planta. Emite tiradas con correlativo estricto y código QR.
          </p>
        </div>

        {createdBatch && (
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={() => {
                setCreatedBatch(null);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#E5ECE6] text-[#0F1F16] bg-white hover:bg-[#EEF6F0] transition"
            >
              Nueva Tirada
            </button>
            <button
              onClick={handlePrintAll}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0D3B22] text-white hover:bg-[#15803D] transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir {createdBatch.total_lotes} Tickets
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Form on Left, Live Zebra Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Form Container (Clean without Plantillas) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5ECE6] p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Atributos del Envase */}
            <div>
              <h2 className="text-xs font-bold text-[#0D3B22] uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-[#E5ECE6] pb-1.5">
                <Package className="w-4 h-4 text-[#15803D]" />
                <span>1. Atributos del Envase</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Artículo / Envase
                  </label>
                  <input
                    type="text"
                    required
                    value={articulo}
                    onChange={(e) => setArticulo(e.target.value)}
                    placeholder="Ej. ENVASE TRAVERSO 1000-24"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] focus:ring-4 focus:ring-[#15803D]/10 uppercase font-medium bg-[#F7FAF7]/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Material
                    </label>
                    <select
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] bg-white font-medium"
                    >
                      <option value="PET">PET Virgen</option>
                      <option value="rPET">rPET Reciclado</option>
                      <option value="HDPE">HDPE (Polietileno)</option>
                      <option value="PP">PP (Polipropileno)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Color Bidón
                    </label>
                    <input
                      type="text"
                      required
                      value={colorBidon}
                      onChange={(e) => setColorBidon(e.target.value)}
                      placeholder="Ej. Transparente, Ámbar, Blanco..."
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] uppercase font-medium bg-[#F7FAF7]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Color Asa
                    </label>
                    <input
                      type="text"
                      required
                      value={colorAsa}
                      onChange={(e) => setColorAsa(e.target.value)}
                      placeholder="Ej. Verde, Rojo, Azul, Negro..."
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] uppercase font-medium bg-[#F7FAF7]/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Datos Operativos de Máquina */}
            <div>
              <h2 className="text-xs font-bold text-[#0D3B22] uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-[#E5ECE6] pb-1.5">
                <Sliders className="w-4 h-4 text-[#15803D]" />
                <span>2. Datos Operativos (Máquina & Turno)</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    N° Máquina (int)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={numeroMaquina}
                    onChange={(e) => setNumeroMaquina(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej. 7"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Turno (1-4)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    required
                    value={turno}
                    onChange={(e) => setTurno(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="1-4"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Operador (int)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={operador}
                    onChange={(e) => setOperador(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej. 104"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Cantidad (UND)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej. 2600"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-mono text-center font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Lotes & Peso */}
            <div>
              <h2 className="text-xs font-bold text-[#0D3B22] uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-[#E5ECE6] pb-1.5">
                <Hash className="w-4 h-4 text-[#15803D]" />
                <span>3. Correlativo de Lotes & Embalaje</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#EEF6F0]/60 border border-[#15803D]/20">
                  <label className="block text-xs font-bold text-[#0D3B22] mb-1">
                    Cantidad de Lotes a Generar (Tickets)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      value={cantidadLotes}
                      onChange={(e) => setCantidadLotes(Number(e.target.value))}
                      className="w-24 px-3 py-2 text-base font-bold font-mono rounded-lg border border-[#15803D]/30 bg-white text-center"
                    />
                    <span className="text-xs text-neutral-600">
                      Tirada calculada: <strong className="text-[#0D3B22] font-mono">{cantidadLotes}</strong> lotes consecutivos
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-2 font-mono">
                    Base: 10.000 · Correlativo automático por base de datos
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Peso por Unidad / Pallet
                  </label>
                  <input
                    type="text"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    placeholder="Ej. N/A o 18.5 kg"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-mono"
                  />
                  <span className="block text-[11px] text-neutral-400 mt-1">
                    Texto abierto para unidad de peso en kilos (ej: "N/A" o valor numérico).
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#15803D] to-[#22C55E] hover:opacity-95 active:scale-[0.99] transition shadow-lg shadow-[#15803D]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generando tirada en base de datos...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    <span>Emitir Tirada ({cantidadLotes} Tickets)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Zebra Thermal Ticket Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full bg-white rounded-2xl border border-[#E5ECE6] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5ECE6]">
              <div>
                <span className="text-xs font-bold text-[#0D3B22] uppercase tracking-wider block">
                  {createdBatch ? 'Tirada Generada Exitosamente' : 'Previsualización en Vivo'}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Formato Térmico Oficial Bioplast Chile SpA
                </span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#15803D] animate-pulse" />
            </div>

            {createdBatch ? (
              <div>
                <div className="mb-4 p-3 rounded-xl bg-[#EEF6F0] border border-[#15803D]/20 text-xs text-[#0D3B22]">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                    <span>Código Interno #{createdBatch.codigo_interno}</span>
                  </div>
                  <div>
                    Rango de Lotes: <strong className="font-mono">{createdBatch.lote_inicio}</strong> a <strong className="font-mono">{createdBatch.lote_fin}</strong> ({createdBatch.total_lotes} tickets).
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4">
                  {createdBatch.lotes.map((t, idx) => (
                    <button
                      key={t.uid}
                      type="button"
                      onClick={() => setSelectedTicketIndex(idx)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition ${
                        selectedTicketIndex === idx
                          ? 'bg-[#0D3B22] text-white border-[#0D3B22] font-bold'
                          : 'bg-[#F7FAF7] text-neutral-600 border-[#E5ECE6] hover:bg-[#EEF6F0]'
                      }`}
                    >
                      Lote {t.lote}
                    </button>
                  ))}
                </div>

                <ZebraLabel ticket={createdBatch.lotes[selectedTicketIndex]} />

                {onNavigateToBatch && (
                  <button
                    onClick={() => onNavigateToBatch(createdBatch.codigo_interno)}
                    className="w-full mt-4 py-2 px-3 rounded-xl border border-[#15803D]/30 text-xs font-bold text-[#0D3B22] bg-[#EEF6F0]/60 hover:bg-[#EEF6F0] transition flex items-center justify-center gap-1.5"
                  >
                    <span>Ver en Sábana de Producción</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <ZebraLabel ticket={previewTicket} showPrintButton={true} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
