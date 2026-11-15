import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api, CertificateData } from '../api/client';
import { CertificateDocument } from '../components/CertificateDocument';
import { 
  FileCheck, Search, Printer, RefreshCw, ChevronRight, CheckCircle2, 
  ArrowLeft, Edit3, X, Save, AlertTriangle
} from 'lucide-react';

export const CertificadosView: React.FC = () => {
  const [liberados, setLiberados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Lot for Certificate Preview & Emission
  const [selectedProductionUid, setSelectedProductionUid] = useState<string | null>(null);
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [loadingCert, setLoadingCert] = useState(false);

  // Edit Certificate Metadata modal/form
  const [showEditMetadata, setShowEditMetadata] = useState(false);
  const [clientInput, setClientInput] = useState('');
  const [despachoInput, setDespachoInput] = useState('');
  const [facturaInput, setFacturaInput] = useState('');
  const [responsableInput, setResponsableInput] = useState('');
  const [cargoInput, setCargoInput] = useState('');
  const [savingCert, setSavingCert] = useState(false);

  const fetchLiberados = async () => {
    setLoading(true);
    try {
      const res = await api.listLiberados({
        search: search.trim() || undefined,
        page,
        limit,
      });
      setLiberados(res.items);
      setTotalPages(res.pages);
      setTotalCount(res.total);
    } catch (err) {
      console.error('Error fetching liberados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiberados();
  }, [page, limit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLiberados();
  };

  const handleSelectLot = async (productionUid: string) => {
    setSelectedProductionUid(productionUid);
    setLoadingCert(true);
    try {
      const data = await api.getCertificateData(productionUid);
      setCertData(data);
      setClientInput(data.metadatos_despacho.cliente || '');
      setDespachoInput(data.metadatos_despacho.despacho || '');
      setFacturaInput(data.metadatos_despacho.factura || '');
      setResponsableInput(data.responsable.nombre || '');
      setCargoInput(data.responsable.cargo || '');
    } catch (err) {
      console.error('Error fetching cert data:', err);
    } finally {
      setLoadingCert(false);
    }
  };

  const isCertificateComplete = Boolean(
    certData &&
    certData.metadatos_despacho.cliente?.trim() &&
    certData.metadatos_despacho.despacho?.trim() &&
    certData.metadatos_despacho.factura?.trim() &&
    certData.responsable.nombre?.trim() &&
    certData.responsable.cargo?.trim()
  );

  const handlePrintClick = () => {
    if (!isCertificateComplete) {
      setShowEditMetadata(true);
      alert('Para imprimir o emitir el certificado oficial R-CAL-07, debe completar obligatoriamente: Nombre Cliente, N° Despacho, N° Factura, Responsable de Aprobación y Cargo / Departamento.');
      return;
    }
    window.print();
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductionUid) return;

    if (
      !clientInput.trim() ||
      !despachoInput.trim() ||
      !facturaInput.trim() ||
      !responsableInput.trim() ||
      !cargoInput.trim()
    ) {
      alert('Todos los campos son obligatorios: Nombre Cliente, N° Despacho, N° Factura, Responsable de Aprobación y Cargo / Departamento.');
      return;
    }

    setSavingCert(true);
    try {
      await api.emitCertificate({
        production_uid: selectedProductionUid,
        cliente: clientInput.trim(),
        despacho: despachoInput.trim(),
        factura: facturaInput.trim(),
        aprobado_por: responsableInput.trim(),
        cargo: cargoInput.trim(),
      });

      const updated = await api.getCertificateData(selectedProductionUid);
      setCertData(updated);
      setShowEditMetadata(false);
      fetchLiberados();
    } catch (err: any) {
      alert(err.message || 'Error al guardar metadatos de certificado');
    } finally {
      setSavingCert(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15803D]">
              Módulo 4 · Aseguramiento de Calidad
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0F1F16] tracking-tight mt-1">
            Certificados de Análisis y Emisión Oficial
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Lotes en estado <strong>Despacho</strong> o <strong>Liberado</strong> listos para emisión del documento oficial R-CAL-07.
          </p>
        </div>

        {selectedProductionUid && (
          <button
            onClick={() => {
              setSelectedProductionUid(null);
              setCertData(null);
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#E5ECE6] text-[#0F1F16] bg-white hover:bg-[#EEF6F0] transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Lista</span>
          </button>
        )}
      </div>

      {/* VIEW A: CERTIFICATE DETAIL PREVIEW */}
      {selectedProductionUid && certData ? (
        <div className="space-y-6">
          {/* Missing mandatory fields alert banner */}
          {!isCertificateComplete && (
            <div className="no-print p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold block text-sm text-amber-950">
                    Datos obligatorios pendientes de emisión
                  </span>
                  Para imprimir o emitir este certificado R-CAL-07, debe completar obligatoriamente: <strong>Nombre Cliente</strong>, <strong>N° Despacho</strong>, <strong>N° Factura</strong>, <strong>Responsable de Aprobación</strong> y <strong>Cargo / Departamento</strong>.
                </div>
              </div>
              <button
                onClick={() => setShowEditMetadata(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Completar Datos Obligatorios</span>
              </button>
            </div>
          )}

          <div className="no-print bg-white rounded-2xl border border-[#E5ECE6] p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEF6F0] flex items-center justify-center text-[#15803D]">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#0D3B22]">
                  Certificado de Análisis R-CAL-07 · {certData.item.articulo}
                </div>
                <div className="text-xs text-neutral-500 font-mono">
                  Código Interno: #{certData.item.codigo_interno} · Lote: {certData.item.lote} · Cliente: {certData.metadatos_despacho.cliente || '(Sin Asignar)'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditMetadata(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#E5ECE6] text-neutral-700 hover:bg-[#EEF6F0] transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#15803D]" />
                <span>{isCertificateComplete ? 'Modificar Datos' : 'Completar Datos'}</span>
              </button>
              <button
                onClick={handlePrintClick}
                disabled={!isCertificateComplete}
                title={
                  isCertificateComplete
                    ? 'Imprimir o guardar en PDF'
                    : 'Debe completar los datos obligatorios antes de imprimir'
                }
                className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition ${
                  isCertificateComplete
                    ? 'bg-[#0D3B22] text-white hover:bg-[#15803D] cursor-pointer'
                    : 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-60'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>

          <CertificateDocument
            data={certData}
            onPrint={handlePrintClick}
            isComplete={isCertificateComplete}
            onCompleteRequest={() => setShowEditMetadata(true)}
          />
        </div>
      ) : (
        /* VIEW B: TABLE OF LIBERADOS */
        <div>
          <div className="bg-white rounded-2xl border border-[#E5ECE6] p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar lote liberado por código interno o envase..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] focus:ring-4 focus:ring-[#15803D]/10 bg-[#F7FAF7]/50"
              />
            </form>

            <div className="flex items-center gap-3 text-xs text-neutral-500 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1.5">
                <span>Registros por página:</span>
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

              <span className="font-mono text-neutral-700">
                Lotes Habilitados: <strong>{totalCount}</strong>
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5ECE6] shadow-sm overflow-hidden mb-6">
            {loading ? (
              <div className="p-12 text-center text-sm text-neutral-500 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#15803D]" />
                <span>Cargando lotes para certificación...</span>
              </div>
            ) : liberados.length === 0 ? (
              <div className="p-12 text-center text-sm text-neutral-400">
                No hay lotes en estado <strong>Despacho</strong> o <strong>Liberado</strong> para los filtros seleccionados.
                <div className="text-xs text-neutral-400 mt-1">
                  (Solo los lotes en estado Despacho o Liberado pueden emitir certificados de calidad R-CAL-07).
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#EEF6F0]/60 border-b border-[#E5ECE6] text-neutral-700 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Código Interno</th>
                      <th className="p-3.5">Lote</th>
                      <th className="p-3.5">Artículo / Envase</th>
                      <th className="p-3.5">Material & Colores</th>
                      <th className="p-3.5">Cantidad</th>
                      <th className="p-3.5">Estado Operativo</th>
                      <th className="p-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5ECE6]">
                    {liberados.map((item) => (
                      <tr
                        key={item.uid}
                        onClick={() => handleSelectLot(item.uid)}
                        className="hover:bg-[#EEF6F0]/30 cursor-pointer transition select-none"
                      >
                        <td className="p-3.5 font-mono font-bold text-[#0D3B22]">
                          #{item.codigo_interno}
                        </td>
                        <td className="p-3.5 font-mono font-extrabold text-sm text-[#0D3B22]">
                          {item.lote}
                        </td>
                        <td className="p-3.5 font-semibold text-neutral-800">
                          {item.articulo}
                        </td>
                        <td className="p-3.5 text-neutral-600">
                          {item.material} · {item.color_bidon} / {item.color_asa}
                        </td>
                        <td className="p-3.5 font-mono font-bold">
                          {item.cantidad.toLocaleString('es-CL')} UND.
                        </td>
                        <td className="p-3.5">
                          <span
                            className="px-2.5 py-0.5 text-[11px] font-bold rounded text-white"
                            style={{ backgroundColor: item.estado_color || (item.estado_nombre === 'Despacho' ? '#8B5CF6' : '#10B981') }}
                          >
                            {item.estado_nombre || 'Liberado'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectLot(item.uid);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0D3B22] text-white hover:bg-[#15803D] text-xs font-semibold shadow-sm transition"
                          >
                            <span>Previsualizar</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        </div>
      )}

      {/* EDIT METADATA MODAL */}
      <AnimatePresence>
        {showEditMetadata && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditMetadata(false)}
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
                  Datos de Despacho del Certificado
                </h3>
                <button
                  onClick={() => setShowEditMetadata(false)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMetadata} className="space-y-4 text-xs">
                <div className="p-2.5 rounded-xl bg-[#EEF6F0] border border-[#15803D]/20 text-[11px] text-[#0D3B22]">
                  <strong>Control de Calidad:</strong> Los 5 campos son obligatorios para validar y habilitar la impresión del documento oficial R-CAL-07.
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Nombre del Cliente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientInput}
                    onChange={(e) => setClientInput(e.target.value)}
                    placeholder="Ej. ALIASE SPA"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] uppercase font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      N° Despacho <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={despachoInput}
                      onChange={(e) => setDespachoInput(e.target.value)}
                      placeholder="Ej. 336"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      N° Factura <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={facturaInput}
                      onChange={(e) => setFacturaInput(e.target.value)}
                      placeholder="Ej. FAC-9821"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Responsable de Aprobación <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={responsableInput}
                    onChange={(e) => setResponsableInput(e.target.value)}
                    placeholder="Ej. Susana Avila C."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Cargo / Departamento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cargoInput}
                    onChange={(e) => setCargoInput(e.target.value)}
                    placeholder="Ej. DEPTO. CONTROL DE CALIDAD"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] uppercase"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditMetadata(false)}
                    className="px-4 py-2 rounded-xl border border-[#E5ECE6] text-neutral-600 hover:bg-neutral-100 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingCert}
                    className="px-4 py-2 rounded-xl bg-[#0D3B22] text-white hover:bg-[#15803D] font-semibold transition flex items-center gap-1.5"
                  >
                    {savingCert ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Actualizar Certificado</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
