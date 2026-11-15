import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, Loader2, Lock, Mail, Leaf, Award } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(correo, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7FAF7] select-none">
      {/* LEFT COLUMN: Clean Minimalist White Form */}
      <div className="w-full md:w-[48%] lg:w-[42%] bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-r border-[#E5ECE6] shadow-sm">
        {/* Brand Header */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#15803D] to-[#22C55E] flex items-center justify-center text-white shadow-md shadow-[#15803D]/20">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight text-[#0D3B22]">
                BIOPLAST CHILE
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-[#15803D]">
                Trazabilidad Industrial & Ley REP
              </span>
            </div>
          </div>

          <div className="mt-12">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0F1F16] tracking-tight">
              Portal Operativo B2B
            </h1>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              Ingresa tus credenciales para acceder a la gestión de producción, trazabilidad de lotes y emisión de certificados de calidad.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-xs rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@bioplastchile.cl"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] focus:ring-4 focus:ring-[#15803D]/10 bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-neutral-700">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E5ECE6] focus:outline-none focus:border-[#15803D] focus:ring-4 focus:ring-[#15803D]/10 bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#15803D] to-[#22C55E] hover:opacity-95 active:scale-[0.99] transition shadow-md shadow-[#15803D]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info (Cleaned without AWS RDS text) */}
        <div className="mt-8 pt-6 border-t border-[#E5ECE6] flex items-center justify-between text-[11px] text-neutral-400">
          <span>Bioplast Chile SpA</span>
          <span>appbpch.raevsi.cl</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Climate-Tech Visual Canvas (Deep Pine #0D3B22) */}
      <div className="hidden md:flex flex-1 bg-[#0D3B22] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden bg-botanical-dots-dark">
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#15803D]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-between relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Planta Quilicura · En Operación Continua</span>
          </div>
          <span className="text-xs font-mono text-emerald-300/70 tracking-wider">
            LEY REP 20.920 · D.S. 12
          </span>
        </div>

        {/* Center Content: Circular Eco Metrics & Bento Glass Cards */}
        <div className="my-auto py-8 relative z-10 max-w-lg">
          <h2 className="text-3xl lg:text-4xl font-display font-extrabold tracking-tight text-white leading-tight">
            Plataforma Integral de Trazabilidad y Certificación rPET
          </h2>
          <p className="mt-3 text-sm text-emerald-100/80 leading-relaxed">
            Gestión en tiempo real de tiradas de producción con correlativos estrictos, emisión térmica Zebra y trazabilidad auditable para envases industriales sostenibles.
          </p>

          {/* 2 Clean Translucent Glass Cards (without correlativo interno card) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <Award className="w-5 h-5 text-emerald-300 mb-2" />
              <div className="text-xl font-bold font-mono tracking-tight">R-CAL-07</div>
              <div className="text-[11px] text-emerald-200/70 mt-0.5">Certificado Oficial de Calidad</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <Shield className="w-5 h-5 text-emerald-300 mb-2" />
              <div className="text-xl font-bold font-mono tracking-tight">100% QR</div>
              <div className="text-[11px] text-emerald-200/70 mt-0.5">Consulta Pública Inalterable</div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Statement */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/60 font-mono">
          <span>Bioplast Chile SpA · Industria de Economía Circular</span>
          <span>Santiago, Chile</span>
        </div>
      </div>
    </div>
  );
};
