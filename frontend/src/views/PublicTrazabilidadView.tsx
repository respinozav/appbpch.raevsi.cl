import React, { useState, useEffect } from 'react';
import { api, PublicTrazabilidadData } from '../api/client';
import { 
  CheckCircle2, Leaf, Clock, Award, AlertCircle, RefreshCw, Lock
} from 'lucide-react';

export const PublicTrazabilidadView: React.FC<{ uid: string }> = ({ uid }) => {
  const [data, setData] = useState<PublicTrazabilidadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getPublicTrazabilidad(uid);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Código de trazabilidad no válido');
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchPublicData();
    }
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAF7] flex flex-col items-center justify-center p-4">
        <div className="p-8 bg-white rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col items-center gap-3 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#15803D]" />
          <h2 className="font-display font-bold text-lg text-[#0D3B22]">
            Verificando Registro en Bioplast Chile...
          </h2>
          <p className="text-xs text-neutral-500 font-mono">UID: {uid}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F7FAF7] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-red-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-lg text-neutral-900">
            Registro No Encontrado
          </h2>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            {error || 'El código de trazabilidad no corresponde a ningún lote oficial emitido por Bioplast Chile SpA.'}
          </p>
          <a
            href="/"
            className="mt-6 px-4 py-2 rounded-xl bg-[#0D3B22] text-white text-xs font-semibold hover:bg-[#15803D] transition"
          >
            Ir al Portal Principal
          </a>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(data.fecha_fabricacion).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#F7FAF7] py-10 px-4 sm:px-6 lg:px-8 bg-botanical-dots">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Verification Banner */}
        <div className="bg-white rounded-2xl border border-[#E5ECE6] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#15803D] to-[#22C55E] flex items-center justify-center text-white shadow-md shadow-[#15803D]/25">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-black text-xl tracking-tight text-[#0D3B22] block leading-none">
                BIOPLAST CHILE
              </span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mt-0.5">
                Certificación Pública de Origen & Trazabilidad
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803D] text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>LOTE VERIFICADO Y AUTÉNTICO</span>
          </div>
        </div>

        {/* Read-Only Form Container */}
        <div className="bg-white rounded-2xl border border-[#E5ECE6] shadow-sm overflow-hidden p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5ECE6]">
            <div>
              <span className="text-[11px] font-mono font-bold text-[#15803D] uppercase tracking-wider block">
                Consulta Oficial · Modo No Editable
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-black text-[#0D3B22] mt-0.5">
                {data.articulo}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono bg-neutral-100 px-3 py-1 rounded-lg">
              <Lock className="w-3.5 h-3.5" />
              <span>Solo Lectura</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
            <div className="p-3.5 rounded-xl bg-[#F7FAF7] border border-[#E5ECE6]">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">UID (UUID)</span>
              <span className="font-mono text-xs font-extrabold text-[#0D3B22] truncate block" title={String(data.uid)}>
                {String(data.uid).slice(0, 8)}...
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7FAF7] border border-[#E5ECE6]">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Código Interno</span>
              <span className="font-mono text-base font-extrabold text-[#0D3B22]">#{data.codigo_interno}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#EEF6F0] border border-[#15803D]/20">
              <span className="text-[10px] uppercase font-bold text-[#15803D] block">Lote Correlativo</span>
              <span className="font-mono text-lg font-black text-[#0D3B22]">{data.lote}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7FAF7] border border-[#E5ECE6]">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Unid. Embalaje</span>
              <span className="font-mono text-base font-extrabold text-[#0D3B22]">{data.unidad_embalaje}</span>
            </div>
          </div>

          {/* Form Fields Table (Non-editable) */}
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7]/60">
                <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-1">
                  Polímero / Material
                </span>
                <span className="font-semibold text-neutral-800 text-sm">{data.material}</span>
              </div>

              <div className="p-3 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7]/60">
                <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-1">
                  Colores (Cuerpo / Asa)
                </span>
                <span className="font-semibold text-neutral-800 text-sm">
                  {data.color_bidon} / {data.color_asa}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7]/60">
                <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-1">
                  Cantidad (UND)
                </span>
                <span className="font-mono font-bold text-neutral-800 text-sm">
                  {data.cantidad.toLocaleString('es-CL')} UND.
                </span>
              </div>

              <div className="p-3 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7]/60">
                <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-1">
                  Peso Unitario
                </span>
                <span className="font-mono font-bold text-neutral-800 text-sm">{data.peso}</span>
              </div>

              <div className="p-3 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7]/60">
                <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-1">
                  Máquina / Turno
                </span>
                <span className="font-mono font-bold text-neutral-800 text-sm">
                  Máq #{data.numero_maquina} (T{data.turno})
                </span>
              </div>

              <div className="p-3 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7]/60">
                <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-1">
                  Operador
                </span>
                <span className="font-mono font-bold text-neutral-800 text-sm">#{data.operador}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7]/60">
                <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-1">
                  Fecha y Hora de Fabricación
                </span>
                <span className="font-mono font-semibold text-neutral-800">{formattedDate}</span>
              </div>

              <div className="p-3 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7]/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-0.5">
                    Estado Actual del Lote
                  </span>
                  <span
                    className="px-2.5 py-0.5 text-xs font-bold rounded text-white"
                    style={{ backgroundColor: data.estado_color }}
                  >
                    {data.estado_actual}
                  </span>
                </div>
                {data.aprobado_calidad && (
                  <span className="text-[11px] font-bold text-[#15803D] flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>Liberado por Calidad</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Audit History Timeline */}
          {data.historial && data.historial.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#E5ECE6]">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#0D3B22] mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#15803D]" />
                <span>Cadena de Custodia y Auditoría (Trazabilidad)</span>
              </h3>

              <div className="space-y-2">
                {data.historial.map((h) => (
                  <div
                    key={h.uid}
                    className="p-3 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: h.estado_nuevo.color }}
                      />
                      <span className="font-bold text-[#0D3B22]">{h.estado_nuevo.nombre}</span>
                      {h.observaciones && (
                        <span className="text-neutral-500 text-[11px]">· {h.observaciones}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {new Date(h.fecha_hora).toLocaleString('es-CL')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Legal Notice */}
          <div className="mt-8 p-4 rounded-xl bg-[#EEF6F0]/60 border border-[#15803D]/20 text-[11px] text-neutral-600 leading-relaxed">
            <strong>Declaración de Conformidad:</strong> Este registro ha sido verificado criptográficamente a través de la llave única <code className="font-mono text-[#0D3B22]">UID {data.uid}</code> persistida en los servidores de producción de Bioplast Chile SpA (dominio appbpch.raevsi.cl). Cumplimiento con la Ley REP 20.920 y normativas de inocuidad para envases plásticos.
          </div>
        </div>
      </div>
    </div>
  );
};
