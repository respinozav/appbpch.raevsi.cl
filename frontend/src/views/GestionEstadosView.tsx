import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import jsQR from 'jsqr';
import { 
  Scan, QrCode, Camera, CheckCircle2, AlertTriangle, ArrowRight, 
  Clock, RefreshCw, Package, User, Tag, Calendar, 
  RotateCcw, FileText, Check, X, Sparkles, AlertCircle, Eye,
  ArrowDownCircle, ShieldAlert, History, Volume2
} from 'lucide-react';
import { api, PublicTrazabilidadData, Estado } from '../api/client';

// Máquina de estados según regla de negocio oficial Bioplast Chile:
// Producción ➔ Almacenaje ➔ Despacho ➔ Liberado / Retenido
const VALID_TRANSITIONS: Record<string, string[]> = {
  'Producción': ['Almacenaje', 'Retenido'],
  'Almacenaje': ['Despacho', 'Retenido'],
  'Despacho': ['Liberado', 'Retenido'],
  'Retenido': ['Producción', 'Almacenaje', 'Despacho', 'Liberado'],
  'Liberado': ['Retenido']
};

interface ScanLogEntry {
  id: string;
  lote: number;
  unidad_embalaje: string;
  articulo: string;
  estado_anterior: string;
  estado_nuevo?: string;
  exitoso: boolean;
  motivo_rechazo?: string;
  hora: Date;
}

