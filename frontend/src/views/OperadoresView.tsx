import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api, OperadorItem } from '../api/client';
import { 
  Users2, Plus, Search, Edit3, CheckCircle2, XCircle, 
  RefreshCw, Power, X
} from 'lucide-react';

export const OperadoresView: React.FC = () => {
  const [operadores, setOperadores] = useState<OperadorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActivo, setFilterActivo] = useState<string>('todos');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal Crear/Editar
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<OperadorItem | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formRut, setFormRut] = useState('');
  const [formActivo, setFormActivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOperadores = async () => {
    setLoading(true);
    try {
      const res = await api.listOperadores({
        search: search.trim() || undefined,
        solo_activos: filterActivo === 'activos' ? true : filterActivo === 'inactivos' ? false : undefined,
        page,
        limit,
      });
      setOperadores(res.items);
      setTotalPages(res.pages);
      setTotalCount(res.total);
    } catch (err) {
      console.error('Error fetching operadores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperadores();
  }, [page, limit, filterActivo]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOperadores();
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormNombre('');
    setFormRut('');
    setFormActivo(true);
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (item: OperadorItem) => {
    setEditingItem(item);
    setFormNombre(item.nombre);
    setFormRut(item.rut || '');
    setFormActivo(item.activo);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) {
      setErrorMsg('El nombre completo del operador es obligatorio.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      if (editingItem) {
        await api.updateOperador(editingItem.uid, {
          nombre: formNombre.trim(),
          rut: formRut.trim() || undefined,
          activo: formActivo,
        });
      } else {
        await api.createOperador({
          nombre: formNombre.trim(),
          rut: formRut.trim() || undefined,
          activo: formActivo,
        });
      }
      setShowModal(false);
      fetchOperadores();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar operador.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: OperadorItem) => {
    try {
      await api.toggleActiveOperador(item.uid);
      fetchOperadores();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado del operador');
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
              Maestros de Planta · Operaciones
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0D3B22] tracking-tight mt-1 flex items-center gap-3">
            <span>Operadores de Planta</span>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-[#EEF6F0] text-[#15803D] border border-[#15803D]/20">
              {totalCount} registrados
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Administra los operadores autorizados para registro de tiradas de producción y emisión de tickets Zebra.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D3B22] hover:bg-[#15803D] text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Operador</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E5ECE6] p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o RUT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] focus:ring-4 focus:ring-[#15803D]/10 bg-[#F7FAF7]/50"
          />
        </form>

        <div className="flex items-center gap-3 text-xs text-neutral-500 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5">
            <span>Estado:</span>
            <select
              value={filterActivo}
              onChange={(e) => {
                setFilterActivo(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1.5 rounded-lg border border-[#E5ECE6] bg-white font-semibold"
            >
              <option value="todos">Todos</option>
              <option value="activos">Solo Activos</option>
              <option value="inactivos">Solo Inactivos</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Por pág:</span>
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
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5ECE6] shadow-sm overflow-hidden mb-6">
        {loading ? (
          <div className="p-12 text-center text-sm text-neutral-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#15803D]" />
            <span>Cargando operadores de planta...</span>
          </div>
        ) : operadores.length === 0 ? (
          <div className="p-12 text-center text-sm text-neutral-400">
            No se encontraron operadores registrados con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#EEF6F0]/60 border-b border-[#E5ECE6] text-neutral-700 font-bold uppercase text-[10px]">
                  <th className="p-3.5 pl-6">Nombre del Operador</th>
                  <th className="p-3.5">RUT / Identificador</th>
                  <th className="p-3.5">Estado Operacional</th>
                  <th className="p-3.5">Fecha Registro</th>
                  <th className="p-3.5 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5ECE6]">
                {operadores.map((op) => (
                  <tr key={op.uid} className="hover:bg-[#EEF6F0]/30 transition select-none">
                    <td className="p-3.5 pl-6 font-bold text-neutral-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#EEF6F0] text-[#15803D] flex items-center justify-center font-bold text-xs">
                        {op.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span>{op.nombre}</span>
                    </td>
                    <td className="p-3.5 font-mono text-neutral-600">
                      {op.rut || '-'}
                    </td>
                    <td className="p-3.5">
                      {op.activo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Habilitado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Deshabilitado</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-neutral-500">
                      {op.created_at ? new Date(op.created_at).toLocaleDateString('es-CL') : '-'}
                    </td>
                    <td className="p-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleActive(op)}
                          title={op.activo ? 'Deshabilitar operador' : 'Habilitar operador'}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            op.activo
                              ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(op)}
                          title="Editar operador"
                          className="p-1.5 rounded-lg border border-[#E5ECE6] text-neutral-600 hover:bg-[#EEF6F0] hover:text-[#0D3B22] transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
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

      {/* MODAL CREAR / EDITAR */}
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
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5ECE6] p-6 z-10"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E5ECE6]">
                <h3 className="font-bold text-base text-[#0D3B22] flex items-center gap-2">
                  <Users2 className="w-5 h-5 text-[#15803D]" />
                  <span>{editingItem ? 'Editar Operador' : 'Nuevo Operador de Planta'}</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    placeholder="Ej. Juan Carlos Perez"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    RUT / Identificador (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formRut}
                    onChange={(e) => setFormRut(e.target.value)}
                    placeholder="Ej. 15.432.189-2"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="op-activo"
                    checked={formActivo}
                    onChange={(e) => setFormActivo(e.target.checked)}
                    className="w-4 h-4 rounded text-[#15803D] focus:ring-[#15803D]"
                  />
                  <label htmlFor="op-activo" className="font-semibold text-neutral-800 cursor-pointer">
                    Operador Habilitado para Producción
                  </label>
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
                    <span>{editingItem ? 'Guardar Cambios' : 'Crear Operador'}</span>
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
