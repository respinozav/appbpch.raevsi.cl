import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  api, Estado, ProductionTicket, HistorialEstado 
} from '../api/client';
import { ZebraLabel } from '../components/ZebraLabel';
import { 
  Search, ChevronDown, ChevronRight, Layers, Printer, RefreshCw, 
  History, ArrowUpDown, X, ExternalLink, Calendar, RotateCcw
} from 'lucide-react';

const getDefaultDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return {
    desde: `${year}-${month}-01`,
    hasta: `${year}-${month}-${day}`,
  };
};

export const ProduccionView: React.FC<{ initialCodigoInterno?: number }> = ({ initialCodigoInterno }) => {
  // Filters & Pagination
  const defaultDates = getDefaultDates();
  const [fechaDesde, setFechaDesde] = useState<string>(defaultDates.desde);
  const [fechaHasta, setFechaHasta] = useState<string>(defaultDates.hasta);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [selectedEstadoUid, setSelectedEstadoUid] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Batches list & Expanded "sábana"
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCodigo, setExpandedCodigo] = useState<number | null>(initialCodigoInterno || null);
  const [expandedDetails, setExpandedDetails] = useState<any | null>(null);
  const [loadingSabana, setLoadingSabana] = useState(false);

  // Modals
  const [stateChangeModal, setStateChangeModal] = useState<{
    codigo_interno?: number;
    production_uid?: string;
    lote?: number;
    currentEstadoUid: string;
    currentEstadoNombre?: string;
    isBatch: boolean;
  } | null>(null);
  const [selectedNewEstadoUid, setSelectedNewEstadoUid] = useState<string>('');
  const [stateNotes, setStateNotes] = useState('');
  const [updatingState, setUpdatingState] = useState(false);

  // History modal
  const [historyModalUid, setHistoryModalUid] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistorialEstado[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Print ticket modal
  const [printTicket, setPrintTicket] = useState<ProductionTicket | null>(null);

  // 1. Load Estados ordenados según flujo operativo
  const FLOW_ORDER: Record<string, number> = {
    'Producción': 1,
    'Almacenaje': 2,
    'Despacho': 3,
    'Liberado': 4,
    'Retenido': 5,
  };

  useEffect(() => {
    const loadEstados = async () => {
      try {
        const data = await api.getEstados();
        const sorted = [...data].sort((a, b) => (FLOW_ORDER[a.nombre] || 99) - (FLOW_ORDER[b.nombre] || 99));
        setEstados(sorted);
        // Por defecto arranca en 'Todos los Estados' (selectedEstadoUid = null)
      } catch (err) {
        console.error('Error fetching estados:', err);
      }
    };
    loadEstados();
  }, []);

  // 2. Fetch Batches when filters change
  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await api.listBatches({
        estado_uid: selectedEstadoUid || undefined,
        search: searchTerm.trim() || undefined,
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
        page,
        limit,
      });
      setBatches(res.items);
      setTotalPages(res.pages);
      setTotalCount(res.total);
    } catch (err) {
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [selectedEstadoUid, fechaDesde, fechaHasta, page, limit]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBatches();
  };

  // 3. Load "Sábana" details when expanding a batch
  const handleToggleExpand = async (codigo: number) => {
    if (expandedCodigo === codigo) {
      setExpandedCodigo(null);
      setExpandedDetails(null);
      return;
    }

    setExpandedCodigo(codigo);
    setLoadingSabana(true);
    try {
      const details = await api.getBatchDetails(codigo);
      setExpandedDetails(details);
    } catch (err) {
      console.error('Error loading sábana:', err);
    } finally {
      setLoadingSabana(false);
    }
  };

  useEffect(() => {
    if (initialCodigoInterno) {
      handleToggleExpand(initialCodigoInterno);
    }
  }, [initialCodigoInterno]);

  // 4. Handle State Update
  const handleSaveStateChange = async () => {
    if (!stateChangeModal) return;
    setUpdatingState(true);
    try {
      if (stateChangeModal.isBatch && stateChangeModal.codigo_interno) {
        await api.updateBatchState(stateChangeModal.codigo_interno, {
          nuevo_estado_uid: selectedNewEstadoUid,
          observaciones: stateNotes.trim() || undefined,
        });
      } else if (stateChangeModal.production_uid) {
        await api.updateSingleLotState(stateChangeModal.production_uid, {
          nuevo_estado_uid: selectedNewEstadoUid,
          observaciones: stateNotes.trim() || undefined,
        });
      }

      setStateChangeModal(null);
      setStateNotes('');
      fetchBatches();
      if (expandedCodigo) {
        const details = await api.getBatchDetails(expandedCodigo);
        setExpandedDetails(details);
      }
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado');
    } finally {
      setUpdatingState(false);
    }
  };

  // 5. Open History Modal
  const handleOpenHistory = async (uid: string) => {
    setHistoryModalUid(uid);
    setLoadingHistory(true);
    try {
      const hist = await api.getLotHistorial(uid);
      setHistoryData(hist);
    } catch (err) {
      console.error('Error fetching historial:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Stats Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15803D]">
              Módulo 3 · Gestión & Sábana
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0F1F16] tracking-tight mt-1">
            Producción y Sábana de Lotes
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Trazabilidad continua. Haz clic en cualquier código interno para desplegar la sábana completa de lotes.
          </p>
        </div>

        <button
          onClick={fetchBatches}
          className="p-2.5 text-neutral-600 bg-white border border-[#E5ECE6] rounded-xl hover:bg-[#EEF6F0] hover:text-[#0D3B22] transition self-start sm:self-auto shadow-sm"
          title="Recargar datos"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs by Estado */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        <button
          type="button"
          onClick={() => {
            setSelectedEstadoUid(null);
            setPage(1);
          }}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition whitespace-nowrap ${
            selectedEstadoUid === null
              ? 'bg-[#0D3B22] text-white border-[#0D3B22] shadow-sm'
              : 'bg-white text-neutral-700 border-[#E5ECE6] hover:bg-[#EEF6F0]'
          }`}
        >
          Todos los Estados
        </button>
        {estados.map((est) => {
          const isSelected = selectedEstadoUid === est.uid;
          return (
            <button
              key={est.uid}
              type="button"
              onClick={() => {
                setSelectedEstadoUid(est.uid);
                setPage(1);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-2 whitespace-nowrap ${
                isSelected
                  ? 'bg-[#0D3B22] text-white border-[#0D3B22] shadow-sm'
                  : 'bg-white text-neutral-700 border-[#E5ECE6] hover:bg-[#EEF6F0]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: est.color || '#15803D' }}
              />
              <span>{est.nombre}</span>
            </button>
          );
        })}
      </div>

      {/* Search, Date Range & Pagination Control Bar */}
      <div className="bg-white rounded-2xl border border-[#E5ECE6] p-4 mb-6 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código interno, lote o envase..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] focus:ring-4 focus:ring-[#15803D]/10 bg-[#F7FAF7]/50"
          />
        </form>

        {/* Date Range Filters (Desde / Hasta) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7]/70 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#15803D]" />
            <span className="font-bold text-neutral-600">Desde:</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-mono text-neutral-800 text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7]/70 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#15803D]" />
            <span className="font-bold text-neutral-600">Hasta:</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => {
                setFechaHasta(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-mono text-neutral-800 text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const d = getDefaultDates();
              setFechaDesde(d.desde);
              setFechaHasta(d.hasta);
              setPage(1);
            }}
            title="Restablecer al mes en curso"
            className="px-2.5 py-1.5 text-xs font-semibold text-[#15803D] bg-[#EEF6F0] hover:bg-[#15803D] hover:text-white rounded-xl border border-[#15803D]/20 transition flex items-center gap-1.5 shadow-2xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Mes en curso</span>
          </button>
        </div>

        {/* Pagination & Total Count */}
        <div className="flex items-center gap-3 text-xs text-neutral-500 justify-between xl:justify-end">
          <div className="flex items-center gap-1.5">
            <span>Mostrar por pág:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1.5 rounded-lg border border-[#E5ECE6] bg-white font-mono font-semibold"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <span className="font-mono text-neutral-700 whitespace-nowrap">
            Total: <strong>{totalCount}</strong> tiradas
          </span>
        </div>
      </div>

      {/* Production Batches List Table */}
      <div className="bg-white rounded-2xl border border-[#E5ECE6] shadow-sm overflow-hidden mb-6">
        {loading ? (
          <div className="p-12 text-center text-sm text-neutral-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#15803D]" />
            <span>Consultando registros en AWS RDS...</span>
          </div>
        ) : batches.length === 0 ? (
          <div className="p-12 text-center text-sm text-neutral-400">
            No se encontraron tiradas de producción para los filtros aplicados.
          </div>
        ) : (
          <div className="divide-y divide-[#E5ECE6]">
            {batches.map((batch) => {
              const isExpanded = expandedCodigo === batch.codigo_interno;
              return (
                <div key={batch.codigo_interno} className="transition">
                  {/* Batch Header Row */}
                  <div
                    onClick={() => handleToggleExpand(batch.codigo_interno)}
                    className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none transition ${
                      isExpanded ? 'bg-[#EEF6F0]/40 border-l-4 border-l-[#15803D]' : 'hover:bg-[#F7FAF7]'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="mt-1 sm:mt-0 p-1.5 rounded-lg bg-neutral-100 text-neutral-600 transition">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#15803D]" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-base font-extrabold text-[#0D3B22] tracking-tight">
                            #{batch.codigo_interno}
                          </span>
                          <span className="text-xs text-neutral-400">·</span>
                          <span className="font-semibold text-sm text-[#0F1F16]">
                            {batch.articulo}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 mt-1 flex items-center gap-2 flex-wrap">
                          <span>Material: <strong className="text-neutral-700">{batch.material}</strong></span>
                          <span>·</span>
                          <span>Colores: <strong className="text-neutral-700">{batch.color_bidon} / {batch.color_asa}</strong></span>
                          <span>·</span>
                          <span>Máq: <strong className="font-mono">{batch.numero_maquina}</strong></span>
                          <span>·</span>
                          <span>Turno: <strong className="font-mono">{batch.turno}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E5ECE6]">
                      <div className="text-left lg:text-right">
                        <div className="text-xs font-mono font-bold text-[#0D3B22]">
                          Lotes {batch.lote_inicio} - {batch.lote_fin} ({batch.total_lotes} UND)
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {batch.fecha ? new Date(batch.fecha).toLocaleDateString('es-CL') : ''}
                        </div>
                      </div>

                      <span
                        className="px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 text-white shadow-sm"
                        style={{ backgroundColor: batch.estado?.color || '#15803D' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span>{batch.estado?.nombre || 'Producción'}</span>
                      </span>
                    </div>
                  </div>

                  {/* SÁBANA DESPLEGABLE */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden bg-[#F7FAF7] border-t border-[#E5ECE6] px-4 sm:px-8 py-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#15803D]" />
                            <h3 className="font-bold text-sm text-[#0D3B22] uppercase tracking-wide">
                              Sábana de Lotes Individuales · Código Interno #{batch.codigo_interno}
                            </h3>
                          </div>
                          <span className="text-xs text-neutral-500 font-mono">
                            {expandedDetails?.lotes?.length || 0} tickets registrados
                          </span>
                        </div>

                        {loadingSabana ? (
                          <div className="p-8 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-[#15803D]" />
                            <span>Desplegando sábana...</span>
                          </div>
                        ) : expandedDetails?.lotes ? (
                          (() => {
                            const filteredLots = (expandedDetails.lotes as ProductionTicket[]).filter((lot) => {
                              if (!selectedEstadoUid) return true;
                              return lot.uid_estado === selectedEstadoUid;
                            });

                            if (filteredLots.length === 0) {
                              return (
                                <div className="p-6 text-center text-xs text-neutral-500 bg-white rounded-xl border border-[#E5ECE6]">
                                  No existen lotes con el estado seleccionado en este código interno.
                                </div>
                              );
                            }

                            return (
                              <div className="overflow-x-auto rounded-xl border border-[#E5ECE6] bg-white shadow-sm">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-[#EEF6F0]/60 border-b border-[#E5ECE6] text-neutral-700 font-bold uppercase text-[10px]">
                                      <th className="p-3">Lote</th>
                                      <th className="p-3">Unid. Embalaje</th>
                                      <th className="p-3">Cantidad</th>
                                      <th className="p-3">Peso</th>
                                      <th className="p-3">Máq/Turno/Op</th>
                                      <th className="p-3">Estado</th>
                                      <th className="p-3 text-right">Acciones</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#E5ECE6]">
                                    {filteredLots.map((lot: ProductionTicket) => (
                                      <tr key={lot.uid} className="hover:bg-[#F7FAF7]/80 transition">
                                        <td className="p-3 font-mono font-extrabold text-[#0D3B22] text-sm">
                                          {lot.lote}
                                        </td>
                                        <td className="p-3 font-mono font-bold">
                                          {lot.unidad_embalaje}
                                        </td>
                                        <td className="p-3 font-mono">
                                          {lot.cantidad.toLocaleString('es-CL')} UND.
                                        </td>
                                        <td className="p-3 font-mono">
                                          {lot.peso || 'N/A'}
                                        </td>
                                        <td className="p-3 font-mono text-neutral-600">
                                          {lot.numero_maquina} / {lot.turno} / {lot.operador}
                                        </td>
                                        <td className="p-3">
                                          <span
                                            className="px-2.5 py-0.5 text-[11px] font-bold rounded text-white"
                                            style={{ backgroundColor: lot.estado?.color || '#15803D' }}
                                          >
                                            {lot.estado?.nombre || 'Producción'}
                                          </span>
                                        </td>
                                        <td className="p-3 text-right space-x-1">
                                          <button
                                            onClick={() => setPrintTicket(lot)}
                                            className="p-1.5 text-neutral-600 hover:text-[#0D3B22] hover:bg-[#EEF6F0] rounded-lg transition cursor-pointer"
                                            title="Ver / Imprimir Ticket Zebra"
                                          >
                                            <Printer className="w-3.5 h-3.5" />
                                          </button>

                                          <button
                                            onClick={() => {
                                              setStateChangeModal({
                                                production_uid: lot.uid,
                                                lote: lot.lote,
                                                currentEstadoUid: lot.uid_estado,
                                                currentEstadoNombre: lot.estado?.nombre || 'Producción',
                                                isBatch: false,
                                              });
                                              setSelectedNewEstadoUid(lot.uid_estado);
                                            }}
                                            className="p-1.5 text-neutral-600 hover:text-[#0D3B22] hover:bg-[#EEF6F0] rounded-lg transition cursor-pointer"
                                            title="Cambiar estado de este lote"
                                          >
                                            <ArrowUpDown className="w-3.5 h-3.5" />
                                          </button>

                                          <button
                                            onClick={() => handleOpenHistory(lot.uid)}
                                            className="p-1.5 text-neutral-600 hover:text-[#0D3B22] hover:bg-[#EEF6F0] rounded-lg transition cursor-pointer"
                                            title="Ver historial de auditoría de estados"
                                          >
                                            <History className="w-3.5 h-3.5" />
                                          </button>

                                          <a
                                            href={`/trazabilidad/${lot.uid}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-neutral-400 hover:text-[#15803D] inline-block transition cursor-pointer"
                                            title="Abrir consulta pública QR"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })()
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="bg-[#F7FAF7] px-6 py-3.5 border-t border-[#E5ECE6] flex items-center justify-between text-xs text-neutral-600">
            <div>
              Página <strong>{page}</strong> de <strong>{totalPages}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-[#E5ECE6] bg-white font-medium hover:bg-[#EEF6F0] disabled:opacity-40 transition"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-[#E5ECE6] bg-white font-medium hover:bg-[#EEF6F0] disabled:opacity-40 transition"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STATE CHANGE MODAL */}
      <AnimatePresence>
        {stateChangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStateChangeModal(null)}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5ECE6] p-6 z-10"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E5ECE6]">
                <h3 className="font-bold text-base text-[#0D3B22]">
                  {stateChangeModal.isBatch
                    ? `Cambiar Estado: Tirada #${stateChangeModal.codigo_interno}`
                    : `Cambiar Estado: Lote #${stateChangeModal.lote}`}
                </h3>
                <button
                  onClick={() => setStateChangeModal(null)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-2">
                    Avanzar al Siguiente Estado en Cadena de Trazabilidad:
                  </label>
                  {(() => {
                    const currentNom = stateChangeModal.currentEstadoNombre || 'Producción';
                    const validTransitionsMap: Record<string, string[]> = {
                      'Producción': ['Almacenaje', 'Retenido'],
                      'Almacenaje': ['Despacho', 'Retenido'],
                      'Despacho': ['Liberado', 'Retenido'],
                      'Retenido': ['Producción', 'Almacenaje', 'Despacho', 'Liberado'],
                      'Liberado': ['Retenido']
                    };
                    const allowedNames = validTransitionsMap[currentNom] || [];
                    const estadosPermitidos = estados.filter((est) => allowedNames.includes(est.nombre));

                    if (estadosPermitidos.length === 0) {
                      return (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                          El lote ya se encuentra en estado <strong>{currentNom}</strong> (fase finalizada). No requiere transiciones adicionales.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        <div className="text-[11px] text-neutral-500 mb-1">
                          Flujo obligatorio: <span className="font-semibold text-[#0D3B22]">Producción ➔ Almacenaje ➔ Despacho ➔ Liberado/Retenido</span>.
                          Estado actual del lote: <strong className="text-[#15803D]">{currentNom}</strong>.
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {estadosPermitidos.map((est) => (
                            <label
                              key={est.uid}
                              className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                                selectedNewEstadoUid === est.uid
                                  ? 'bg-[#EEF6F0] border-[#15803D] font-bold text-[#0D3B22]'
                                  : 'border-[#E5ECE6] hover:bg-neutral-50 text-neutral-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name="newEstado"
                                value={est.uid}
                                checked={selectedNewEstadoUid === est.uid}
                                onChange={() => setSelectedNewEstadoUid(est.uid)}
                                className="accent-[#15803D]"
                              />
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: est.color }}
                              />
                              <span>Avanzar a: <strong>{est.nombre}</strong></span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Observaciones / Motivo del Cambio (Opcional):
                  </label>
                  <textarea
                    rows={2}
                    value={stateNotes}
                    onChange={(e) => setStateNotes(e.target.value)}
                    placeholder="Ej. Inspección de calidad conforme, listo para almacenaje..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setStateChangeModal(null)}
                    className="px-4 py-2 rounded-xl border border-[#E5ECE6] text-neutral-600 hover:bg-neutral-100 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveStateChange}
                    disabled={updatingState}
                    className="px-4 py-2 rounded-xl bg-[#0D3B22] text-white hover:bg-[#15803D] font-semibold transition"
                  >
                    {updatingState ? 'Guardando...' : 'Guardar y Auditar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUDIT HISTORY MODAL */}
      <AnimatePresence>
        {historyModalUid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryModalUid(null)}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E5ECE6] p-6 z-10"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E5ECE6]">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#15803D]" />
                  <h3 className="font-bold text-base text-[#0D3B22]">
                    Historial de Auditoría (Trazabilidad)
                  </h3>
                </div>
                <button
                  onClick={() => setHistoryModalUid(null)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loadingHistory ? (
                <div className="p-8 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#15803D]" />
                  <span>Cargando auditoría...</span>
                </div>
              ) : historyData.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400">
                  No hay transiciones registradas para este lote.
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {historyData.map((h) => (
                    <div
                      key={h.uid}
                      className="p-3 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7] text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="px-2 py-0.5 text-[10px] font-bold rounded text-white"
                          style={{ backgroundColor: h.estado_nuevo?.color || '#15803D' }}
                        >
                          {h.estado_nuevo?.nombre}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {new Date(h.fecha_hora).toLocaleString('es-CL')}
                        </span>
                      </div>
                      <div className="text-neutral-700 font-medium">
                        Responsable: <strong className="text-[#0D3B22]">{h.usuario_nombre || 'Sistema de Planta'}</strong>
                      </div>
                      {h.observaciones && (
                        <div className="text-neutral-500 text-[11px] italic bg-white p-2 rounded-lg border border-[#E5ECE6]">
                          "{h.observaciones}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRINT TICKET MODAL */}
      <AnimatePresence>
        {printTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPrintTicket(null)}
              className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5ECE6] p-6 z-10 flex flex-col items-center"
            >
              <div className="w-full flex justify-between items-center mb-4 pb-2 border-b border-[#E5ECE6] no-print">
                <span className="font-bold text-sm text-[#0D3B22]">
                  Etiqueta Térmica Zebra (Lote #{printTicket.lote})
                </span>
                <button
                  onClick={() => setPrintTicket(null)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <ZebraLabel ticket={printTicket} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
