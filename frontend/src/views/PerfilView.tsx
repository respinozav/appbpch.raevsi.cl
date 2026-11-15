import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { User, Lock, Mail, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export const PerfilView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre_completo || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    setSaving(true);
    try {
      await api.updateProfile({
        nombre_completo: nombre.trim(),
        current_password: currentPassword ? currentPassword.trim() : undefined,
        password: newPassword ? newPassword.trim() : undefined,
      });

      await refreshUser();
      setSuccess('Tu perfil y contraseña han sido actualizados exitosamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15803D]">
            Configuración de Cuenta
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0F1F16] tracking-tight mt-1">
          Mi Perfil y Credenciales
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Modifica tu nombre personal o contraseña. Tu correo electrónico institucional permanece inalterable por seguridad.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5ECE6] shadow-sm p-6 sm:p-8">
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Email (Immutable) */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Correo Electrónico (Credencial de Acceso Inalterable)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                disabled
                value={user?.correo || ''}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5ECE6] bg-neutral-100/70 text-neutral-500 font-mono font-medium cursor-not-allowed"
              />
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Tu correo es la identidad institucional única de auditoría y no puede ser modificado.
            </span>
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] focus:ring-4 focus:ring-[#15803D]/10 text-sm font-medium"
              />
            </div>
          </div>

          {/* Role badge display */}
          <div className="p-3.5 rounded-xl bg-[#F7FAF7] border border-[#E5ECE6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <span className="font-semibold text-neutral-700">Rol Activo en el Sistema:</span>
            </div>
            <span className="px-3 py-1 rounded-lg bg-[#0D3B22] text-white text-xs font-bold">
              {user?.rol?.nombre || 'Colaborador'}
            </span>
          </div>

          <div className="border-t border-[#E5ECE6] pt-5">
            <h2 className="text-xs font-bold text-[#0D3B22] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#15803D]" />
              <span>Cambiar Contraseña Personal (Opcional)</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual para autorizar el cambio"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#0D3B22] text-white hover:bg-[#15803D] font-bold text-xs transition shadow-sm flex items-center gap-2"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Guardar Cambios de Perfil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
