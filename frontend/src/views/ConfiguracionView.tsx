import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { api, SessionConfig, Role, LoginAuditItem } from '../api/client';
import { 
  ZebraConfig, ZEBRA_PRESETS, DEFAULT_ZEBRA_CONFIG, 
  getStoredZebraConfig, setStoredZebraConfig 
} from '../utils/zebraConfig';
import { 
  Clock, Shield, Save, CheckCircle2, AlertTriangle, 
  Settings, RefreshCw, Lock, UserCheck, 
  HelpCircle, Users, Activity, Plus, Check, X, Search, ChevronRight,
  Printer, Sliders, Layers, Barcode, Disc, Eye
} from 'lucide-react';

const ALL_SYSTEM_MODULES = [
  { id: 'dashboard', label: 'Dashboard', desc: 'Métricas & OEE de planta' },
  { id: 'codigos-internos', label: 'Códigos Internos SAP', desc: 'Catálogo maestro de artículos y materias' },
  { id: 'iniciar', label: 'Iniciar Producción', desc: 'Emisión de tickets Zebra ZPL' },
  { id: 'produccion', label: 'Producción & Sábana', desc: 'Trazabilidad y estados' },
  { id: 'gestion-estados', label: 'Gestión de Estados', desc: 'Lectura QR con pistola o cámara' },
  { id: 'certificados', label: 'Certificados', desc: 'Documento R-CAL-07 Oficial' },
  { id: 'operadores', label: 'Operadores', desc: 'Operadores autorizados de planta' },
  { id: 'usuarios', label: 'Usuarios & Permisos', desc: 'Gestión de colaboradores' },
  { id: 'configuracion', label: 'Configuración', desc: 'Ajustes del sistema y RBAC' },
  { id: 'faq', label: 'Manual & FAQ', desc: 'Documento controlado MAN-SGI-01' },
  { id: 'perfil', label: 'Mi Perfil', desc: 'Credenciales de cuenta' },
];

