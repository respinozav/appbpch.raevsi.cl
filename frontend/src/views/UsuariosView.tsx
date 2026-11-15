import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api, User, Role } from '../api/client';
import { 
  Users, UserPlus, Edit, CheckCircle2, XCircle, RefreshCw, X, Lock, Mail, User as UserIcon
} from 'lucide-react';

export const UsuariosView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rolUid, setRolUid] = useState<string>('');
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [uList, rList] = await Promise.all([api.listUsers(), api.getRoles()]);
      setUsers(uList);
      setRoles(rList);
      if (rList.length > 0 && !rolUid) {
        setRolUid(rList[rList.length - 1].uid);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setNombreCompleto('');
    setCorreo('');
    setPassword('');
    setRolUid(roles.length > 0 ? roles[roles.length - 1].uid : '');
    setActivo(true);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setNombreCompleto(u.nombre_completo);
    setCorreo(u.correo);
    setPassword('');
    setRolUid(u.rol_uid);
    setActivo(u.activo);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (editingUser) {
        await api.updateUser(editingUser.uid, {
          nombre_completo: nombreCompleto.trim(),
          password: password.trim() ? password.trim() : undefined,
          rol_uid: rolUid,
          activo,
        });
      } else {
        if (!password.trim()) {
          throw new Error('La contraseña es obligatoria para nuevos usuarios.');
        }
        await api.createUser({
          nombre_completo: nombreCompleto.trim(),
          correo: correo.trim().toLowerCase(),
          password: password.trim(),
          rol_uid: rolUid,
          activo,
        });
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u: User) => {
    try {
      await api.updateUser(u.uid, { activo: !u.activo });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado de usuario');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15803D]">
              Módulo 1 · Administración
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0F1F16] tracking-tight mt-1">
            Control de Usuarios y Roles (CRUD)
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Gestión de permisos y accesos para Administradores, Jefatura y Colaboradores de planta.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-[#0D3B22] text-white hover:bg-[#15803D] transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Crear Nuevo Usuario</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#E5ECE6] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-neutral-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#15803D]" />
            <span>Consultando usuarios en AWS RDS...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#EEF6F0]/60 border-b border-[#E5ECE6] text-neutral-700 font-bold uppercase text-[10px]">
                  <th className="p-3.5">UID (UUID)</th>
                  <th className="p-3.5">Nombre Completo</th>
                  <th className="p-3.5">Correo (Credencial)</th>
                  <th className="p-3.5">Rol del Sistema</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5ECE6]">
                {users.map((u) => {
                  const roleName = u.rol?.nombre || 'Colaborador';
                  const roleColor =
                    roleName === 'Administrador'
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : roleName === 'Jefatura'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                  return (
                    <tr key={u.uid} className="hover:bg-[#F7FAF7] transition">
                      <td className="p-3.5 font-mono text-[10px] text-neutral-400 max-w-[120px] truncate" title={u.uid}>
                        {u.uid}
                      </td>
                      <td className="p-3.5 font-semibold text-neutral-900">
                        {u.nombre_completo}
                      </td>
                      <td className="p-3.5 font-mono text-neutral-600">
                        {u.correo}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${roleColor}`}>
                          {roleName}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {u.activo ? (
                          <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Activo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500 font-semibold text-xs">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Inactivo</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-[#0D3B22] hover:bg-[#EEF6F0] transition"
                          title="Editar usuario"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`p-1.5 rounded-lg transition ${
                            u.activo
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-[#15803D] hover:bg-emerald-50'
                          }`}
                          title={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          {u.activo ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT USER MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
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
                  {editingUser ? `Editar Usuario` : 'Crear Nuevo Usuario'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={nombreCompleto}
                      onChange={(e) => setNombreCompleto(e.target.value)}
                      placeholder="Ej. Roberto Morales"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Correo Electrónico (Credencial de Acceso)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      disabled={Boolean(editingUser)}
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="usuario@bioplastchile.cl"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] disabled:bg-neutral-100 disabled:text-neutral-500"
                    />
                  </div>
                  {editingUser && (
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      El correo es la credencial principal y permanece inalterable.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Contraseña {editingUser && '(Dejar en blanco para mantener actual)'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Rol Asignado
                    </label>
                    <select
                      value={rolUid}
                      onChange={(e) => setRolUid(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] bg-white font-semibold"
                    >
                      {roles.map((r) => (
                        <option key={r.uid} value={r.uid}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Estado de Cuenta
                    </label>
                    <select
                      value={activo ? '1' : '0'}
                      onChange={(e) => setActivo(e.target.value === '1')}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] bg-white"
                    >
                      <option value="1">Activo</option>
                      <option value="0">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
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
                    <span>{editingUser ? 'Guardar Cambios' : 'Crear Usuario'}</span>
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
