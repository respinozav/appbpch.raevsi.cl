import React, { useState, useEffect } from 'react';
import { 
  api, ProductionBatchSummary, ProductionTicket, SapCodigoInternoItem, 
  OperadorItem, LoteItemSummary 
} from '../api/client';
import { ZebraLabel } from '../components/ZebraLabel';
import { ZebraConfig, getStoredZebraConfig } from '../utils/zebraConfig';
import { 
  PlusCircle, Printer, CheckCircle2, AlertCircle, RefreshCw, 
  Package, Sliders, Hash, ArrowRight, Barcode, UserCheck, Layers,
  Search, Check
} from 'lucide-react';

type ProductionMode = 'new_batch' | 'append_units';

export const IniciarProduccionView: React.FC<{ onNavigateToBatch?: (codigo: number) => void }> = ({ onNavigateToBatch }) => {
  // Modo de operación: Nueva Tirada (lote nuevo) o Agregar Unidades (lote existente)
  const [mode, setMode] = useState<ProductionMode>('new_batch');

  // Maestro Códigos Internos (SAP)
  const [codigosInternos, setCodigosInternos] = useState<SapCodigoInternoItem[]>([]);
  const [selectedCodigoSap, setSelectedCodigoSap] = useState<string>('');

  // Maestro Operadores
  const [operadores, setOperadores] = useState<OperadorItem[]>([]);
  const [selectedOperadorUid, setSelectedOperadorUid] = useState<string>('');

  // Form state - Modo 1: Nueva Tirada
  const [numeroMaquina, setNumeroMaquina] = useState<number | ''>(7);
  const [turno, setTurno] = useState<number>(1);
  const [cantidad, setCantidad] = useState<number | ''>('');
  const [cantidadLotes, setCantidadLotes] = useState<number>(10);
  const [peso, setPeso] = useState<string>('');
  const [articulo, setArticulo] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [colorBidon, setColorBidon] = useState<string>('');
  const [colorAsa, setColorAsa] = useState<string>('');

  // Form state - Modo 2: Agregar Unidades a Lote Existente
  const [lotesActivos, setLotesActivos] = useState<LoteItemSummary[]>([]);
  const [loadingLotes, setLoadingLotes] = useState<boolean>(false);
  const [searchLoteTerm, setSearchLoteTerm] = useState<string>('');
  const [selectedLoteItem, setSelectedLoteItem] = useState<LoteItemSummary | null>(null);
  const [appendCantidadLotes, setAppendCantidadLotes] = useState<number>(5);
  const [appendNumeroMaquina, setAppendNumeroMaquina] = useState<number | ''>('');
  const [appendTurno, setAppendTurno] = useState<number>(1);
  const [appendPeso, setAppendPeso] = useState<string>('');

  // Configuración de Zebra activa (dimensiones, mandril y DPI)
  const [zebraConfig, setZebraConfig] = useState<ZebraConfig>(getStoredZebraConfig);

  // Request & Feedback states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBatch, setCreatedBatch] = useState<ProductionBatchSummary | null>(null);
  const [selectedTicketIndex, setSelectedTicketIndex] = useState<number>(0);

  // Cargar lotes activos para el combobox
  const fetchLotesActivos = async (search?: string) => {
    setLoadingLotes(true);
    try {
      const items = await api.getLotesActivos(search);
      setLotesActivos(items);
    } catch (err) {
      console.error('Error cargando lotes activos:', err);
    } finally {
      setLoadingLotes(false);
    }
  };

  // Cargar listas iniciales y escuchar cambios de configuración de Zebra
  useEffect(() => {
    const handleZebraConfigUpdate = (e: any) => {
      if (e.detail) {
        setZebraConfig(e.detail);
      } else {
        setZebraConfig(getStoredZebraConfig());
      }
    };
    window.addEventListener('bpch_zebra_config_updated', handleZebraConfigUpdate);

    api.getAllCodigosInternos()
      .then(items => {
        setCodigosInternos(items);
      })
      .catch(err => console.error('Error cargando códigos internos:', err));

    api.getOperadoresActivos()
      .then(items => {
        setOperadores(items);
        if (items.length > 0) {
          setSelectedOperadorUid(items[0].uid);
        }
      })
      .catch(err => console.error('Error cargando operadores:', err));

    fetchLotesActivos();

    return () => {
      window.removeEventListener('bpch_zebra_config_updated', handleZebraConfigUpdate);
    };
  }, []);

  const handleSelectCodigoSap = (codigoSapVal: string) => {
    setSelectedCodigoSap(codigoSapVal);
    const found = codigosInternos.find(c => c.codigosap === codigoSapVal);
    if (found) {
      setArticulo(found.articulo || '');
      setMaterial(found.materia ? found.materia.toUpperCase() : 'HDPE');
      setColorBidon(found.color || 'TRANSPARENTE');
      setColorAsa(found.colorasa || 'VERDE');
      if (found.cantidad) setCantidad(found.cantidad);
    } else {
      setArticulo('');
      setMaterial('');
      setColorBidon('');
      setColorAsa('');
    }
  };

  const handleSelectLote = (loteNum: number) => {
    const found = lotesActivos.find(l => l.lote === loteNum);
    if (found) {
      setSelectedLoteItem(found);
      setAppendNumeroMaquina(found.numero_maquina);
      setAppendTurno(found.turno || 1);
      setAppendPeso(found.peso && found.peso !== 'N/A' ? found.peso : '');
    } else {
      setSelectedLoteItem(null);
    }
  };

  const selectedOpObj = operadores.find(o => o.uid === selectedOperadorUid);

  // Submit Modo 1: Nueva Tirada (Lote Nuevo)
  const handleSubmitNewBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
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

      // Limpiar sección 1 tras emitir la tirada
      setSelectedCodigoSap('');
      setArticulo('');
      setMaterial('');
      setColorBidon('');
      setColorAsa('');

      // Refrescar listado de lotes para el modo 2
      fetchLotesActivos();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar tirada de producción.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Modo 2: Agregar Unidades a Lote Existente
  const handleSubmitAppendUnits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoteItem) {
      setError('Por favor selecciona un lote existente antes de emitir.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const opIndex = operadores.findIndex(o => o.uid === selectedOperadorUid);
      const opCodigoNum = opIndex >= 0 ? opIndex + 1 : 1;
      const opNombre = selectedOpObj ? selectedOpObj.nombre : undefined;

      const res = await api.appendUnitsToBatch({
        lote: selectedLoteItem.lote,
        cantidad_lotes: Number(appendCantidadLotes) || 1,
        numero_maquina: appendNumeroMaquina !== '' ? Number(appendNumeroMaquina) : undefined,
        turno: Number(appendTurno) || 1,
        operador: opCodigoNum,
        operador_nombre: opNombre,
        peso: appendPeso.trim() || selectedLoteItem.peso,
      });

      setCreatedBatch(res);
      setSelectedTicketIndex(0);

      // Refrescar listado de lotes
      await fetchLotesActivos();
      // Actualizar el item seleccionado con los nuevos datos
      const updated = lotesActivos.find(l => l.lote === selectedLoteItem.lote);
      if (updated) {
        setSelectedLoteItem(updated);
      }
    } catch (err: any) {
      setError(err.message || 'Error al agregar unidades de embalaje al lote.');
    } finally {
      setSubmitting(false);
    }
  };

  // Cálculo correlativo proyectado para el lote seleccionado
  const nextNumCorrelativo = selectedLoteItem 
    ? (parseInt(selectedLoteItem.ultimo_embalaje || '0', 10) || 0) + 1 
    : 1;
  const nextEmbStr = String(nextNumCorrelativo).padStart(4, '0');
  const endEmbStr = String(nextNumCorrelativo + Math.max(1, appendCantidadLotes) - 1).padStart(4, '0');

  // Virtual ticket for live preview
  const previewTicket: ProductionTicket = mode === 'new_batch' ? {
    uid: '00000000-0000-0000-0000-000000000000',
    codigo_interno: 110000000,
    codigosap: selectedCodigoSap || 'SIN SELECCIONAR',
    fecha: new Date().toISOString(),
    numero_maquina: numeroMaquina !== '' ? Number(numeroMaquina) : 7,
    turno: Number(turno) || 1,
    operador: selectedOpObj ? 1 : 104,
    operador_nombre: selectedOpObj ? selectedOpObj.nombre : 'Operador 1',
    cantidad: cantidad !== '' ? Number(cantidad) : 2600,
    lote: 10001,
    unidad_embalaje: '0001',
    peso: peso.trim() || 'N/A',
    articulo: (articulo.trim() || 'SELECCIONE CÓDIGO INTERNO').toUpperCase(),
    material: (material.trim() || 'HDPE').toUpperCase(),
    color_bidon: (colorBidon.trim() || 'TRANSPARENTE').toUpperCase(),
    color_asa: (colorAsa.trim() || 'VERDE').toUpperCase(),
    uid_estado: '00000000-0000-0000-0000-000000000000',
    qr_url: 'https://appbpch.raevsi.cl/trazabilidad/preview',
  } : {
    uid: '00000000-0000-0000-0000-000000000000',
    codigo_interno: selectedLoteItem ? selectedLoteItem.codigo_interno : 110000000,
    codigosap: selectedLoteItem?.codigosap || 'SIN SELECCIONAR',
    fecha: new Date().toISOString(),
    numero_maquina: appendNumeroMaquina !== '' ? Number(appendNumeroMaquina) : (selectedLoteItem?.numero_maquina || 7),
    turno: Number(appendTurno) || 1,
    operador: selectedOpObj ? 1 : 104,
    operador_nombre: selectedOpObj ? selectedOpObj.nombre : 'Operador 1',
    cantidad: selectedLoteItem ? selectedLoteItem.cantidad_unitaria : 2600,
    lote: selectedLoteItem ? selectedLoteItem.lote : 10001,
    unidad_embalaje: selectedLoteItem ? nextEmbStr : '----',
    peso: appendPeso.trim() || (selectedLoteItem?.peso || 'N/A'),
    articulo: (selectedLoteItem?.articulo || 'SELECCIONE LOTE EXISTENTE').toUpperCase(),
    material: (selectedLoteItem?.material || 'HDPE').toUpperCase(),
    color_bidon: (selectedLoteItem?.color_bidon || 'TRANSPARENTE').toUpperCase(),
    color_asa: (selectedLoteItem?.color_asa || 'VERDE').toUpperCase(),
    uid_estado: selectedLoteItem ? selectedLoteItem.uid_estado : '00000000-0000-0000-0000-000000000000',
    qr_url: 'https://appbpch.raevsi.cl/trazabilidad/preview',
  };

  const handlePrintAll = () => {
    window.print();
  };

  // Filtrado de lotes para el combobox
  const filteredLotes = lotesActivos.filter(l => {
    if (!searchLoteTerm.trim()) return true;
    const term = searchLoteTerm.toLowerCase().trim();
    return (
      String(l.lote).includes(term) ||
      String(l.codigo_interno).includes(term) ||
      (l.codigosap && l.codigosap.toLowerCase().includes(term)) ||
      l.articulo.toLowerCase().includes(term)
    );
  });

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
            Iniciar Producción & Emisión de Etiquetas
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Crea nuevas tiradas con lotes nuevos correlativos o agrega más unidades de embalaje sobre un lote ya creado.
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
              Nueva Emisión
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

      {/* Selector de Modo de Producción */}
      <div className="flex items-center p-1.5 bg-[#EEF6F0] rounded-2xl border border-[#E5ECE6] mb-6 max-w-2xl">
        <button
          type="button"
          onClick={() => {
            setMode('new_batch');
            setCreatedBatch(null);
            setError(null);
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'new_batch'
              ? 'bg-white text-[#0D3B22] shadow-sm border border-[#E5ECE6]'
              : 'text-neutral-600 hover:text-[#0D3B22]'
          }`}
        >
          <PlusCircle className={`w-4 h-4 ${mode === 'new_batch' ? 'text-[#15803D]' : 'text-neutral-400'}`} />
          <span>1. Nueva Tirada (Nuevo Lote)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('append_units');
            setCreatedBatch(null);
            setError(null);
            if (lotesActivos.length === 0) fetchLotesActivos();
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'append_units'
              ? 'bg-white text-[#0D3B22] shadow-sm border border-[#E5ECE6]'
              : 'text-neutral-600 hover:text-[#0D3B22]'
          }`}
        >
          <Layers className={`w-4 h-4 ${mode === 'append_units' ? 'text-[#15803D]' : 'text-neutral-400'}`} />
          <span>2. Agregar Unidades a Lote Existente</span>
        </button>
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

          {/* MODO 1: NUEVA TIRADA (NUEVO LOTE) */}
          {mode === 'new_batch' && (
            <form onSubmit={handleSubmitNewBatch} className="space-y-6">
              {/* Section 1: Atributos del Envase */}
              <div>
                <h2 className="text-xs font-bold text-[#0D3B22] uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-[#E5ECE6] pb-1.5">
                  <Package className="w-4 h-4 text-[#15803D]" />
                  <span>1. Atributos del Envase & Catálogo de Códigos Internos</span>
                </h2>

                <div className="space-y-3">
                  {codigosInternos.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#F7FAF7] border border-[#E5ECE6]">
                      <label className="block text-xs font-bold text-[#0D3B22] mb-1 flex items-center gap-1.5">
                        <Barcode className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Seleccionar Artículo por Código Interno</span>
                      </label>
                      <select
                        value={selectedCodigoSap}
                        onChange={(e) => handleSelectCodigoSap(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:border-[#15803D] bg-white font-medium"
                      >
                        <option value="">-- Seleccionar Código Interno --</option>
                        {codigosInternos.map(c => (
                          <option key={c.uid} value={c.codigosap}>
                            {c.codigosap} · {c.articulo} ({c.materia || 'HDPE'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Artículo / Denominación: Solo lectura desde Catálogo */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                      <span>Artículo / Denominación de Envase</span>
                      <span className="text-[10px] text-neutral-400 font-mono">Solo Lectura · Código Interno</span>
                    </label>
                    <div className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${articulo ? 'border-[#E5ECE6] bg-[#F7FAF7] text-[#0D3B22]' : 'border-dashed border-amber-300 bg-amber-50/40 text-amber-800'} font-bold flex items-center justify-between`}>
                      <span>{articulo || 'SELECCIONE CÓDIGO INTERNO ARRIBA'}</span>
                      <span className={`w-2 h-2 rounded-full ${articulo ? 'bg-[#15803D]' : 'bg-amber-400'}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Materia Prima: Solo Lectura desde Catálogo */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                        <span>Materia Prima</span>
                        <span className="text-[10px] text-neutral-400 font-mono">Auto</span>
                      </label>
                      <div className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border ${material ? 'border-[#E5ECE6] bg-[#F7FAF7] text-[#0D3B22]' : 'border-dashed border-neutral-300 bg-neutral-50 text-neutral-400'} font-bold flex items-center justify-between`}>
                        <span>{material || '---'}</span>
                        <span className={`w-2 h-2 rounded-full ${material ? 'bg-[#15803D]' : 'bg-neutral-300'}`} />
                      </div>
                    </div>

                    {/* Color: Solo Lectura desde Catálogo */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                        <span>Color</span>
                        <span className="text-[10px] text-neutral-400 font-mono">Auto</span>
                      </label>
                      <div className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border ${colorBidon ? 'border-[#E5ECE6] bg-[#F7FAF7] text-[#0D3B22]' : 'border-dashed border-neutral-300 bg-neutral-50 text-neutral-400'} font-bold flex items-center justify-between`}>
                        <span>{colorBidon || '---'}</span>
                        <span className={`w-2 h-2 rounded-full ${colorBidon ? 'bg-[#15803D]' : 'bg-neutral-300'}`} />
                      </div>
                    </div>

                    {/* Color Asa: Solo Lectura desde Catálogo */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                        <span>Color Asa</span>
                        <span className="text-[10px] text-neutral-400 font-mono">Auto</span>
                      </label>
                      <div className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border ${colorAsa ? 'border-[#E5ECE6] bg-[#F7FAF7] text-[#0D3B22]' : 'border-dashed border-neutral-300 bg-neutral-50 text-neutral-400'} font-bold flex items-center justify-between`}>
                        <span>{colorAsa || '---'}</span>
                        <span className={`w-2 h-2 rounded-full ${colorAsa ? 'bg-[#15803D]' : 'bg-neutral-300'}`} />
                      </div>
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
                    <span className="block text-[10px] text-neutral-500 mt-1 font-mono">1 lote nuevo</span>
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
                  disabled={submitting || !selectedCodigoSap || !articulo.trim()}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#15803D] to-[#22C55E] hover:opacity-95 active:scale-[0.99] transition shadow-lg shadow-[#15803D]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
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
                {(!selectedCodigoSap || !articulo.trim()) && (
                  <p className="text-center text-xs text-amber-700 mt-2.5 font-medium flex items-center justify-center gap-1.5 bg-amber-50 py-2 px-3 rounded-lg border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>Seleccione un Artículo por Código Interno para habilitar la emisión</span>
                  </p>
                )}
              </div>
            </form>
          )}

          {/* MODO 2: AGREGAR UNIDADES A LOTE EXISTENTE */}
          {mode === 'append_units' && (
            <form onSubmit={handleSubmitAppendUnits} className="space-y-6">
              {/* Sección Buscador Combobox de Lote */}
              <div>
                <div className="flex items-center justify-between border-b border-[#E5ECE6] pb-1.5 mb-3">
                  <h2 className="text-xs font-bold text-[#0D3B22] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#15803D]" />
                    <span>1. Búsqueda y Selección de Lote Existente</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => fetchLotesActivos(searchLoteTerm)}
                    className="text-[11px] font-semibold text-[#15803D] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingLotes ? 'animate-spin' : ''}`} />
                    <span>Actualizar lotes</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Buscador de texto rápido para filtrar el combobox */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchLoteTerm}
                      onChange={(e) => setSearchLoteTerm(e.target.value)}
                      placeholder="Filtrar por N° Lote, Código Interno o Artículo..."
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] bg-white"
                    />
                  </div>

                  {/* Combobox Select de Lotes */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Seleccionar Lote en Producción / Planta:
                    </label>
                    <select
                      value={selectedLoteItem?.lote || ''}
                      onChange={(e) => handleSelectLote(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#E5ECE6] focus:border-[#15803D] bg-white font-medium shadow-sm"
                    >
                      <option value="">-- Seleccione un Lote Existente ({filteredLotes.length} disponibles) --</option>
                      {filteredLotes.map((l) => (
                        <option key={l.lote} value={l.lote}>
                          Lote #{l.lote} · {l.articulo} · Tirada #{l.codigo_interno} · Emb. {l.primer_embalaje} a {l.ultimo_embalaje} ({l.total_embalajes} un.)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tarjeta de Resumen del Lote Seleccionado */}
                  {selectedLoteItem ? (
                    <div className="p-4 rounded-xl bg-[#F7FAF7] border border-[#15803D]/25 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E5ECE6]">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-[#0D3B22] text-white font-mono font-extrabold text-xs">
                            LOTE #{selectedLoteItem.lote}
                          </span>
                          <span className="text-xs font-bold text-neutral-600 font-mono">
                            Tirada #{selectedLoteItem.codigo_interno}
                          </span>
                        </div>
                        {selectedLoteItem.estado_nombre && (
                          <span 
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                            style={{ 
                              backgroundColor: `${selectedLoteItem.estado_color || '#15803D'}20`, 
                              color: selectedLoteItem.estado_color || '#15803D' 
                            }}
                          >
                            {selectedLoteItem.estado_nombre}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Artículo</span>
                          <strong className="text-[#0D3B22]">{selectedLoteItem.articulo}</strong>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Material / Colores</span>
                          <span className="font-medium text-neutral-800">
                            {selectedLoteItem.material} · Bidón: {selectedLoteItem.color_bidon} / Asa: {selectedLoteItem.color_asa}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Embalajes Actuales Registrados</span>
                          <span className="font-mono text-neutral-700">
                            {selectedLoteItem.primer_embalaje} al {selectedLoteItem.ultimo_embalaje} ({selectedLoteItem.total_embalajes} unidades)
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Próximo Correlativo a Emitir</span>
                          <span className="font-mono font-black text-sm text-[#15803D] flex items-center gap-1">
                            <span>Emb. {nextEmbStr}</span>
                            <Check className="w-3.5 h-3.5 text-[#15803D]" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-amber-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Por favor seleccione un lote existente arriba para configurar las unidades adicionales.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección Parámetros Operativos para Nuevas Unidades */}
              {selectedLoteItem && (
                <>
                  <div>
                    <h2 className="text-xs font-bold text-[#0D3B22] uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-[#E5ECE6] pb-1.5">
                      <Sliders className="w-4 h-4 text-[#15803D]" />
                      <span>2. Parámetros Operativos de la Adición</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          N° Máquina
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={appendNumeroMaquina}
                          onChange={(e) => setAppendNumeroMaquina(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Ej. 7"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-mono text-center font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Turno
                        </label>
                        <select
                          value={appendTurno}
                          onChange={(e) => setAppendTurno(Number(e.target.value))}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] bg-white font-semibold text-center"
                        >
                          <option value={1}>Turno 1</option>
                          <option value={2}>Turno 2</option>
                          <option value={3}>Turno 3</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                          <span>Operador Responsable</span>
                          <UserCheck className="w-3.5 h-3.5 text-[#15803D]" />
                        </label>
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
                      </div>
                    </div>
                  </div>

                  {/* Sección Cantidad Correlativa a Emitir */}
                  <div>
                    <h2 className="text-xs font-bold text-[#0D3B22] uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-[#E5ECE6] pb-1.5">
                      <Hash className="w-4 h-4 text-[#15803D]" />
                      <span>3. Embalajes Adicionales Correlativos</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl bg-[#EEF6F0] border border-[#15803D]/25">
                        <label className="block text-xs font-bold text-[#0D3B22] mb-1">
                          Cantidad de Unidades de Embalaje a Emitir:
                        </label>
                        <div className="flex items-center gap-3 mt-1">
                          <input
                            type="number"
                            min={1}
                            max={500}
                            required
                            value={appendCantidadLotes}
                            onChange={(e) => setAppendCantidadLotes(Math.max(1, Number(e.target.value)))}
                            className="w-20 px-3 py-1.5 text-base font-bold font-mono rounded-lg border border-[#15803D]/40 bg-white text-center text-[#0D3B22]"
                          />
                          <div className="text-xs text-neutral-700">
                            <div>Rango Correlativo Resultante:</div>
                            <strong className="text-[#0D3B22] font-mono text-sm">
                              {nextEmbStr} al {endEmbStr}
                            </strong>
                          </div>
                        </div>
                        <span className="block text-[10px] text-neutral-500 mt-2 font-mono">
                          Correlativo garantizado sin saltos sobre el Lote #{selectedLoteItem.lote}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Peso por Unidad / Pallet
                        </label>
                        <input
                          type="text"
                          value={appendPeso}
                          onChange={(e) => setAppendPeso(e.target.value)}
                          placeholder="Ej. 18.5 kg o N/A"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-mono"
                        />
                        <span className="block text-[10px] text-neutral-400 mt-1">
                          Heredado del lote o modificado según pesaje actual.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button Modo 2 */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting || !selectedLoteItem || appendCantidadLotes < 1}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0D3B22] via-[#15803D] to-[#22C55E] hover:opacity-95 active:scale-[0.99] transition shadow-lg shadow-[#15803D]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Guardando nuevas unidades de embalaje...</span>
                        </>
                      ) : (
                        <>
                          <Layers className="w-5 h-5" />
                          <span>Emitir {appendCantidadLotes} Unidades (Correlativos {nextEmbStr} a {endEmbStr})</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: Live Zebra Thermal Ticket Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full bg-white rounded-2xl border border-[#E5ECE6] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5ECE6]">
              <div>
                <span className="text-xs font-bold text-[#0D3B22] uppercase tracking-wider block">
                  {createdBatch ? 'Unidades Generadas Exitosamente' : 'Previsualización en Vivo'}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {mode === 'new_batch' ? 'Nueva Tirada · Lote Único' : 'Adición Correlativa sobre Lote'}
                </span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#15803D] animate-pulse" />
            </div>

            {/* Panel Técnico de Configuración Zebra Activa & Advertencia de Bobina */}
            <div className="mb-4 p-3 rounded-xl bg-[#F7FAF7] border border-[#15803D]/25 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-[#EEF6F0] text-[#15803D]">
                    <Printer className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-extrabold text-[#0D3B22] block">
                      Configuración Zebra: {zebraConfig.anchoMm} x {zebraConfig.altoMm} mm
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {zebraConfig.dpi} DPI · Mandril {zebraConfig.mandrilPulgadas}" · Sensor {zebraConfig.sensorTipo === 'gap' ? 'Separación (Gap)' : zebraConfig.sensorTipo} · Oscuridad {zebraConfig.darkness}/30
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                  {zebraConfig.presetId}
                </span>
              </div>

              {/* Advertencia visual previa a la impresión */}
              <div className="pt-2 border-t border-[#E5ECE6] flex items-center gap-1.5 text-[11px] text-amber-800">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>Verificación Operativa:</strong> Verifique que la impresora térmica tenga instalado el rollo de <strong>{zebraConfig.anchoMm} x {zebraConfig.altoMm} mm</strong> antes de imprimir.
                </span>
              </div>
            </div>

            {createdBatch ? (
              <div>
                <div className="mb-4 p-3.5 rounded-xl bg-[#EEF6F0] border border-[#15803D]/20 text-xs text-[#0D3B22] space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                      <span>CÓDIGO INTERNO:</span>
                    </span>
                    <span className="font-mono px-2 py-0.5 rounded bg-white border border-[#15803D]/30 font-black">
                      {createdBatch.codigosap || createdBatch.codigo_interno}
                    </span>
                  </div>
                  <div className="text-neutral-700 pt-1 border-t border-[#15803D]/10 flex justify-between">
                    <span>Lote: <strong className="font-mono text-[#0D3B22]">LOTE #{createdBatch.lote_inicio}</strong></span>
                    <span>Nuevos Embalajes: <strong className="font-mono">{createdBatch.total_lotes}</strong></span>
                  </div>
                  <div className="text-[11px] text-[#15803D] font-bold">
                    Rango de tickets emitidos: {createdBatch.lotes[0]?.unidad_embalaje || '0001'} al {createdBatch.lotes[createdBatch.lotes.length - 1]?.unidad_embalaje || String(createdBatch.total_lotes).padStart(4, '0')}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4">
                  {createdBatch.lotes.map((t, idx) => (
                    <button
                      key={t.uid}
                      type="button"
                      onClick={() => setSelectedTicketIndex(idx)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition cursor-pointer shrink-0 ${
                        selectedTicketIndex === idx
                          ? 'bg-[#0D3B22] text-white border-[#0D3B22] font-bold'
                          : 'bg-[#F7FAF7] text-neutral-600 border-[#E5ECE6] hover:bg-[#EEF6F0]'
                      }`}
                    >
                      Emb. {t.unidad_embalaje}
                    </button>
                  ))}
                </div>

                <ZebraLabel 
                  ticket={createdBatch.lotes[selectedTicketIndex]} 
                  zebraConfig={zebraConfig}
                />

                {onNavigateToBatch && (
                  <button
                    onClick={() => onNavigateToBatch(createdBatch.codigo_interno)}
                    className="w-full mt-4 py-2 px-3 rounded-xl border border-[#15803D]/30 text-xs font-bold text-[#0D3B22] bg-[#EEF6F0]/60 hover:bg-[#EEF6F0] transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Ver en Sábana de Producción</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <ZebraLabel 
                ticket={previewTicket} 
                showPrintButton={true} 
                zebraConfig={zebraConfig}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
