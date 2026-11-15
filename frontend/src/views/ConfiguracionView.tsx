import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { api, SessionConfig } from '../api/client';
import { 
  Clock, Shield, Save, CheckCircle2, AlertTriangle, 
  Settings, Sliders, Bell, RefreshCw, Lock, UserCheck, 
  HelpCircle, MonitorDot
} from 'lucide-react';

export const ConfiguracionView: React.FC = () => {
  const { isAdmin, setTimeoutMinutes: setGlobalTimeout, refreshTimeoutConfig } = useAuth();
  const [activeTab, setActiveTab] = useState<'session' | 'planta' | 'alertas'>('session');

  // Session timeout state
  const [timeoutVal, setTimeoutVal] = useState<number>(30);
  const [originalVal, setOriginalVal] = useState<number>(30);
  const [configMeta, setConfigMeta] = useState<SessionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preset options
  const presets = [
    { value: 15, label: '15 Minutos', desc: 'Máxima seguridad · Terminal compartida de planta' },
    { value: 30, label: '30 Minutos', desc: 'Estándar recomendado Bioplast Chile', recommended: true },
    { value: 60, label: '1 Hora', desc: 'Jornada supervisores y control de calidad' },
    { value: 120, label: '2 Horas', desc: 'Estaciones fijas de administración' },
  ];

  const fetchConfig = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getSessionConfig();
      if (data) {
        setTimeoutVal(data.timeout_minutes);
        setOriginalVal(data.timeout_minutes);
        setConfigMeta(data);
      }
    } catch (err: any) {
      console.error('Error fetching session config:', err);
      setErrorMsg('No fue posible cargar la configuración del servidor. Se utilizará el valor local.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMsg('Se requieren permisos de Administrador para modificar la configuración global.');
      return;
    }

    if (timeoutVal < 5 || timeoutVal > 480) {
      setErrorMsg('El tiempo de sesión debe estar comprendido entre 5 y 480 minutos.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updated = await api.updateSessionConfig(timeoutVal);
      setOriginalVal(updated.timeout_minutes);
      setConfigMeta(updated);
      setGlobalTimeout(updated.timeout_minutes);
      refreshTimeoutConfig();
      setSuccessMsg(`Configuración actualizada exitosamente. El nuevo tiempo de inactividad es de ${updated.timeout_minutes} minutos.`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 mb-2">Acceso Restringido</h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            El módulo de Configuración Global está reservado exclusivamente para cuentas con rol de Administrador.
          </p>
        </div>
      </div>
    );
  }

  const formattedDate = configMeta?.updated_at
    ? new Date(configMeta.updated_at).toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No registrada';

  const hasChanges = timeoutVal !== originalVal;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5ECE6]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#EEF6F0] text-[#15803D]">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="font-display font-black text-2xl text-[#0D3B22] tracking-tight">
              Configuración del Sistema
            </h1>
          </div>
          <p className="text-xs text-neutral-500">
            Administración centralizada de políticas de sesión, seguridad y parámetros de la plataforma Bioplast Chile SpA.
          </p>
        </div>

        <button
          onClick={fetchConfig}
          disabled={loading}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-[#E5ECE6] text-xs font-semibold text-neutral-600 hover:text-[#0D3B22] hover:bg-[#EEF6F0] transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Submenu Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#E5ECE6] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('session')}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-2 ${
            activeTab === 'session'
              ? 'bg-[#0D3B22] text-white border-[#0D3B22] shadow-sm'
              : 'bg-white text-neutral-600 border-[#E5ECE6] hover:bg-[#EEF6F0]'
          }`}
        >
          <Clock className="w-4 h-4 text-[#22C55E]" />
          <span>Ajustes de Sesión</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('planta')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition flex items-center gap-2 ${
            activeTab === 'planta'
              ? 'bg-[#0D3B22] text-white border-[#0D3B22] shadow-sm'
              : 'bg-white text-neutral-500 border-[#E5ECE6] hover:bg-[#F7FAF7]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Parámetros de Planta</span>
          <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
            Próximamente
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alertas')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition flex items-center gap-2 ${
            activeTab === 'alertas'
              ? 'bg-[#0D3B22] text-white border-[#0D3B22] shadow-sm'
              : 'bg-white text-neutral-500 border-[#E5ECE6] hover:bg-[#F7FAF7]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alertas y Eventos</span>
          <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
            Próximamente
          </span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'session' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Configuration Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#E5ECE6] p-6 sm:p-8 shadow-sm space-y-6">
              {/* Alert Feedbacks */}
              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#15803D] font-medium flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2.5"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Setting Title & Explainer */}
              <div>
                <div className="flex items-center gap-2">
                  <MonitorDot className="w-4 h-4 text-[#15803D]" />
                  <h2 className="text-sm font-bold text-[#0D3B22] uppercase tracking-wider">
                    Tiempo de Inactividad de Sesión
                  </h2>
                </div>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Define cuántos minutos de inactividad continua (sin teclado, clics ni movimiento de cursor) se permiten en el sistema antes de cerrar la sesión automáticamente y solicitar las credenciales de nuevo.
                </p>
              </div>

              {/* Preset Cards Selection */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-3">
                  Preajustes Habituales de Operación
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {presets.map((preset) => {
                    const isSelected = timeoutVal === preset.value;
                    return (
                      <div
                        key={preset.value}
                        onClick={() => setTimeoutVal(preset.value)}
                        className={`p-4 rounded-xl border-2 transition cursor-pointer select-none flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#15803D] bg-[#EEF6F0]/60 shadow-xs'
                            : 'border-[#E5ECE6] hover:border-[#15803D]/40 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-base text-[#0D3B22]">
                            {preset.label}
                          </span>
                          {preset.recommended && (
                            <span className="text-[10px] font-bold text-[#15803D] bg-emerald-100/80 px-2 py-0.5 rounded-full">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-500 leading-normal">
                          {preset.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Number Input & Slider */}
              <div className="p-4 rounded-xl bg-[#F7FAF7] border border-[#E5ECE6] space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="custom-timeout" className="text-xs font-bold text-neutral-700">
                    O especifica un valor exacto personalizado:
                  </label>
                  <span className="font-mono text-sm font-black text-[#0D3B22] px-2.5 py-0.5 rounded-lg bg-white border border-[#E5ECE6]">
                    {timeoutVal} min
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    id="custom-timeout"
                    type="range"
                    min={5}
                    max={240}
                    step={5}
                    value={timeoutVal}
                    onChange={(e) => setTimeoutVal(Number(e.target.value))}
                    className="flex-1 accent-[#15803D] cursor-pointer"
                  />
                  <div className="w-24">
                    <input
                      type="number"
                      min={5}
                      max={480}
                      value={timeoutVal}
                      onChange={(e) => setTimeoutVal(Math.max(5, Math.min(480, Number(e.target.value))))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-center rounded-lg border border-[#E5ECE6] bg-white focus:outline-none focus:border-[#15803D]"
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                  <span>Mínimo: 5 minutos</span>
                  <span>Máximo: 480 minutos (8 horas)</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E5ECE6]">
                <button
                  type="button"
                  onClick={() => setTimeoutVal(originalVal)}
                  disabled={!hasChanges || saving}
                  className="px-4 py-2.5 rounded-xl border border-[#E5ECE6] text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition disabled:opacity-40"
                >
                  Restablecer
                </button>

                <button
                  type="submit"
                  disabled={saving || !hasChanges}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#15803D] to-[#22C55E] hover:opacity-95 active:scale-[0.99] transition shadow-md shadow-[#15803D]/25 flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando ajustes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Ajustes de Sesión</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: Informative Panel & Audit Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Security Explanation Card */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5ECE6] shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0D3B22] uppercase tracking-wider pb-2 border-b border-[#E5ECE6] mb-3">
                <Shield className="w-4 h-4 text-[#15803D]" />
                <span>Norma de Seguridad Industrial</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                En entornos de manufactura continua con terminales táctiles compartidas, configurar un tiempo de inactividad adecuado previene que operarios o terceros emitan tiradas térmicas, alteren correlativos o modifiquen estados de lotes bajo la identidad de otro usuario.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-[#EEF6F0] border border-[#15803D]/20 text-[11px] text-[#0D3B22] space-y-1">
                <div className="font-bold">Aviso preventivo al usuario:</div>
                <div className="text-neutral-600">
                  El sistema desplegará un contador de alerta <strong>60 segundos antes</strong> del cierre para permitir que el operador continúe su labor sin perder información no guardada.
                </div>
              </div>
            </div>

            {/* Audit Metadata Card */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5ECE6] shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0D3B22] uppercase tracking-wider pb-2 border-b border-[#E5ECE6] mb-3">
                <UserCheck className="w-4 h-4 text-[#15803D]" />
                <span>Auditoría de Configuración</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#E5ECE6]/60">
                  <span className="text-neutral-400">Parámetro:</span>
                  <span className="font-mono text-neutral-700">session_timeout</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5ECE6]/60">
                  <span className="text-neutral-400">Tiempo Activo:</span>
                  <span className="font-mono font-bold text-[#15803D]">{originalVal} minutos</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5ECE6]/60">
                  <span className="text-neutral-400">Modificado por:</span>
                  <span className="font-semibold text-neutral-800">
                    {configMeta?.usuario_actualizador || 'Administrador General'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Última Fecha:</span>
                  <span className="font-mono text-neutral-600 text-[11px]">{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty states for future tabs */
        <div className="bg-white p-12 rounded-2xl border border-[#E5ECE6] text-center shadow-sm">
          <HelpCircle className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-neutral-800 mb-1">
            Sección en Fase de Homologación
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Los ajustes para esta categoría estarán disponibles en las próximas versiones de la plataforma Bioplast Chile.
          </p>
        </div>
      )}
    </div>
  );
};