export const ConfiguracionView: React.FC = () => {
  const { isAdmin, refreshUser, setTimeoutMinutes: setGlobalTimeout, refreshTimeoutConfig } = useAuth();
  const [activeTab, setActiveTab] = useState<'session' | 'roles' | 'zebra' | 'audit'>('session');

  // ==========================================
  // 1. AJUSTES DE SESIÓN
  // ==========================================
  const [timeoutVal, setTimeoutVal] = useState<number>(30);
  const [originalVal, setOriginalVal] = useState<number>(30);
  const [configMeta, setConfigMeta] = useState<SessionConfig | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [savingSession, setSavingSession] = useState(false);
  const [sessionSuccessMsg, setSessionSuccessMsg] = useState<string | null>(null);
  const [sessionErrorMsg, setSessionErrorMsg] = useState<string | null>(null);

  const presets = [
    { value: 15, label: '15 Minutos', desc: 'Máxima seguridad · Terminal compartida de planta' },
    { value: 30, label: '30 Minutos', desc: 'Estándar recomendado Bioplast Chile', recommended: true },
    { value: 60, label: '1 Hora', desc: 'Jornada supervisores y control de calidad' },
    { value: 120, label: '2 Horas', desc: 'Estaciones fijas de administración' },
  ];

  const fetchSessionConfig = async () => {
    setLoadingSession(true);
    setSessionErrorMsg(null);
    try {
      const data = await api.getSessionConfig();
      if (data) {
        setTimeoutVal(data.timeout_minutes);
        setOriginalVal(data.timeout_minutes);
        setConfigMeta(data);
      }
    } catch (err: any) {
      console.error('Error fetching session config:', err);
      setSessionErrorMsg('No fue posible cargar la configuración del servidor. Se utilizará el valor local.');
    } finally {
      setLoadingSession(false);
    }
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setSessionErrorMsg('Se requieren permisos de Administrador para modificar la configuración global.');
      return;
    }
    if (timeoutVal < 5 || timeoutVal > 480) {
      setSessionErrorMsg('El tiempo de sesión debe estar comprendido entre 5 y 480 minutos.');
      return;
    }

    setSavingSession(true);
    setSessionErrorMsg(null);
    setSessionSuccessMsg(null);
    try {
      const updated = await api.updateSessionConfig(timeoutVal);
      setOriginalVal(updated.timeout_minutes);
      setConfigMeta(updated);
      setGlobalTimeout(updated.timeout_minutes);
      refreshTimeoutConfig();
      setSessionSuccessMsg(`Configuración actualizada exitosamente. El nuevo tiempo de inactividad es de ${updated.timeout_minutes} minutos.`);
      setTimeout(() => setSessionSuccessMsg(null), 5000);
    } catch (err: any) {
      setSessionErrorMsg(err.message || 'Error al guardar la configuración.');
    } finally {
      setSavingSession(false);
    }
  };

  // ==========================================
  // CONFIGURACIÓN DE ZEBRA (IMPRESIÓN TÉRMICA)
  // ==========================================
  const [zebraConfig, setZebraConfig] = useState<ZebraConfig>(getStoredZebraConfig);
  const [originalZebraConfig, setOriginalZebraConfig] = useState<ZebraConfig>(getStoredZebraConfig);
  const [savingZebra, setSavingZebra] = useState(false);
  const [zebraSuccessMsg, setZebraSuccessMsg] = useState<string | null>(null);
  const [zebraErrorMsg, setZebraErrorMsg] = useState<string | null>(null);

  const hasZebraChanges = JSON.stringify(zebraConfig) !== JSON.stringify(originalZebraConfig);

  const handleSelectZebraPreset = (presetId: ZebraConfig['presetId']) => {
    const found = ZEBRA_PRESETS.find(p => p.id === presetId);
    if (found && presetId !== 'custom') {
      setZebraConfig(prev => ({
        ...prev,
        presetId,
        anchoMm: found.ancho,
        altoMm: found.alto,
      }));
    } else {
      setZebraConfig(prev => ({
        ...prev,
        presetId: 'custom',
      }));
    }
  };

  const handleSaveZebraConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setZebraErrorMsg(null);
    setZebraSuccessMsg(null);

    if (zebraConfig.anchoMm < 30 || zebraConfig.anchoMm > 150) {
      setZebraErrorMsg('El ancho de la etiqueta debe estar comprendido entre 30 y 150 mm.');
      return;
    }
    if (zebraConfig.altoMm < 40 || zebraConfig.altoMm > 350) {
      setZebraErrorMsg('El alto de la etiqueta debe estar comprendido entre 40 y 350 mm.');
      return;
    }

    setSavingZebra(true);
    try {
      setStoredZebraConfig(zebraConfig);
      setOriginalZebraConfig(zebraConfig);
      setZebraSuccessMsg(`Configuración de Zebra guardada exitosamente (${zebraConfig.anchoMm} x ${zebraConfig.altoMm} mm). Se ha sincronizado con Iniciar Producción.`);
      setTimeout(() => setZebraSuccessMsg(null), 5000);
    } catch (err: any) {
      setZebraErrorMsg(err.message || 'Error al guardar la configuración de Zebra.');
    } finally {
      setSavingZebra(false);
    }
  };

  const handleResetZebraDefault = () => {
    setZebraConfig(DEFAULT_ZEBRA_CONFIG);
  };

  // ==========================================
  // 2. ADMINISTRADOR DE ROLES & PERMISOS (RBAC)
  // ==========================================
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleFormName, setRoleFormName] = useState('');
  const [roleFormDesc, setRoleFormDesc] = useState('');
  const [roleFormModules, setRoleFormModules] = useState<string[]>([]);
  const [savingRole, setSavingRole] = useState(false);
  const [roleMsg, setRoleMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const data = await api.listRolesConfig();
      setRoles(data);
      if (selectedRole) {
        const refreshed = data.find((r) => r.uid === selectedRole.uid);
        if (refreshed) setSelectedRole(refreshed);
      } else if (data.length > 0) {
        setSelectedRole(data[0]);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleOpenCreateRole = () => {
    setRoleFormName('');
    setRoleFormDesc('');
    setRoleFormModules(['dashboard', 'iniciar', 'produccion', 'faq', 'perfil']);
    setShowRoleModal(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormName.trim()) return;

    setSavingRole(true);
    try {
      await api.createRole({
        nombre: roleFormName.trim(),
        descripcion: roleFormDesc.trim() || undefined,
        modulos: roleFormModules,
      });
      setShowRoleModal(false);
      setRoleMsg({ type: 'success', text: `Rol "${roleFormName}" creado exitosamente.` });
      setTimeout(() => setRoleMsg(null), 4000);
      fetchRoles();
    } catch (err: any) {
      alert(err.message || 'Error al crear el rol');
    } finally {
      setSavingRole(false);
    }
  };

  const handleToggleModuleInRole = async (role: Role, moduleId: string) => {
    if (!isAdmin) return;
    if (role.nombre === 'Administrador' && moduleId === 'configuracion') {
      alert('Por seguridad industrial, el módulo Configuración no puede ser desasignado al rol Administrador.');
      return;
    }

    const currentMods = role.modulos || [];
    const exists = currentMods.includes(moduleId);
    const updatedMods = exists
      ? currentMods.filter((m) => m !== moduleId)
      : [...currentMods, moduleId];

    try {
      const updated = await api.updateRole(role.uid, { modulos: updatedMods });
      setRoles((prev) => prev.map((r) => (r.uid === updated.uid ? updated : r)));
      if (selectedRole?.uid === updated.uid) setSelectedRole(updated);
      setRoleMsg({ type: 'success', text: `Permisos actualizados para el rol ${role.nombre}.` });
      setTimeout(() => setRoleMsg(null), 3000);
      await refreshUser();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar permisos del rol');
    }
  };

  const handleToggleRoleActive = async (role: Role) => {
    if (role.nombre === 'Administrador') {
      alert('El rol Administrador es crítico para el sistema y no puede ser desactivado.');
      return;
    }

    const newActiveState = !role.activo;
    try {
      const updated = await api.updateRole(role.uid, { activo: newActiveState });
      setRoles((prev) => prev.map((r) => (r.uid === updated.uid ? updated : r)));
      if (selectedRole?.uid === updated.uid) setSelectedRole(updated);
      setRoleMsg({
        type: 'success',
        text: `Rol ${role.nombre} ${newActiveState ? 'activado' : 'desactivado'} correctamente.`,
      });
      setTimeout(() => setRoleMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado del rol');
    }
  };

  // ==========================================
  // 3. LOG DE INICIOS DE SESIÓN (AUDITORÍA)
  // ==========================================
  const [auditLogs, setAuditLogs] = useState<LoginAuditItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditExitoso, setAuditExitoso] = useState<string>('all');
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await api.listLoginAudits({
        search: auditSearch.trim() || undefined,
        exitoso: auditExitoso === 'all' ? undefined : auditExitoso === 'true',
        page: auditPage,
        limit: 15,
      });
      setAuditLogs(res.items);
      setAuditTotalPages(res.pages);
      setAuditTotal(res.total);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'session') fetchSessionConfig();
    if (activeTab === 'roles') fetchRoles();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab, auditPage, auditExitoso]);

  const hasChanges = timeoutVal !== originalVal;
  const formattedDate = configMeta?.updated_at
    ? new Date(configMeta.updated_at).toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No registrada';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15803D]">
              Módulo 6 · Configuración del Sistema & Seguridad
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0D3B22] tracking-tight mt-1">
            Parámetros Globales & Control de Accesos
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Políticas de expiración de sesión, administración de roles y bitácora de auditoría de autenticación.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'session') fetchSessionConfig();
            if (activeTab === 'roles') fetchRoles();
            if (activeTab === 'audit') fetchAuditLogs();
          }}
          className="p-2 text-neutral-600 hover:text-[#0D3B22] hover:bg-[#EEF6F0] rounded-xl border border-[#E5ECE6] transition self-start sm:self-auto cursor-pointer"
          title="Actualizar datos"
        >
          <RefreshCw className={`w-4 h-4 ${loadingSession || loadingRoles || loadingAudit ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs Switcher: Solo Ajustes de Sesión, Administrador de Roles y Auditoría de Logins */}
      <div className="flex items-center gap-2 border-b border-[#E5ECE6] pb-px overflow-x-auto select-none">
        <button
          onClick={() => setActiveTab('session')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'session'
              ? 'border-[#15803D] text-[#0D3B22] bg-[#EEF6F0]/50'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Clock className="w-4 h-4 text-[#15803D]" />
          <span>Ajustes de Sesión</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'roles'
              ? 'border-[#15803D] text-[#0D3B22] bg-[#EEF6F0]/50'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Users className="w-4 h-4 text-[#15803D]" />
          <span>Administrador de Roles & Módulos</span>
        </button>

        <button
          onClick={() => setActiveTab('zebra')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'zebra'
              ? 'border-[#15803D] text-[#0D3B22] bg-[#EEF6F0]/50'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Printer className="w-4 h-4 text-[#15803D]" />
          <span>Configuración de Zebra</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-[#15803D] text-[#0D3B22] bg-[#EEF6F0]/50'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Activity className="w-4 h-4 text-[#15803D]" />
          <span>Auditoría de Inicios de Sesión</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AJUSTES DE SESIÓN */}
      {/* ========================================================================= */}
      {activeTab === 'session' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E5ECE6] shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE6] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF6F0] flex items-center justify-center text-[#15803D]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-[#0D3B22] uppercase tracking-wide">
                    Tiempo de Inactividad de Sesión
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Cierre automático preventivo ante ausencia de interacción en planta.
                  </p>
                </div>
              </div>

              <span className="font-mono text-xs font-black px-2.5 py-1 rounded-full bg-[#EEF6F0] text-[#15803D] border border-[#15803D]/20">
                {originalVal} min activos
              </span>
            </div>

            {/* Alerts */}
            {sessionSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>{sessionSuccessMsg}</span>
              </motion.div>
            )}

            {sessionErrorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{sessionErrorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSaveSession} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  Selecciona una plantilla de tiempo preconfigurada:
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

              {/* Slider */}
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
                  disabled={!hasChanges || savingSession}
                  className="px-4 py-2.5 rounded-xl border border-[#E5ECE6] text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition disabled:opacity-40 cursor-pointer"
                >
                  Restablecer
                </button>

                <button
                  type="submit"
                  disabled={savingSession || !hasChanges}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#15803D] to-[#22C55E] hover:opacity-95 active:scale-[0.99] transition shadow-md shadow-[#15803D]/25 flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {savingSession ? (
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

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E5ECE6] shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0D3B22] uppercase tracking-wider pb-2 border-b border-[#E5ECE6] mb-3">
                <Shield className="w-4 h-4 text-[#15803D]" />
                <span>Norma de Seguridad Industrial</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                En entornos de manufactura continua con terminales táctiles compartidas, configurar un tiempo de inactividad adecuado previene que operarios o terceros emitan tiradas térmicas, alteren correlativos o modifiquen estados de lotes bajo la identidad de otro usuario.
              </p>
            </div>

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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ADMINISTRADOR DE ROLES & PERMISOS DE MÓDULOS (RBAC) */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {roleMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                roleMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
              <span>{roleMsg.text}</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Roles List (4 cols) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#E5ECE6] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE6]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#15803D]" />
                  <h3 className="font-bold text-sm text-[#0D3B22] uppercase tracking-wide">
                    Roles de Planta
                  </h3>
                </div>
                <button
                  onClick={handleOpenCreateRole}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#0D3B22] text-white hover:bg-[#15803D] transition flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Rol</span>
                </button>
              </div>

              <div className="space-y-2">
                {roles.map((r) => {
                  const isSelected = selectedRole?.uid === r.uid;
                  const isSuperAdmin = r.nombre === 'Administrador';

                  return (
                    <div
                      key={r.uid}
                      onClick={() => setSelectedRole(r)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer select-none flex items-center justify-between ${
                        isSelected
                          ? 'border-[#15803D] bg-[#EEF6F0]/60 shadow-xs'
                          : 'border-[#E5ECE6] hover:bg-neutral-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#0D3B22]">{r.nombre}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                              r.activo
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                            }`}
                          >
                            {r.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                          {r.descripcion || 'Sin descripción'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isSuperAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleRoleActive(r);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                              r.activo
                                ? 'text-amber-700 hover:bg-amber-100'
                                : 'text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title={r.activo ? 'Desactivar rol' : 'Activar rol'}
                          >
                            {r.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        )}
                        <ChevronRight className={`w-4 h-4 text-neutral-400 ${isSelected ? 'text-[#15803D]' : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modules Checkbox Matrix for Selected Role (8 cols) */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E5ECE6] shadow-sm">
              {selectedRole ? (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5ECE6] gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-[#0D3B22]">
                          Permisos para: {selectedRole.nombre}
                        </span>
                        {selectedRole.nombre === 'Administrador' && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            Acceso Maestro Irrevocable
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Marca o desmarca los módulos que estarán visibles y accesibles para este rol en el menú lateral.
                      </p>
                    </div>

                    <span className="font-mono text-xs text-[#15803D] font-bold">
                      {selectedRole.modulos?.length || 0} de {ALL_SYSTEM_MODULES.length} módulos habilitados
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {ALL_SYSTEM_MODULES.map((mod) => {
                      const isAssigned = (selectedRole.modulos || []).includes(mod.id);
                      const isLocked = selectedRole.nombre === 'Administrador' && mod.id === 'configuracion';

                      return (
                        <div
                          key={mod.id}
                          onClick={() => !isLocked && handleToggleModuleInRole(selectedRole, mod.id)}
                          className={`p-3.5 rounded-xl border transition flex items-center justify-between select-none ${
                            isLocked
                              ? 'bg-neutral-50 border-neutral-300 opacity-80 cursor-not-allowed'
                              : isAssigned
                              ? 'border-[#15803D]/60 bg-[#EEF6F0]/40 hover:bg-[#EEF6F0] cursor-pointer'
                              : 'border-[#E5ECE6] bg-white hover:bg-neutral-50 cursor-pointer'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-xs text-[#0D3B22]">
                              <span>{mod.label}</span>
                              {isLocked && (
                                <span title="Protección de sistema">
                                  <Lock className="w-3 h-3 text-neutral-400" />
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 block mt-0.5">
                              {mod.desc}
                            </span>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition border ${
                              isAssigned
                                ? 'bg-[#15803D] border-[#15803D] text-white'
                                : 'border-neutral-300 bg-white text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400">
                  Selecciona un rol a la izquierda para configurar sus permisos de módulos.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONFIGURACIÓN DE ZEBRA (IMPRESIÓN TÉRMICA) */}
      {/* ========================================================================= */}
      {activeTab === 'zebra' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Formulario de Parámetros Zebra (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E5ECE6] shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5ECE6] gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-[#15803D]" />
                  <h2 className="text-base font-bold text-[#0D3B22]">
                    Configuración de Impresoras Térmicas Zebra ZPL
                  </h2>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Parámetros del rollo de etiquetas físicas, dimensiones en milímetros, mandril y cabezal térmico de planta.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#EEF6F0] text-[#15803D] border border-[#15803D]/20 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                <span>Activa: {zebraConfig.anchoMm} x {zebraConfig.altoMm} mm</span>
              </div>
            </div>

            {/* Alertas */}
            {zebraSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>{zebraSuccessMsg}</span>
              </motion.div>
            )}

            {zebraErrorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{zebraErrorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSaveZebraConfig} className="space-y-6">
              {/* Sección 1: Plantillas de Dimensiones */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#15803D]" />
                  <span>1. Dimensiones de Etiqueta (Ancho x Alto en mm)</span>
                </label>
                <p className="text-xs text-neutral-500 mb-3">
                  Selecciona la plantilla según el formato de rollo instalado físicamente en las impresoras Zebra ZT411 / ZD421 de planta:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {ZEBRA_PRESETS.map((preset) => {
                    const isSelected = zebraConfig.presetId === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectZebraPreset(preset.id)}
                        className={`p-3.5 rounded-xl border-2 transition cursor-pointer select-none flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#15803D] bg-[#EEF6F0]/60 shadow-xs'
                            : 'border-[#E5ECE6] hover:border-[#15803D]/40 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono font-black text-sm text-[#0D3B22]">
                            {preset.label}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {preset.pulgadas}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-600 leading-normal">
                          {preset.descripcion}
                        </span>
                        {preset.isPopular && (
                          <div className="mt-2 pt-2 border-t border-[#15803D]/10">
                            <span className="text-[9px] font-bold text-[#15803D] bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block">
                              ★ Estándar Pallet Bioplast
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Ajuste Fino / Personalizado */}
                <div className="p-4 rounded-xl bg-[#F7FAF7] border border-[#E5ECE6] space-y-4">
                  <div className="text-xs font-bold text-neutral-700 flex items-center justify-between">
                    <span>Ajuste Milimétrico de Cabezal:</span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Resolución efectiva {zebraConfig.dpi} DPI
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Ancho mm */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-neutral-700">Ancho (X)</label>
                        <span className="font-mono font-bold text-xs text-[#0D3B22] px-2 py-0.5 rounded bg-white border border-[#E5ECE6]">
                          {zebraConfig.anchoMm} mm
                        </span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={120}
                        step={1}
                        value={zebraConfig.anchoMm}
                        onChange={(e) => {
                          setZebraConfig(prev => ({
                            ...prev,
                            presetId: 'custom',
                            anchoMm: Number(e.target.value)
                          }));
                        }}
                        className="w-full accent-[#15803D] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-0.5">
                        <span>Min: 50 mm</span>
                        <span>Max: 120 mm</span>
                      </div>
                    </div>

                    {/* Alto mm */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-neutral-700">Alto (Y)</label>
                        <span className="font-mono font-bold text-xs text-[#0D3B22] px-2 py-0.5 rounded bg-white border border-[#E5ECE6]">
                          {zebraConfig.altoMm} mm
                        </span>
                      </div>
                      <input
                        type="range"
                        min={80}
                        max={250}
                        step={1}
                        value={zebraConfig.altoMm}
                        onChange={(e) => {
                          setZebraConfig(prev => ({
                            ...prev,
                            presetId: 'custom',
                            altoMm: Number(e.target.value)
                          }));
                        }}
                        className="w-full accent-[#15803D] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-0.5">
                        <span>Min: 80 mm</span>
                        <span>Max: 250 mm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 2: Especificaciones del Rollo & Mandril */}
              <div className="pt-2 border-t border-[#E5ECE6]">
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Disc className="w-4 h-4 text-[#15803D]" />
                  <span>2. Diámetro del Mandril & Dimensiones del Rollo</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Diámetro del Mandril / Core */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Diámetro Mandril (Core)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setZebraConfig(prev => ({ ...prev, mandrilPulgadas: 3 }))}
                        className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          zebraConfig.mandrilPulgadas === 3
                            ? 'bg-[#0D3B22] text-white border-[#0D3B22] shadow-xs'
                            : 'bg-white text-neutral-700 border-[#E5ECE6] hover:bg-neutral-50'
                        }`}
                      >
                        3" (76 mm)
                        <span className="block text-[9px] font-normal opacity-80">Industrial</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setZebraConfig(prev => ({ ...prev, mandrilPulgadas: 1 }))}
                        className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          zebraConfig.mandrilPulgadas === 1
                            ? 'bg-[#0D3B22] text-white border-[#0D3B22] shadow-xs'
                            : 'bg-white text-neutral-700 border-[#E5ECE6] hover:bg-neutral-50'
                        }`}
                      >
                        1" (25 mm)
                        <span className="block text-[9px] font-normal opacity-80">Desktop</span>
                      </button>
                    </div>
                  </div>

                  {/* Diámetro Exterior Máx */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Diámetro Exterior Máx
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setZebraConfig(prev => ({ ...prev, diametroExteriorMaxMm: 203 }))}
                        className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          zebraConfig.diametroExteriorMaxMm === 203
                            ? 'bg-[#0D3B22] text-white border-[#0D3B22] shadow-xs'
                            : 'bg-white text-neutral-700 border-[#E5ECE6] hover:bg-neutral-50'
                        }`}
                      >
                        8" (203 mm)
                        <span className="block text-[9px] font-normal opacity-80">Rollo Grande</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setZebraConfig(prev => ({ ...prev, diametroExteriorMaxMm: 127 }))}
                        className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          zebraConfig.diametroExteriorMaxMm === 127
                            ? 'bg-[#0D3B22] text-white border-[#0D3B22] shadow-xs'
                            : 'bg-white text-neutral-700 border-[#E5ECE6] hover:bg-neutral-50'
                        }`}
                      >
                        5" (127 mm)
                        <span className="block text-[9px] font-normal opacity-80">Rollo Chico</span>
                      </button>
                    </div>
                  </div>

                  {/* Tipo de Sensor */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Sensor de Marca / Gap
                    </label>
                    <select
                      value={zebraConfig.sensorTipo}
                      onChange={(e) => setZebraConfig(prev => ({ ...prev, sensorTipo: e.target.value as any }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] bg-white font-medium focus:outline-none focus:border-[#15803D]"
                    >
                      <option value="gap">Separación / Web Gap (Recomendado)</option>
                      <option value="black_mark">Marca Negra (Black Mark)</option>
                      <option value="continuous">Papel Continuo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección 3: Cabezal Térmico & Calidad */}
              <div className="pt-2 border-t border-[#E5ECE6]">
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Barcode className="w-4 h-4 text-[#15803D]" />
                  <span>3. Cabezal Térmico & Densidad de Impresión</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Resolución DPI */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Resolución Cabezal
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setZebraConfig(prev => ({ ...prev, dpi: 203 }))}
                        className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          zebraConfig.dpi === 203
                            ? 'bg-[#15803D] text-white border-[#15803D] shadow-xs'
                            : 'bg-white text-neutral-700 border-[#E5ECE6] hover:bg-neutral-50'
                        }`}
                      >
                        203 DPI
                        <span className="block text-[9px] font-normal opacity-80">8 dots/mm</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setZebraConfig(prev => ({ ...prev, dpi: 300 }))}
                        className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          zebraConfig.dpi === 300
                            ? 'bg-[#15803D] text-white border-[#15803D] shadow-xs'
                            : 'bg-white text-neutral-700 border-[#E5ECE6] hover:bg-neutral-50'
                        }`}
                      >
                        300 DPI
                        <span className="block text-[9px] font-normal opacity-80">12 dots/mm</span>
                      </button>
                    </div>
                  </div>

                  {/* Oscuridad Térmica (Darkness) */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-neutral-700">Oscuridad (Darkness)</label>
                      <span className="font-mono font-bold text-xs text-[#0D3B22]">
                        {zebraConfig.darkness} / 30
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={1}
                      value={zebraConfig.darkness}
                      onChange={(e) => setZebraConfig(prev => ({ ...prev, darkness: Number(e.target.value) }))}
                      className="w-full accent-[#15803D] cursor-pointer mt-2"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-0.5">
                      <span>Clara (1)</span>
                      <span>Óptima (15)</span>
                      <span>Oscura (30)</span>
                    </div>
                  </div>

                  {/* Velocidad IPS */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Velocidad Impresión
                    </label>
                    <select
                      value={zebraConfig.velocidadIps}
                      onChange={(e) => setZebraConfig(prev => ({ ...prev, velocidadIps: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5ECE6] bg-white font-medium focus:outline-none focus:border-[#15803D]"
                    >
                      <option value={2}>2 Pulgadas/seg (Alta Calidad)</option>
                      <option value={3}>3 Pulgadas/seg</option>
                      <option value={4}>4 Pulgadas/seg (Recomendado Planta)</option>
                      <option value={6}>6 Pulgadas/seg (Alta Velocidad)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botones de Guardado */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E5ECE6]">
                <button
                  type="button"
                  onClick={handleResetZebraDefault}
                  className="px-4 py-2.5 rounded-xl border border-[#E5ECE6] hover:bg-neutral-50 text-xs font-semibold text-neutral-600 transition cursor-pointer"
                >
                  Restablecer a 100 x 200 mm
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={savingZebra}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D3B22] text-white hover:bg-[#15803D] text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingZebra ? 'Guardando...' : 'Guardar Configuración Zebra'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Columna Derecha: Previsualización de Escala y Resumen Técnico (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E5ECE6] shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE6] mb-4">
                <span className="text-xs font-bold text-[#0D3B22] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#15803D]" />
                  <span>Proporción de Etiqueta</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-400">Escala Visual</span>
              </div>

              {/* Simulación Gráfica de la Etiqueta Proporcional */}
              <div className="flex justify-center items-center py-4 bg-neutral-50 rounded-xl border border-dashed border-[#E5ECE6]">
                <div 
                  className="bg-white border-2 border-black rounded shadow-md p-3 flex flex-col justify-between items-center text-center transition-all select-none"
                  style={{
                    width: `${Math.min(220, Math.round(zebraConfig.anchoMm * 1.8))}px`,
                    height: `${Math.min(320, Math.round(zebraConfig.altoMm * 1.4))}px`,
                  }}
                >
                  <div className="w-full border-b border-black pb-1">
                    <span className="text-[9px] font-black uppercase tracking-wider block text-black">
                      BIOPLAST SPA
                    </span>
                    <span className="text-[7.5px] font-bold text-neutral-500 block">
                      {zebraConfig.anchoMm} x {zebraConfig.altoMm} mm
                    </span>
                  </div>

                  <div className="my-auto py-2 flex flex-col items-center">
                    <div className="w-14 h-14 bg-neutral-100 border border-neutral-300 rounded flex items-center justify-center text-[8px] font-mono font-bold text-neutral-500 mb-1">
                      [ CÓDIGO QR ]
                    </div>
                    <span className="text-[8px] font-mono font-bold">LOTE #10001</span>
                    <span className="text-[7.5px] text-neutral-400 font-mono">EMBALAJE 0001</span>
                  </div>

                  <div className="w-full pt-1 border-t border-black text-[7px] font-mono text-neutral-600 flex justify-between">
                    <span>{zebraConfig.dpi} DPI</span>
                    <span>CORE {zebraConfig.mandrilPulgadas}"</span>
                  </div>
                </div>
              </div>

              {/* Resumen Técnico de Configuración */}
              <div className="mt-4 p-3 rounded-xl bg-[#F7FAF7] border border-[#E5ECE6] text-[11px] space-y-1.5 font-mono text-neutral-700">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Ancho x Alto:</span>
                  <strong className="text-[#0D3B22]">{zebraConfig.anchoMm} x {zebraConfig.altoMm} mm</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Mandril (Core):</span>
                  <strong>{zebraConfig.mandrilPulgadas} pulgadas ({zebraConfig.mandrilPulgadas === 3 ? '76.2 mm' : '25.4 mm'})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Diámetro Máx Rollo:</span>
                  <strong>{zebraConfig.diametroExteriorMaxMm} mm ({zebraConfig.diametroExteriorMaxMm === 203 ? '8"' : '5"'})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Densidad Cabezal:</span>
                  <strong>{zebraConfig.dpi} DPI ({zebraConfig.dpi === 203 ? '8 dots/mm' : '12 dots/mm'})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Sensor de Parada:</span>
                  <strong className="capitalize">{zebraConfig.sensorTipo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Puntos Totales (Dots):</span>
                  <strong>
                    {Math.round(zebraConfig.anchoMm * (zebraConfig.dpi / 25.4))} x {Math.round(zebraConfig.altoMm * (zebraConfig.dpi / 25.4))}
                  </strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Impacto en Línea de Planta:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Al guardar estas dimensiones, el módulo <strong>Iniciar Producción</strong> advertirá inmediatamente al operario qué tipo de bobina térmica debe estar cargada en la impresora antes de pulsar emitir tirada.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUDITORÍA DE INICIOS DE SESIÓN */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por correo o IP..."
                  value={auditSearch}
                  onChange={(e) => {
                    setAuditSearch(e.target.value);
                    setAuditPage(1);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAuditLogs()}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] bg-[#F7FAF7]"
                />
              </div>

              <select
                value={auditExitoso}
                onChange={(e) => {
                  setAuditExitoso(e.target.value);
                  setAuditPage(1);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#E5ECE6] bg-white cursor-pointer"
              >
                <option value="all">Todos los Intentos</option>
                <option value="true">Solo Exitosos</option>
                <option value="false">Solo Fallidos</option>
              </select>
            </div>

            <span className="font-mono text-xs text-neutral-500">
              Registros en Bitácora: <strong>{auditTotal}</strong>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5ECE6] shadow-sm overflow-hidden">
            {loadingAudit ? (
              <div className="p-12 text-center text-sm text-neutral-500 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#15803D]" />
                <span>Cargando bitácora de auditoría...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">
                No hay registros de autenticación para los filtros seleccionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#EEF6F0]/60 border-b border-[#E5ECE6] text-neutral-700 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Resultado</th>
                      <th className="p-3.5">Correo Autenticado</th>
                      <th className="p-3.5">Usuario</th>
                      <th className="p-3.5">IP de Origen</th>
                      <th className="p-3.5">Fecha y Hora</th>
                      <th className="p-3.5">Motivo de Rechazo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5ECE6]">
                    {auditLogs.map((log) => (
                      <tr key={log.uid} className="hover:bg-[#F7FAF7] transition">
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              log.exitoso
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {log.exitoso ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Acceso Concedido</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                <span>Acceso Denegado</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#0D3B22]">
                          {log.correo}
                        </td>
                        <td className="p-3.5 font-semibold text-neutral-700">
                          {log.usuario_nombre || '(No registrado)'}
                        </td>
                        <td className="p-3.5 font-mono text-neutral-500">
                          {log.ip_origen}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-neutral-600">
                          {new Date(log.fecha_hora).toLocaleString('es-CL')}
                        </td>
                        <td className="p-3.5 text-neutral-600 text-[11px]">
                          {log.motivo_fallo ? (
                            <span className="text-red-600 font-medium">{log.motivo_fallo}</span>
                          ) : (
                            <span className="text-neutral-400 font-mono">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {auditTotalPages > 1 && (
              <div className="bg-[#F7FAF7] px-6 py-3 border-t border-[#E5ECE6] flex items-center justify-between text-xs text-neutral-600">
                <div>
                  Página <strong>{auditPage}</strong> de <strong>{auditTotalPages}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={auditPage <= 1}
                    onClick={() => setAuditPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1 rounded-lg border border-[#E5ECE6] bg-white font-medium hover:bg-[#EEF6F0] disabled:opacity-40 transition cursor-pointer"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={auditPage >= auditTotalPages}
                    onClick={() => setAuditPage((p) => Math.min(p + 1, auditTotalPages))}
                    className="px-3 py-1 rounded-lg border border-[#E5ECE6] bg-white font-medium hover:bg-[#EEF6F0] disabled:opacity-40 transition cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      <AnimatePresence>
        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRoleModal(false)}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5ECE6] p-6 z-10 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#E5ECE6]">
                <h3 className="font-bold text-base text-[#0D3B22]">
                  Crear Nuevo Rol de Planta
                </h3>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Nombre del Rol <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roleFormName}
                    onChange={(e) => setRoleFormName(e.target.value)}
                    placeholder="Ej. Supervisor de Calidad"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={roleFormDesc}
                    onChange={(e) => setRoleFormDesc(e.target.value)}
                    placeholder="Ej. Responsable de liberación y certificados R-CAL-07"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1.5">
                    Módulos Asignados al Crear
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {ALL_SYSTEM_MODULES.map((m) => {
                      const checked = roleFormModules.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => {
                            setRoleFormModules((prev) =>
                              checked ? prev.filter((x) => x !== m.id) : [...prev, m.id]
                            );
                          }}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer select-none transition ${
                            checked ? 'bg-[#EEF6F0] border-[#15803D]' : 'bg-white border-[#E5ECE6]'
                          }`}
                        >
                          <span className="font-semibold text-[#0D3B22]">{m.label}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            readOnly
                            className="accent-[#15803D]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E5ECE6]">
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#E5ECE6] text-neutral-600 hover:bg-neutral-100 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingRole}
                    className="px-4 py-2 rounded-xl bg-[#0D3B22] text-white hover:bg-[#15803D] font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {savingRole ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Crear Rol</span>
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