export const GestionEstadosView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pistola' | 'camara'>('pistola');
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);

  // Modo de operación: 'inspect' o el UID de un estado destino preseleccionado
  const [targetStateUid, setTargetStateUid] = useState<string>(''); // Si está vacío o un UID específico

  // Input de escaneo
  const [scanInput, setScanInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Datos del lote/unidad escaneado
  const [unitData, setUnitData] = useState<PublicTrazabilidadData | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [updatingState, setUpdatingState] = useState(false);

  // Registro histórico de la sesión de escaneo continuo
  const [sessionLogs, setSessionLogs] = useState<ScanLogEntry[]>([]);

  // Refs de Pistola
  const inputRef = useRef<HTMLInputElement>(null);

  // Refs y estados de Cámara
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPausedScanning, setIsPausedScanning] = useState(false);

  // 1. Cargar Estados disponibles en el sistema
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setLoadingEstados(true);
        const res = await api.getEstados();
        setEstados(res || []);
        // Seleccionar por defecto "Almacenaje" si existe, ya que es el salto natural tras Producción
        const almacenaje = (res || []).find((e) => e.nombre === 'Almacenaje');
        if (almacenaje) {
          setTargetStateUid(almacenaje.uid);
        }
      } catch (err: any) {
        console.error('Error al cargar lista de estados:', err);
      } finally {
        setLoadingEstados(false);
      }
    };
    fetchEstados();
  }, []);

  // Mantener foco en el input de pistola cuando esté en esa pestaña
  useEffect(() => {
    if (activeTab === 'pistola' && inputRef.current && !searching && !updatingState) {
      inputRef.current.focus();
    }
  }, [activeTab, searching, updatingState, successMessage, errorMessage]);

  // Manejo de la cámara cuando cambia la pestaña
  useEffect(() => {
    if (activeTab === 'camara') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  // Audio feedback táctil/sonoro
  const playBeep = (type: 'success' | 'error' = 'success') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'success') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.15);
          navigator.vibrate?.(100);
        } else {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.35);
          navigator.vibrate?.([150, 80, 150]);
        }
      }
    } catch {
      // Ignorar restricciones de audio del navegador
    }
  };

  // Extraer UUID de una cadena (soporta URL completa o UUID plano)
  const extractUid = (input: string): string | null => {
    if (!input) return null;
    const clean = input.trim();
    const match = clean.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    if (match) return match[0];
    return null;
  };

  // Procesar escaneo (Modo Automático Preseleccionado vs Modo Inspección)
  const handleProcessScan = async (rawCode: string) => {
    const uid = extractUid(rawCode);
    if (!uid) {
      setErrorMessage(`El código escaneado no contiene un formato de UUID válido.`);
      playBeep('error');
      return;
    }

    setSearching(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Consultar estado y datos de la unidad
      const unit = await api.getPublicTrazabilidad(uid);
      setUnitData(unit);

      // 2. Si no hay estado preseleccionado o es modo inspección ('inspect'), solo mostrar la ficha
      if (!targetStateUid || targetStateUid === 'inspect') {
        playBeep('success');
        setSuccessMessage(`Unidad Lote #${unit.lote} - Emb. ${unit.unidad_embalaje} cargada en modo inspección.`);
        setScanInput('');
        setIsPausedScanning(true);
        return;
      }

      // 3. Obtener el estado objetivo seleccionado
      const targetState = estados.find((e) => e.uid === targetStateUid);
      if (!targetState) {
        throw new Error('Estado destino seleccionado no es válido en el sistema.');
      }

      // 4. Validar la regla de flujo obligatorio:
      // Producción ➔ Almacenaje ➔ Despacho ➔ Liberado / Retenido
      const allowedNext = VALID_TRANSITIONS[unit.estado_actual] || [];

      if (!allowedNext.includes(targetState.nombre)) {
        // ERROR: La transición viola la regla de negocio
        const errorDetail = `La unidad se encuentra en estado "${unit.estado_actual}" y no puede pasar a "${targetState.nombre}". Regla de flujo obligatorio: Producción ➔ Almacenaje ➔ Despacho ➔ Liberado/Retenido.`;
        setErrorMessage(`✕ Transición Rechazada: ${errorDetail}`);
        playBeep('error');

        // Registrar intento fallido en el historial de sesión
        setSessionLogs((prev) => [
          {
            id: uid,
            lote: unit.lote,
            unidad_embalaje: unit.unidad_embalaje,
            articulo: unit.articulo,
            estado_anterior: unit.estado_actual,
            estado_nuevo: targetState.nombre,
            exitoso: false,
            motivo_rechazo: errorDetail,
            hora: new Date(),
          },
          ...prev.slice(0, 49),
        ]);

        setScanInput('');
        return;
      }

      // 5. TRANSICIÓN VÁLIDA: Aplicar cambio de estado de inmediato
      await api.updateSingleLotState(unit.uid, {
        nuevo_estado_uid: targetState.uid,
        observaciones: observaciones.trim() || `Transición automática a ${targetState.nombre} vía escáner QR`,
      });

      playBeep('success');
      setSuccessMessage(
        `✓ Envase Lote #${unit.lote} - Emb. ${unit.unidad_embalaje} (${unit.articulo}): Pasó exitosamente al estado "${targetState.nombre}".`
      );

      // Registrar éxito en el historial de sesión
      setSessionLogs((prev) => [
        {
          id: uid,
          lote: unit.lote,
          unidad_embalaje: unit.unidad_embalaje,
          articulo: unit.articulo,
          estado_anterior: unit.estado_actual,
          estado_nuevo: targetState.nombre,
          exitoso: true,
          hora: new Date(),
        },
        ...prev.slice(0, 49),
      ]);

      // Refrescar datos locales de la unidad
      const refreshed = await api.getPublicTrazabilidad(unit.uid);
      setUnitData(refreshed);
      setScanInput('');

      // En modo cámara, pausar brevemente y reanudar tras 1.2 segundos para flujo continuo
      if (activeTab === 'camara') {
        setIsPausedScanning(true);
        setTimeout(() => {
          setIsPausedScanning(false);
          if (cameraActive) {
            animationFrameRef.current = requestAnimationFrame(tickScan);
          }
        }, 1200);
      }
    } catch (err: any) {
      console.error('Error al procesar escaneo:', err);
      setErrorMessage(err.message || 'Error al comunicarse con el servidor o lote no encontrado.');
      playBeep('error');
    } finally {
      setSearching(false);
    }
  };

  // Submit de pistola (al presionar Enter)
  const handlePistolaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    handleProcessScan(scanInput);
  };

  // -------------------------------------------------------------
  // Control de Cámara con jsQR
  // -------------------------------------------------------------
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara no está disponible en este dispositivo o navegador.');
      }

      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        setIsPausedScanning(false);
        requestAnimationFrame(tickScan);
      }
    } catch (err: any) {
      console.error('Error al iniciar cámara:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Permiso denegado para acceder a la cámara. Por favor autorice el acceso en su navegador.'
          : err.message || 'No fue posible iniciar la cámara.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const tickScan = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data && !isPausedScanning) {
          const raw = code.data;
          const foundUid = extractUid(raw);
          if (foundUid) {
            handleProcessScan(raw);
            return;
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(tickScan);
  };

  const resumeScanning = () => {
    setUnitData(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsPausedScanning(false);
    if (activeTab === 'camara' && cameraActive) {
      animationFrameRef.current = requestAnimationFrame(tickScan);
    } else if (activeTab === 'pistola' && inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Transición manual desde la ficha
  const handleManualTransition = async (targetEstado: Estado) => {
    if (!unitData) return;

    setUpdatingState(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.updateSingleLotState(unitData.uid, {
        nuevo_estado_uid: targetEstado.uid,
        observaciones: observaciones.trim() || undefined,
      });

      playBeep('success');
      setSuccessMessage(`Estado actualizado exitosamente a "${targetEstado.nombre}".`);

      setSessionLogs((prev) => [
        {
          id: unitData.uid,
          lote: unitData.lote,
          unidad_embalaje: unitData.unidad_embalaje,
          articulo: unitData.articulo,
          estado_anterior: unitData.estado_actual,
          estado_nuevo: targetEstado.nombre,
          exitoso: true,
          hora: new Date(),
        },
        ...prev.slice(0, 49),
      ]);

      const refreshed = await api.getPublicTrazabilidad(unitData.uid);
      setUnitData(refreshed);
      setObservaciones('');
    } catch (err: any) {
      console.error('Error al actualizar estado:', err);
      setErrorMessage(err.message || 'Error al procesar la transición de estado.');
      playBeep('error');
    } finally {
      setUpdatingState(false);
    }
  };

  const selectedTargetObj = estados.find((e) => e.uid === targetStateUid);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECE6] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#0D3B22]/5 text-[#15803D]">
              <Scan className="w-5 h-5" />
            </span>
            <h1 className="font-display font-bold text-2xl text-[#0D3B22]">
              Gestión de Estados
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Control de flujo obligatorio de planta: <code>Producción ➔ Almacenaje ➔ Despacho ➔ Liberado / Retenido</code>.
          </p>
        </div>

        {/* Indicador de regla activa */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#15803D] text-[11px] font-medium self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Máquina de Estados Estricta Activa</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SELECTOR PREVIO DE ESTADO DESTINO (ACCIÓN AL ESCANEAR) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border-2 border-[#15803D]/25 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">
              Paso 1 · Preselección de Acción Operativa
            </span>
            <h3 className="text-sm font-bold text-[#0D3B22] flex items-center gap-1.5">
              <span>Estado Destino al Pistolear / Escanear</span>
              <span className="text-[11px] font-normal text-neutral-500">(Modo Continuo de Planta)</span>
            </h3>
          </div>

          {selectedTargetObj ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-2xs self-start sm:self-auto" style={{ backgroundColor: selectedTargetObj.color }}>
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>Modo Activo: Mover a {selectedTargetObj.nombre}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-300 self-start sm:self-auto">
              <Eye className="w-3.5 h-3.5" />
              <span>Modo Activo: Solo Inspeccionar / Consultar</span>
            </div>
          )}
        </div>

        <p className="text-xs text-neutral-600">
          Selecciona a qué etapa pasarán los envases leídos. Al escanear con la pistola o cámara, el sistema validará la regla de negocio y moverá el envase automáticamente:
        </p>

        {/* Botones de Selección Rápida de Estado Destino */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {estados.map((est) => {
            const isSelected = targetStateUid === est.uid;
            return (
              <button
                key={est.uid}
                type="button"
                onClick={() => setTargetStateUid(est.uid)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'border-2 text-white shadow-sm ring-2 ring-offset-1'
                    : 'border-[#E5ECE6] bg-neutral-50/80 hover:bg-neutral-100/80 text-neutral-800'
                }`}
                style={isSelected ? { backgroundColor: est.color, borderColor: est.color } : {}}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold">{est.nombre}</span>
                  {isSelected ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: est.color }} />
                  )}
                </div>
                <span className={`text-[10px] ${isSelected ? 'text-white/90' : 'text-neutral-500'}`}>
                  {est.nombre === 'Almacenaje' && 'Recepción en bodega'}
                  {est.nombre === 'Despacho' && 'Preparación de carga'}
                  {est.nombre === 'Liberado' && 'Aprobación de calidad'}
                  {est.nombre === 'Retenido' && 'Apartado / Cuarentena'}
                  {est.nombre === 'Producción' && 'Retorno a línea'}
                </span>
              </button>
            );
          })}

          {/* Opción de Solo Consulta */}
          <button
            type="button"
            onClick={() => setTargetStateUid('inspect')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
              targetStateUid === 'inspect'
                ? 'border-2 border-neutral-700 bg-neutral-800 text-white shadow-sm ring-2 ring-offset-1'
                : 'border-[#E5ECE6] bg-neutral-50/80 hover:bg-neutral-100/80 text-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold">Solo Inspección</span>
              {targetStateUid === 'inspect' ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-neutral-400" />
              )}
            </div>
            <span className={`text-[10px] ${targetStateUid === 'inspect' ? 'text-white/90' : 'text-neutral-500'}`}>
              Consultar sin modificar estado
            </span>
          </button>
        </div>
      </div>

      {/* Tabs Selector: Pistola vs Cámara */}
      <div className="bg-white p-1.5 rounded-2xl border border-[#E5ECE6] shadow-sm flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('pistola')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            activeTab === 'pistola'
              ? 'bg-[#0D3B22] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Gestión por Lectura Pistola QR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('camara')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            activeTab === 'camara'
              ? 'bg-[#0D3B22] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Escáner con Cámara (Celular / Web)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MENSAJES DE ALERTA: SUCCESS (ÉXITO) Y ERROR (RECHAZO CON EXPLICACIÓN) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 flex items-start gap-3 text-emerald-900 text-xs shadow-xs"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#15803D]" />
            <div className="flex-1">
              <p className="font-bold text-sm text-[#0D3B22]">Transición Exitosa</p>
              <p className="mt-0.5 text-emerald-800 leading-relaxed font-medium">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-500 hover:text-emerald-800 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-red-50 border-2 border-red-400 flex items-start gap-3 text-red-900 text-xs shadow-xs"
          >
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <p className="font-bold text-sm text-red-800">Transición Bloqueada por Regla de Negocio</p>
              <p className="mt-0.5 text-red-700 leading-relaxed font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-700 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. ÁREA DE ENTRADA / ESCANEO */}
      {/* ========================================================================= */}
      {activeTab === 'pistola' ? (
        <div className="bg-white rounded-2xl border border-[#E5ECE6] p-6 shadow-sm">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#15803D] flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[#0D3B22]">
                Lector de Pistola Láser / Bluetooth
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Apunta al código QR del ticket Zebra. Al pistolear, el envase pasará directamente al estado seleccionado.
              </p>
            </div>

            <form onSubmit={handlePistolaSubmit} className="relative mt-2">
              <input
                ref={inputRef}
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Escanee aquí con la pistola o ingrese la URL/UUID..."
                disabled={searching}
                className="w-full pl-4 pr-28 py-3.5 bg-neutral-50 border-2 border-[#15803D]/40 focus:border-[#15803D] focus:bg-white rounded-xl text-sm font-mono text-neutral-800 placeholder-neutral-400 transition-all outline-none shadow-inner"
              />
              <button
                type="submit"
                disabled={searching || !scanInput.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-[#0D3B22] text-white text-xs font-semibold hover:bg-[#15803D] disabled:opacity-40 disabled:hover:bg-[#0D3B22] transition flex items-center gap-1.5 cursor-pointer"
              >
                {searching ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                <span>Procesar</span>
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#15803D]" /> Autofocus permanente listo
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#15803D]" /> Transición en 1 solo paso al pistolear
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#15803D]" /> Soporta URL o UUID plano
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5ECE6] p-6 shadow-sm">
          <div className="max-w-xl mx-auto flex flex-col items-center text-center space-y-4">
            <div>
              <h2 className="font-display font-bold text-lg text-[#0D3B22]">
                Escáner con Cámara (Celular / Web)
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Enfoque el código QR del ticket Zebra. El sistema detectará la unidad y aplicará la transición inmediatamente.
              </p>
            </div>

            {cameraError ? (
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center space-y-3 max-w-md">
                <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
                <p className="font-semibold">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-[#0D3B22] text-white text-xs font-semibold hover:bg-[#15803D] transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reintentar Acceso
                </button>
              </div>
            ) : (
              <div className="relative w-full max-w-sm aspect-square bg-neutral-900 rounded-2xl overflow-hidden shadow-lg border-2 border-[#15803D]/40 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Retículo de Escaneo */}
                <div className="absolute inset-8 border-2 border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-12 h-12 border-t-2 border-l-2 border-[#15803D] absolute -top-1 -left-1" />
                  <div className="w-12 h-12 border-t-2 border-r-2 border-[#15803D] absolute -top-1 -right-1" />
                  <div className="w-12 h-12 border-b-2 border-l-2 border-[#15803D] absolute -bottom-1 -left-1" />
                  <div className="w-12 h-12 border-b-2 border-r-2 border-[#15803D] absolute -bottom-1 -right-1" />
                  
                  {isPausedScanning && (
                    <div className="px-3 py-1.5 rounded-full bg-emerald-600/90 text-white text-xs font-bold backdrop-blur-sm animate-pulse">
                      ¡Código QR Procesado!
                    </div>
                  )}
                </div>

                {searching && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#15803D]" />
                    <span className="text-xs font-semibold">Validando y aplicando estado...</span>
                  </div>
                )}
              </div>
            )}

            {isPausedScanning && (
              <button
                type="button"
                onClick={resumeScanning}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reanudar Cámara
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HISTORIAL DE LECTURAS DE LA SESIÓN EN TIEMPO REAL */}
      {/* ========================================================================= */}
      {sessionLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5ECE6] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE6]">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#15803D]" />
              <h3 className="font-bold text-xs text-[#0D3B22] uppercase tracking-wide">
                Bitácora de Escaneos de la Sesión ({sessionLogs.length} envases procesados)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSessionLogs([])}
              className="text-[11px] text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
            >
              Limpiar bitácora
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {sessionLogs.map((log, idx) => (
              <div
                key={log.id + idx}
                className={`p-2.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  log.exitoso
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : 'bg-red-50/50 border-red-200 text-red-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  {log.exitoso ? (
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span className="font-mono font-bold">
                    Lote #{log.lote} - Emb. {log.unidad_embalaje}
                  </span>
                  <span className="text-neutral-500 line-clamp-1">({log.articulo})</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  {log.exitoso ? (
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-[#15803D]">
                      {log.estado_anterior} ➔ {log.estado_nuevo}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700" title={log.motivo_rechazo}>
                      Rechazado ({log.estado_anterior})
                    </span>
                  )}
                  <span className="text-neutral-400">
                    {log.hora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FICHA DE DETALLES DEL ÚLTIMO ENVASE ESCANEADO */}
      {/* ========================================================================= */}
      {unitData && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E5ECE6] shadow-sm overflow-hidden"
        >
          {/* Header de la Ficha */}
          <div className="p-6 bg-gradient-to-r from-neutral-50 to-white border-b border-[#E5ECE6] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#15803D] uppercase tracking-wider">
                  Unidad de Embalaje #{unitData.unidad_embalaje}
                </span>
                <span className="text-neutral-300">·</span>
                <span className="text-xs text-neutral-500 font-medium">
                  Lote #{unitData.lote}
                </span>
              </div>
              <h3 className="font-display font-bold text-xl text-[#0D3B22] mt-0.5">
                {unitData.articulo}
              </h3>
              <p className="text-xs font-mono text-neutral-500 mt-1">
                UUID: {unitData.uid}
              </p>
            </div>

            {/* Badge de Estado Actual */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="text-right">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Estado Actual
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs mt-0.5"
                  style={{ backgroundColor: unitData.estado_color || '#15803D' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {unitData.estado_actual}
                </span>
              </div>

              <button
                type="button"
                onClick={resumeScanning}
                className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition cursor-pointer"
                title="Escanear otra unidad"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grilla de Datos del Envase */}
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 border-b border-[#E5ECE6] bg-[#F7FAF7]/40 text-xs">
            <div className="space-y-1">
              <span className="text-neutral-400 font-medium flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Código Interno / SAP
              </span>
              <p className="font-semibold text-neutral-800 font-mono">
                {unitData.codigosap || unitData.codigo_interno}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-neutral-400 font-medium flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> Materia Prima
              </span>
              <p className="font-semibold text-neutral-800">
                {unitData.material}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-neutral-400 font-medium flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Operador Responsable
              </span>
              <p className="font-semibold text-neutral-800">
                {unitData.operador_nombre || `Op. #${unitData.operador}`}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-neutral-400 font-medium">Turno & Máquina</span>
              <p className="font-semibold text-neutral-800">
                Turno {unitData.turno} · Iny. #{unitData.numero_maquina}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-neutral-400 font-medium">Cantidad & Peso</span>
              <p className="font-semibold text-neutral-800">
                {unitData.cantidad} un. ({unitData.peso})
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-neutral-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Fabricación
              </span>
              <p className="font-semibold text-neutral-800">
                {new Date(unitData.fecha_fabricacion).toLocaleDateString('es-CL')}
              </p>
            </div>
          </div>

          {/* Transiciones Manuales Alternativas */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-[#0D3B22] uppercase tracking-wide">
                  Acciones Manuales Disponibles
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Opciones permitidas según el estado actual "{unitData.estado_actual}":
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {(VALID_TRANSITIONS[unitData.estado_actual] || []).map((destName) => {
                const targetEst = estados.find((e) => e.nombre === destName);
                if (!targetEst) return null;
                const isRetenido = destName === 'Retenido';

                return (
                  <button
                    key={targetEst.uid}
                    type="button"
                    disabled={updatingState}
                    onClick={() => handleManualTransition(targetEst)}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isRetenido
                        ? 'border-red-200 bg-red-50/50 hover:bg-red-50 text-red-900'
                        : 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-[#0D3B22]'
                    } disabled:opacity-50`}
                  >
                    <span className="text-xs font-bold">Mover a {destName}</span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </button>
                );
              })}
            </div>

            {/* Observaciones */}
            <div className="pt-2">
              <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                Observaciones / Justificación adicional (Opcional):
              </label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej. Aprobado por control de calidad; Despachado según guía..."
                disabled={updatingState}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 focus:bg-white focus:border-[#15803D] outline-none transition"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
