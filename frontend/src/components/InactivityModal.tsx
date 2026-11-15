import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ShieldAlert, ArrowRight, LogOut } from 'lucide-react';

interface InactivityModalProps {
  show: boolean;
  secondsRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

export const InactivityModal: React.FC<InactivityModalProps> = ({
  show,
  secondsRemaining,
  onExtend,
  onLogout,
}) => {
  if (!show) return null;

  const pct = Math.max(0, Math.min(100, Math.round((secondsRemaining / 60) * 100)));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-amber-200/80 p-6 sm:p-7 z-10 overflow-hidden"
        >
          {/* Top Bar Indicator */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-neutral-100">
            <motion.div
              className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldAlert className="w-3 h-3" />
                <span>Seguridad de Planta</span>
              </div>
              <h3 className="font-display font-extrabold text-lg text-neutral-900 leading-tight">
                Sesión a punto de caducar
              </h3>
            </div>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed mb-5">
            Por protocolo de seguridad y resguardo de la trazabilidad industrial de Bioplast Chile SpA, 
            tu sesión se cerrará automáticamente en:
          </p>

          {/* Countdown Clock Badge */}
          <div className="bg-amber-50/80 rounded-2xl border border-amber-200/60 p-4 text-center mb-6">
            <div className="font-mono font-black text-4xl text-amber-700 tracking-tight">
              00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
            </div>
            <span className="text-[11px] font-medium text-amber-800/80 mt-1 block">
              segundos de inactividad restantes
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onExtend}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#15803D] to-[#22C55E] hover:opacity-95 active:scale-[0.99] transition shadow-md shadow-[#15803D]/25 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continuar Sesión</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onLogout}
              className="py-3 px-4 rounded-xl font-bold text-xs text-neutral-600 bg-neutral-100 hover:bg-neutral-200/70 active:scale-[0.99] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-neutral-500" />
              <span>Cerrar Ahora</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
