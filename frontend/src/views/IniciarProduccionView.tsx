import React, { useState, useEffect } from 'react';
import { api, ProductionBatchSummary, ProductionTicket, SapCodigoInternoItem, OperadorItem } from '../api/client';
import { ZebraLabel } from '../components/ZebraLabel';
import { 
  PlusCircle, Printer, CheckCircle2, AlertCircle, RefreshCw, 
  Package, Sliders, Hash, ArrowRight, Barcode, UserCheck, Layers
} from 'lucide-react';

export const IniciarProduccionView: React.FC<{ onNavigateToBatch?: (codigo: number) => void }> = ({ onNavigateToBatch }) => {
  // Maestro Códigos Internos (SAP)
  const [codigosInternos, setCodigosInternos] = useState<SapCodigoInternoItem[]>([]);
  const [selectedCodigoSap, setSelectedCodigoSap] = useState<string>('');

  // Maestro Operadores
  const [operadores, setOperadores] = useState<OperadorItem[]>([]);
  const [selectedOperadorUid, setSelectedOperadorUid] = useState<string>('');

  // Form state
  const [numeroMaquina, setNumeroMaquina] = useState<number | ''>(7);
  const [turno, setTurno] = useState<number>(1);
  const [cantidad, setCantidad] = useState<number | ''>('');
  const [cantidadLotes, setCantidadLotes] = useState<number>(10);
  const [peso, setPeso] = useState<string>('');
  const [articulo, setArticulo] = useState<string>('ENVASE TRAVERSO 1000-24');
  const [material, setMaterial] = useState<string>('HDPE');
  const [colorBidon, setColorBidon] = useState<string>('');
  const [colorAsa, setColorAsa] = useState<string>('');

  // Cargar listas iniciales
  useEffect(() => {
    api.getAllCodigosInternos()
      .then(items => setCodigosInternos(items))
      .catch(err => console.error('Error cargando códigos internos:', err));

    api.getOperadoresActivos()
      .then(items => {
        setOperadores(items);
        if (items.length > 0) {
          setSelectedOperadorUid(items[0].uid);
        }
      })
      .catch(err => console.error('Error cargando operadores:', err));
  }, []);

  const handleSelectCodigoSap = (codigoSapVal: string) => {
    setSelectedCodigoSap(codigoSapVal);
    const found = codigosInternos.find(c => c.codigosap === codigoSapVal);
    if (found) {
      setArticulo(found.articulo);
      // Materia automática desde el catálogo
      setMaterial(found.materia ? found.materia.toUpperCase() : 'HDPE');
      if (found.color) setColorBidon(found.color);
      if (found.colorasa) setColorAsa(found.colorasa);
      if (found.cantidad) setCantidad(found.cantidad);
    }
  };

  // Request & Feedback states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBatch, setCreatedBatch] = useState<ProductionBatchSummary | null>(null);
  const [selectedTicketIndex, setSelectedTicketIndex] = useState<number>(0);

  const selectedOpObj = operadores.find(o => o.uid === selectedOperadorUid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Obtenemos índice/código numérico y nombre del operador
      const opIndex = operadores.findIndex(o => o.uid === selectedOperadorUid);
      const opCodigoNum = opIndex >= 0 ? opIndex + 1 : 1;
      const opNombre = selectedOpObj ? selectedOpObj.nombre : undefined;

      const res = await api.createBatch({
        numero_maquina: Number(numeroMaquina) || 1,
        turno: Number(turno) || 1,
        operador: opCodigoNum,
        operador_nombre: opNombre,
        cantidad: Number(cantidad) || 1,
        cantidad_lotes: Number(cantidadLotes) || 1,
        peso: peso.trim() || 'N/A',
        articulo: articulo.trim().toUpperCase(),
        material: material.trim().toUpperCase(),
        color_bidon: (colorBidon.trim() || 'TRANSPARENTE').toUpperCase(),
        color_asa: (colorAsa.trim() || 'VERDE').toUpperCase(),
        codigosap: selectedCodigoSap ? selectedCodigoSap.trim() : undefined,
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
    codigosap: selectedCodigoSap || 'SAP-10024',
    fecha: new Date().toISOString(),
    numero_maquina: numeroMaquina !== '' ? Number(numeroMaquina) : 7,
    turno: Number(turno) || 1,
    operador: selectedOpObj ? 1 : 104,
    operador_nombre: selectedOpObj ? selectedOpObj.nombre : 'Operador 1',
    cantidad: cantidad !== '' ? Number(cantidad) : 2600,
    lote: 10001,
    unidad_embalaje: '0001',
    peso: peso.trim() || 'N/A',
    articulo: (articulo.trim() || 'ENVASE TRAVERSO 1000-24').toUpperCase(),
    material: (material.trim() || 'HDPE').toUpperCase(),
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
      {/* Page Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15803D]">
              Módulo 3 · Línea de Planta
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0F1F16] tracking-tight mt-1">
            Iniciar Producción
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Formulario 100% adaptable para operadores en planta. Emite 1 solo lote por tirada con unidades correlativas de embalaje.
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
        {/* LEFT COLUMN: Form Container */}
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
                <span>1. Atributos del Envase & Catálogo SAP</span>
              </h2>

              <div className="space-y-3">
                {codigosInternos.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#F7FAF7] border border-[#E5ECE6]">
                    <label className="block text-xs font-bold text-[#0D3B22] mb-1 flex items-center gap-1.5">
                      <Barcode className="w-3.5 h-3.5 text-[#15803D]" />
                      <span>Seleccionar Artículo por Código SAP / Interno</span>
                    </label>
                    <select
                      value={selectedCodigoSap}
                      onChange={(e) => handleSelectCodigoSap(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:border-[#15803D] bg-white font-medium"
                    >
                      <option value="">-- Seleccionar Código SAP --</option>
                      {codigosInternos.map(c => (
                        <option key={c.uid} value={c.codigosap}>
                          {c.codigosap} · {c.articulo} ({c.materia || 'HDPE'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Artículo / Denominación de Envase
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
                  {/* Materia: Auto-completado y Solo Lectura */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                      <span>Materia Prima</span>
                      <span className="text-[10px] text-neutral-400 font-mono">Auto</span>
                    </label>
                    <div className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#E5ECE6] bg-[#F7FAF7] text-[#0D3B22] font-bold flex items-center justify-between">
                      <span>{material || 'HDPE VIRGEN'}</span>
                      <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Color
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
                <span>2. Datos Operativos (Máquina, Turno & Operador)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    N° Máquina (Línea)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={numeroMaquina}
                    onChange={(e) => setNumeroMaquina(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej. 7"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-mono text-center font-bold"
                  />
                </div>

                {/* Turno Restringido: Turno 1, 2, 3 */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Turno (1 a 3)
                  </label>
                  <select
                    value={turno}
                    onChange={(e) => setTurno(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] bg-white font-semibold text-center"
                  >
                    <option value={1}>Turno 1</option>
                    <option value={2}>Turno 2</option>
                    <option value={3}>Turno 3</option>
                  </select>
                </div>

                {/* Operador: Select dinámico desde tabla operadores */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                    <span>Operador Responsable</span>
                    <UserCheck className="w-3.5 h-3.5 text-[#15803D]" />
                  </label>
                  {operadores.length > 0 ? (
                    <select
                      value={selectedOperadorUid}
                      onChange={(e) => setSelectedOperadorUid(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] bg-white font-medium"
                    >
                      {operadores.map((op) => (
                        <option key={op.uid} value={op.uid}>
                          {op.nombre} {op.rut ? `(${op.rut})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3 py-2 text-xs text-neutral-400 bg-neutral-50 rounded-xl border border-dashed border-[#E5ECE6]">
                      Sin operadores cargados
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Lotes & Peso */}
            <div>
              <h2 className="text-xs font-bold text-[#0D3B22] uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-[#E5ECE6] pb-1.5">
                <Hash className="w-4 h-4 text-[#15803D]" />
                <span>3. Unidades de Embalaje, Cantidad & Peso</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Cantidad por Embalaje
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
                  <span className="block text-[10px] text-neutral-400 mt-1">Unidades por pallet/paquete</span>
                </div>

                <div className="p-3 rounded-xl bg-[#EEF6F0]/60 border border-[#15803D]/20">
                  <label className="block text-xs font-bold text-[#0D3B22] mb-1">
                    Total Embalajes (Tickets)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      required
                      value={cantidadLotes}
                      onChange={(e) => setCantidadLotes(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-sm font-bold font-mono rounded-lg border border-[#15803D]/30 bg-white text-center"
                    />
                    <span className="text-[11px] text-neutral-700">
                      Rango: <strong className="text-[#0D3B22] font-mono">0001-{String(cantidadLotes).padStart(4, '0')}</strong>
                    </span>
                  </div>
                  <span className="block text-[10px] text-neutral-500 mt-1 font-mono">1 lote único</span>
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
                  <span className="block text-[10px] text-neutral-400 mt-1">
                    Peso en kilos (ej: "N/A" o valor).
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
                    <span>Emitir Tirada ({cantidadLotes} Unidades de Embalaje)</span>
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
                <div className="mb-4 p-3.5 rounded-xl bg-[#EEF6F0] border border-[#15803D]/20 text-xs text-[#0D3B22] space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                      <span>CÓDIGO SAP / INTERNO:</span>
                    </span>
                    <span className="font-mono px-2 py-0.5 rounded bg-white border border-[#15803D]/30 font-black">
                      {createdBatch.codigosap || createdBatch.codigo_interno}
                    </span>
                  </div>
                  <div className="text-neutral-700 pt-1 border-t border-[#15803D]/10 flex justify-between">
                    <span>Lote Único: <strong className="font-mono text-[#0D3B22]">LOTE {createdBatch.lote_inicio}</strong></span>
                    <span>Total Embalajes: <strong className="font-mono">{createdBatch.total_lotes}</strong></span>
                  </div>
                  <div className="text-[11px] text-[#15803D] font-bold">
                    Rango de unidad de embalaje: 0001 al {String(createdBatch.total_lotes).padStart(4, '0')}
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
                      Emb. {t.unidad_embalaje}
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
