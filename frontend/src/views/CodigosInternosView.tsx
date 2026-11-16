import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api, SapCodigoInternoItem } from '../api/client';
import { 
  Barcode, Search, Plus, Edit2, Trash2, X, RefreshCw, 
  Layers, Package, AlertTriangle, ChevronRight, Hash
} from 'lucide-react';

export const CodigosInternosView: React.FC = () => {
  const [items, setItems] = useState<SapCodigoInternoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SapCodigoInternoItem | null>(null);
  const [form, setForm] = useState({
    codigosap: '',
    articulo: '',
    materia: '',
    color: '',
    colorasa: '',
    cantidad: 1000,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm modal
  const [deletingItem, setDeletingItem] = useState<SapCodigoInternoItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.listCodigosInternos({
        search: search.trim() || undefined,
        page,
        limit,
      });
      setItems(res.items);
      setTotalPages(res.pages);
      setTotalCount(res.total);
    } catch (err: any) {
      console.error('Error fetching codigos internos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, limit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      codigosap: '',
      articulo: '',
      materia: 'HDPE Polietileno',
      color: 'Blanco',
      colorasa: 'Azul',
      cantidad: 1000,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: SapCodigoInternoItem) => {
    setEditingItem(item);
    setForm({
      codigosap: item.codigosap,
      articulo: item.articulo,
      materia: item.materia || '',
      color: item.color || '',
      colorasa: item.colorasa || '',
      cantidad: item.cantidad || 0,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigosap.trim() || !form.articulo.trim()) {
      setFormError('El Código SAP (Código Interno) y el Artículo son obligatorios.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editingItem) {
        await api.updateCodigoInterno(editingItem.uid, {
          codigosap: form.codigosap.trim(),
          codigointerno: form.codigosap.trim(),
          articulo: form.articulo.trim(),
          materia: form.materia.trim() || undefined,
          color: form.color.trim() || undefined,
          colorasa: form.colorasa.trim() || undefined,
          cantidad: Number(form.cantidad) || 0,
        });
      } else {
        await api.createCodigoInterno({
          codigosap: form.codigosap.trim(),
          codigointerno: form.codigosap.trim(),
          articulo: form.articulo.trim(),
          materia: form.materia.trim() || undefined,
          color: form.color.trim() || undefined,
          colorasa: form.colorasa.trim() || undefined,
          cantidad: Number(form.cantidad) || 0,
        });
      }

      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar código interno');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await api.deleteCodigoInterno(deletingItem.uid);
      setDeletingItem(null);
      fetchItems();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar código interno');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15803D]">
              Maestros de Planta · Catálogo SAP
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0D3B22] tracking-tight mt-1 flex items-center gap-3">
            <span>Códigos Internos & SAP</span>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-[#EEF6F0] text-[#15803D] border border-[#15803D]/20">
              {totalCount} registrados
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Catálogo maestro de artículos: el <strong>Código SAP</strong> es el código interno oficial del sistema con sus materias primas y colores estandarizados.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D3B22] hover:bg-[#15803D] text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Código SAP</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl border border-[#E5ECE6] p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Código SAP o Artículo..."
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
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5ECE6] shadow-sm overflow-hidden mb-6">
        {loading ? (
          <div className="p-12 text-center text-sm text-neutral-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#15803D]" />
            <span>Cargando catálogo de códigos internos...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-neutral-400">
            No se encontraron registros en el catálogo. Presiona <strong>"+ Nuevo Código SAP"</strong> para registrar el primero.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#EEF6F0]/60 border-b border-[#E5ECE6] text-neutral-700 font-bold uppercase text-[10px]">
                  <th className="p-3.5 pl-6">Código SAP / Interno</th>
                  <th className="p-3.5">Artículo / Envase</th>
                  <th className="p-3.5">Materia Prima</th>
                  <th className="p-3.5">Color Bidón / Asa</th>
                  <th className="p-3.5 text-right">Cant. Estándar</th>
                  <th className="p-3.5 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5ECE6]">
                {items.map((it) => (
                  <tr key={it.uid} className="hover:bg-[#EEF6F0]/30 transition select-none">
                    <td className="p-3.5 pl-6 font-mono font-bold text-[#0D3B22]">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF6F0] text-[#15803D] border border-[#15803D]/20">
                        <Barcode className="w-3.5 h-3.5" />
                        <span>{it.codigosap}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-neutral-900">
                      {it.articulo}
                    </td>
                    <td className="p-3.5 text-neutral-600">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-medium">
                        {it.materia || 'HDPE Polietileno'}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-600 font-medium">
                      {it.color || 'Blanco'} / {it.colorasa || 'Sin Asa'}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-neutral-800">
                      {(it.cantidad || 0).toLocaleString('es-CL')} UND.
                    </td>
                    <td className="p-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(it)}
                          title="Editar registro"
                          className="p-1.5 rounded-lg border border-[#E5ECE6] text-neutral-600 hover:bg-[#EEF6F0] hover:text-[#0D3B22] transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(it)}
                          title="Eliminar registro"
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E5ECE6] p-6 z-10"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E5ECE6]">
                <h3 className="font-bold text-base text-[#0D3B22] flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-[#15803D]" />
                  <span>{editingItem ? 'Editar Código SAP' : 'Nuevo Código SAP / Interno'}</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Código SAP (Código Interno Oficial) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.codigosap}
                    onChange={(e) => setForm({ ...form, codigosap: e.target.value })}
                    placeholder="Ej. SAP-10024"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-mono font-bold uppercase"
                  />
                  <span className="block text-[10px] text-neutral-400 mt-1">
                    Este código reemplaza el código interno anterior y se imprimirá en los tickets Zebra.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Artículo / Nombre del Envase <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.articulo}
                    onChange={(e) => setForm({ ...form, articulo: e.target.value })}
                    placeholder="Ej. Bidón 20 Litros Natural Asa Azul"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Materia Prima
                    </label>
                    <input
                      type="text"
                      value={form.materia}
                      onChange={(e) => setForm({ ...form, materia: e.target.value })}
                      placeholder="Ej. HDPE Virgen / PCR Reciclado"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Cantidad Estándar por Embalaje
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.cantidad}
                      onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })}
                      placeholder="Ej. 1000"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Color Bidón
                    </label>
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      placeholder="Ej. Blanco / Natural"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Color Asa
                    </label>
                    <input
                      type="text"
                      value={form.colorasa}
                      onChange={(e) => setForm({ ...form, colorasa: e.target.value })}
                      placeholder="Ej. Azul / Rojo"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#E5ECE6]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#E5ECE6] text-neutral-600 hover:bg-neutral-100 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-[#0D3B22] text-white hover:bg-[#15803D] font-semibold transition flex items-center gap-1.5"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>{editingItem ? 'Guardar Cambios' : 'Registrar Código SAP'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingItem(null)}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-[#E5ECE6] p-6 z-10"
            >
              <div className="flex items-center gap-3 text-red-600 mb-3">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-bold text-base text-neutral-900">
                  ¿Eliminar Código SAP?
                </h3>
              </div>
              <p className="text-xs text-neutral-600 mb-5 leading-relaxed">
                Estás a punto de eliminar el artículo <strong>{deletingItem.codigosap} - {deletingItem.articulo}</strong> del catálogo maestro.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  className="px-4 py-2 rounded-xl border border-[#E5ECE6] text-neutral-600 hover:bg-neutral-100 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  {deleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Sí, Eliminar</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
