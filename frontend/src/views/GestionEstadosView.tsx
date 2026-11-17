import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import jsQR from 'jsqr';
import { 
  Scan, QrCode, Camera, CheckCircle2, AlertTriangle, ArrowRight, 
  Clock, RefreshCw, Package, User, Tag, Calendar, 
  RotateCcw, FileText, Check, X, Sparkles, AlertCircle, Eye
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

export const GestionEstadosView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pistola' | 'camara'>('pistola');
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);

  // Input de escaneo
  const [scanInput, setScanInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Datos del lote/unidad escaneado
  const [unitData, setUnitData] = useState<PublicTrazabilidadData | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [updatingState, setUpdatingState] = useState(false);

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
  }, [activeTab, unitData, searching, updatingState]);

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

  // Audio feedback al escanear correctamente
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz (La5)
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // Ignorar si el navegador bloquea audio sin interacción previa
    }
  };

  // Extraer UUID de una cadena (soporta URL completa o UUID plano)
  const extractUid = (input: string): string | null => {
    if (!input) return null;
    const clean = input.trim();
    // Regex estándar para UUID v4 / v1
    const match = clean.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    if (match) return match[0];
    return null;
  };

  // Consultar unidad por UUID
  const handleLookup = async (rawCode: string) => {
    const uid = extractUid(rawCode);
    if (!uid) {
      setErrorMessage(`El código escaneado no contiene un UUID válido. Formato recibido: "${rawCode.slice(0, 40)}..."`);
      return;
    }

    setSearching(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      playBeep();
      const data = await api.getPublicTrazabilidad(uid);
      setUnitData(data);
      setObservaciones('');
      setScanInput('');
      setIsPausedScanning(true);
    } catch (err: any) {
      console.error('Error al consultar unidad:', err);
      setErrorMessage(err.message || 'No se encontró ninguna unidad o lote con ese identificador.');
      setUnitData(null);
    } finally {
      setSearching(false);
    }
  };

  // Submit de pistola (al presionar Enter)
  const handlePistolaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    handleLookup(scanInput);
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

      // Detener cualquier stream anterior
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
            handleLookup(raw);
            return; // Detiene el loop de este tick
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

  // -------------------------------------------------------------
  // Transición de Estado
  // -------------------------------------------------------------
  const handleTransitionState = async (targetEstado: Estado) => {
    if (!unitData) return;

    setUpdatingState(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.updateSingleLotState(unitData.uid, {
        nuevo_estado_uid: targetEstado.uid,
        observaciones: observaciones.trim() || undefined,
      });

      setSuccessMessage(
        `Estado actualizado exitosamente a "${targetEstado.nombre}".`
      );

      // Recargar datos actualizados
      const refreshed = await api.getPublicTrazabilidad(unitData.uid);
      setUnitData(refreshed);
      setObservaciones('');
    } catch (err: any) {
      console.error('Error al actualizar estado:', err);
      setErrorMessage(err.message || 'Error al procesar la transición de estado.');
    } finally {
      setUpdatingState(false);
    }
  };

  // Estados permitidos según la máquina de estados
  const allowedNextStateNames = unitData ? VALID_TRANSITIONS[unitData.estado_actual] || [] : [];
  const allowedNextEstados = estados.filter((est) => allowedNextStateNames.includes(est.nombre));

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
            Control de flujo obligatorio de planta: Producción ➔ Almacenaje ➔ Despacho ➔ Liberado / Retenido.
          </p>
        </div>

        {/* Indicador de regla activa */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#15803D] text-[11px] font-medium self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Máquina de Estados Estricta Activa</span>
        </div>
      </div>

      {/* Tabs Selector: Pistola vs Cámara */}
      <div className="bg-white p-1.5 rounded-2xl border border-[#E5ECE6] shadow-sm flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('pistola')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all ${
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
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all ${
            activeTab === 'camara'
              ? 'bg-[#0D3B22] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Escáner con Cámara (Celular / Web)</span>
        </button>
      </div>

      {/* Mensajes de Alerta */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold">Atención</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#15803D]" />
            <div className="flex-1">
              <p className="font-semibold">Operación Exitosa</p>
              <p className="mt-0.5">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 hover:text-emerald-700"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ÁREA DE ENTRADA / ESCANEO */}
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
                Apunta al código QR del envase o ticket con la pistola. Al capturar, se procesará automáticamente.
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
                className="w-full pl-4 pr-28 py-3.5 bg-neutral-50 border-2 border-[#15803D]/30 focus:border-[#15803D] focus:bg-white rounded-xl text-sm font-mono text-neutral-800 placeholder-neutral-400 transition-all outline-none shadow-inner"
              />
              <button
                type="submit"
                disabled={searching || !scanInput.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-[#0D3B22] text-white text-xs font-semibold hover:bg-[#15803D] disabled:opacity-40 disabled:hover:bg-[#0D3B22] transition flex items-center gap-1.5"
              >
                {searching ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                <span>Buscar</span>
              </button>
            </form>

            <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#15803D]" /> Autofocus permanente
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#15803D]" /> Soporta URL directa o UUID
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5ECE6] p-6 shadow-sm">
          <div className="max-w-xl mx-auto flex flex-col items-center text-center space-y-4">
            <div>
              <h2 className="font-display font-bold text-lg text-[#0D3B22]">
                Escáner con Cámara
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Enfoque el código QR del ticket Zebra para identificar la unidad.
              </p>
            </div>

            {cameraError ? (
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center space-y-3 max-w-md">
                <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
                <p className="font-semibold">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-[#0D3B22] text-white text-xs font-semibold hover:bg-[#15803D] transition inline-flex items-center gap-2"
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
                    <div className="px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-semibold backdrop-blur-sm">
                      QR Capturado
                    </div>
                  )}
                </div>

                {searching && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#15803D]" />
                    <span className="text-xs font-semibold">Consultando unidad...</span>
                  </div>
                )}
              </div>
            )}

            {isPausedScanning && (
              <button
                type="button"
                onClick={resumeScanning}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reanudar Cámara
              </button>
            )}
          </div>
        </div>
      )}

      {/* FICHA DE LA UNIDAD Y GESTIÓN DE ESTADO */}
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
                className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition"
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

          {/* PANEL DE TRANSICIÓN DE ESTADO */}
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-display font-bold text-sm text-[#0D3B22] flex items-center gap-2">
                <span>Transición de Flujo Obligatorio</span>
                <span className="text-xs font-normal text-neutral-500">
                  (Regla de negocio: Producción ➔ Almacenaje ➔ Despacho ➔ Liberado / Retenido)
                </span>
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                Seleccione el siguiente estado reglamentario para este envase. Los estados fuera de secuencia están estrictamente bloqueados.
              </p>
            </div>

            {/* Visualización de la Cadena de Flujo */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              {['Producción', 'Almacenaje', 'Despacho', 'Liberado'].map((etapa, idx) => {
                const isCurrent = unitData.estado_actual === etapa;
                const isPassed =
                  (etapa === 'Producción' && ['Almacenaje', 'Despacho', 'Liberado'].includes(unitData.estado_actual)) ||
                  (etapa === 'Almacenaje' && ['Despacho', 'Liberado'].includes(unitData.estado_actual)) ||
                  (etapa === 'Despacho' && unitData.estado_actual === 'Liberado');
                const isNext = allowedNextStateNames.includes(etapa);

                return (
                  <React.Fragment key={etapa}>
                    {idx > 0 && <ArrowRight className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />}
                    <div
                      className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition ${
                        isCurrent
                          ? 'bg-[#0D3B22] text-white font-bold shadow-xs'
                          : isPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : isNext
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                          : 'bg-neutral-200/60 text-neutral-400'
                      }`}
                    >
                      {isPassed && <Check className="w-3 h-3" />}
                      <span>{etapa}</span>
                    </div>
                  </React.Fragment>
                );
              })}

              <span className="text-neutral-300">|</span>
              <div
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  unitData.estado_actual === 'Retenido'
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : allowedNextStateNames.includes('Retenido')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                Retenido (Cuarentena)
              </div>
            </div>

            {/* Botones de Acción de Estado */}
            <div className="space-y-4">
              <span className="text-xs font-semibold text-neutral-700 block">
                Acciones Permitidas desde "{unitData.estado_actual}":
              </span>

              {allowedNextEstados.length === 0 ? (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-500">
                  Esta unidad se encuentra en estado terminal o no posee transiciones adicionales permitidas en este momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allowedNextEstados.map((destEstado) => {
                    const isRetenido = destEstado.nombre === 'Retenido';
                    return (
                      <button
                        key={destEstado.uid}
                        type="button"
                        disabled={updatingState}
                        onClick={() => handleTransitionState(destEstado)}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 shadow-xs ${
                          isRetenido
                            ? 'border-red-200 bg-red-50/50 hover:bg-red-50 text-red-900 hover:border-red-400'
                            : 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-[#0D3B22] hover:border-[#15803D]'
                        } disabled:opacity-50`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: destEstado.color }}
                          >
                            Mover a {destEstado.nombre}
                          </span>
                          <ArrowRight className="w-4 h-4 opacity-60" />
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          {isRetenido
                            ? 'Apartar por no-conformidad o control de calidad.'
                            : `Avanzar la unidad al estado reglamentario de ${destEstado.nombre}.`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Observaciones del Cambio */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Observaciones / Justificación de Transición (Opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej. Aprobado por control de calidad; Despachado según guía #1234; Apartado por defecto visual..."
                  rows={2}
                  disabled={updatingState}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 focus:bg-white focus:border-[#15803D] outline-none transition"
                />
              </div>
            </div>

            {/* Historial de Trazabilidad */}
            {unitData.historial && unitData.historial.length > 0 && (
              <div className="pt-4 border-t border-[#E5ECE6]">
                <h5 className="font-display font-bold text-xs text-[#0D3B22] mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#15803D]" /> Historial de Cambios de Estado
                </h5>
                <div className="space-y-2">
                  {unitData.historial.map((item, idx) => (
                    <div
                      key={item.uid || idx}
                      className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        {item.estado_anterior && (
                          <span className="font-semibold text-neutral-600">
                            {item.estado_anterior.nombre} ➔
                          </span>
                        )}
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: item.estado_nuevo?.color || '#15803D' }}
                        >
                          {item.estado_nuevo?.nombre}
                        </span>
                        {item.observaciones && (
                          <span className="text-neutral-500 italic">
                            — "{item.observaciones}"
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 sm:text-right">
                        <span>{item.usuario_nombre || 'Sistema de Planta'}</span>
                        <span className="mx-1">·</span>
                        <span>
                          {new Date(item.fecha_hora).toLocaleString('es-CL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
