import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api, SapCodigoInternoItem } from '../api/client';
import { 
  Barcode, Search, Plus, Edit2, Trash2, X, Check, RefreshCw, 
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
    codigointerno: '',
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
      codigointerno: '',
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
      codigointerno: item.codigointerno,
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
    if (!form.codigosap.trim() || !form.codigointerno.trim() || !form.articulo.trim()) {
      setFormError('Código SAP, Código Interno y Artículo son obligatorios.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editingItem) {
        await api.updateCodigoInterno(editingItem.uid, {
          codigosap: form.codigosap.trim(),
          codigointerno: form.codigointerno.trim(),
          articulo: form.articulo.trim(),
          materia: form.materia.trim() || undefined,
          color: form.color.trim() || undefined,
          colorasa: form.colorasa.trim() || undefined,
          cantidad: Number(form.cantidad) || 0,
        });
      } else {
        await api.createCodigoInterno({
          codigosap: form.codigosap.trim(),
          codigointerno: form.codigointerno.trim(),
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
      setFormError(err.message || 'Error al guardar el código interno.');
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
      alert(err.message || 'Error al eliminar el código interno.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15803D]">
              Catálogo Maestro SAP & Códigos Internos
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0D3B22] tracking-tight mt-1">
            Códigos Internos
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Maestro de asociación entre Código SAP, Código Interno, Artículo, Materia Prima y Empaque estándar.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-[#0D3B22] text-white hover:bg-[#15803D] shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Código Interno</span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5ECE6] shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Código SAP, Código Interno o Artículo..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F7FAF7] border border-[#E5ECE6] rounded-xl focus:outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] transition"
          />
        </form>

        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span>Total: <strong className="text-[#0D3B22] font-mono">{totalCount}</strong> registros</span>
          <button
            onClick={() => { setPage(1); fetchItems(); }}
            title="Refrescar catálogo"
            className="p-2 text-neutral-500 hover:text-[#0D3B22] hover:bg-[#EEF6F0] rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#15803D]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-[#E5ECE6] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#15803D]" />
            <p className="text-xs text-neutral-500 font-mono mt-3">Cargando códigos internos...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <Barcode className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
            <p className="text-sm font-semibold text-neutral-600">No se encontraron códigos internos</p>
            <p className="text-xs mt-1">Crea el primer registro con el botón "Nuevo Código Interno".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7FAF7] text-neutral-600 font-bold uppercase tracking-wider border-b border-[#E5ECE6] text-[11px]">
                  <th className="py-3 px-4">Código SAP</th>
                  <th className="py-3 px-4">Código Interno</th>
                  <th className="py-3 px-4">Artículo</th>
                  <th className="py-3 px-4">Materia Prima</th>
                  <th className="py-3 px-4">Color Bidón / Asa</th>
                  <th className="py-3 px-4 text-right">Cantidad Empaque</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5ECE6]">
                {items.map((item) => (
                  <tr key={item.uid} className="hover:bg-[#F7FAF7]/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0D3B22]">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.codigosap}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-neutral-800">
                      {item.codigointerno}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      {item.articulo}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      {item.materia || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-700">
                      <span className="font-medium">{item.color || 'N/A'}</span>
                      {item.colorasa && <span className="text-neutral-400"> / {item.colorasa}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0D3B22]">
                      {item.cantidad ? item.cantidad.toLocaleString('es-CL') : '0'} un.
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Editar"
                          className="p-1.5 text-neutral-500 hover:text-[#0D3B22] hover:bg-[#EEF6F0] rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          title="Eliminar"
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E5ECE6] flex items-center justify-between text-xs text-neutral-500">
            <span>Página {page} de {totalPages}</span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#E5ECE6] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7FAF7]"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-[#E5ECE6] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7FAF7]"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E5ECE6] space-y-5"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#E5ECE6]">
                <div className="flex items-center gap-2.5">
                  <Barcode className="w-5 h-5 text-[#15803D]" />
                  <h3 className="text-base font-extrabold text-[#0D3B22]">
                    {editingItem ? 'Editar Código Interno' : 'Nuevo Código Interno'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Código SAP *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: SAP-1005"
                      value={form.codigosap}
                      onChange={(e) => setForm({ ...form, codigosap: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5ECE6] rounded-xl focus:border-[#15803D] outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Código Interno *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: INT-005"
                      value={form.codigointerno}
                      onChange={(e) => setForm({ ...form, codigointerno: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5ECE6] rounded-xl focus:border-[#15803D] outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Artículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Bidón 20L Industrial con Asa"
                    value={form.articulo}
                    onChange={(e) => setForm({ ...form, articulo: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5ECE6] rounded-xl focus:border-[#15803D] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Materia Prima</label>
                  <input
                    type="text"
                    placeholder="Ej: HDPE Polietileno de Alta Densidad"
                    value={form.materia}
                    onChange={(e) => setForm({ ...form, materia: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5ECE6] rounded-xl focus:border-[#15803D] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Color Bidón / Cuerpo</label>
                    <input
                      type="text"
                      placeholder="Ej: Blanco"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5ECE6] rounded-xl focus:border-[#15803D] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Color Asa</label>
                    <input
                      type="text"
                      placeholder="Ej: Azul"
                      value={form.colorasa}
                      onChange={(e) => setForm({ ...form, colorasa: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5ECE6] rounded-xl focus:border-[#15803D] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Cantidad Estándar Embalaje</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 1000"
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#E5ECE6] rounded-xl focus:border-[#15803D] outline-none font-mono"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-50 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-[#0D3B22] hover:bg-[#15803D] text-white font-bold transition shadow-sm"
                  >
                    {saving ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear Código'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Eliminar */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E5ECE6] space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-neutral-900">¿Eliminar Código Interno?</h3>
              <p className="text-xs text-neutral-500">
                Esta acción eliminará el código SAP <strong className="text-neutral-800 font-mono">{deletingItem.codigosap}</strong> ({deletingItem.articulo}).
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => setDeletingItem(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-600 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
