import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api, DashboardMetricsData } from '../api/client';
import { 
  Factory, Award, Leaf, Layers, ArrowUpRight, 
  RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, 
  Sliders, History, Clock, ArrowRight, TrendingUp, Calendar, X
} from 'lucide-react';

const getInitialMonthDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return {
    desde: `${year}-${month}-01`,
    hasta: `${year}-${month}-${day}`
  };
};

export const DashboardView: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const initialDates = getInitialMonthDates();
  const [period, setPeriod] = useState<string>('month');
  const [fechaDesde, setFechaDesde] = useState<string>(initialDates.desde);
  const [fechaHasta, setFechaHasta] = useState<string>(initialDates.hasta);
  const [materialFilter, setMaterialFilter] = useState<string>('all');
  const [data, setData] = useState<DashboardMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardMetrics({
        period,
        material: materialFilter,
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
      });
      setData(res);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [period, materialFilter, fechaDesde, fechaHasta]);

  const handlePreset = (presetId: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (presetId === 'today') {
      setFechaDesde(today);
      setFechaHasta(today);
      setPeriod('today');
    } else if (presetId === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setFechaDesde(d.toISOString().split('T')[0]);
      setFechaHasta(today);
      setPeriod('week');
    } else if (presetId === 'month') {
      const d = new Date();
      d.setDate(1);
      setFechaDesde(d.toISOString().split('T')[0]);
      setFechaHasta(today);
      setPeriod('month');
    } else if (presetId === 'year') {
      setFechaDesde('2026-01-01');
      setFechaHasta(today);
      setPeriod('year');
    } else {
      setFechaDesde('');
      setFechaHasta('');
      setPeriod('all');
    }
  };

  const periods = [
    { id: 'today', label: 'Hoy' },
    { id: 'week', label: '7 días' },
    { id: 'month', label: 'Este Mes' },
    { id: 'year', label: 'Año 2026' },
    { id: 'all', label: 'Histórico' },
  ];

  const materials = [
    { id: 'all', label: 'Todas las Resinas' },
    { id: 'PET', label: 'PET Virgen' },
    { id: 'rPET', label: 'rPET Reciclado' },
    { id: 'HDPE', label: 'HDPE Polietileno' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header & Live Filter Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5ECE6] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15803D]">
              Inteligencia Operativa · Planta Quilicura
            </span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-[#0D3B22] tracking-tight mt-0.5">
            Dashboard Ejecutivo & Trazabilidad
          </h1>
          <p className="text-xs text-neutral-500">
            Control de tiradas, eficiencia de líneas, cumplimiento Ley REP 20.920 y métricas de calidad.
          </p>
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range: Fecha Desde & Fecha Hasta */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#F7FAF7] p-1.5 rounded-xl border border-[#E5ECE6]">
            {/* Fecha Desde */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-[#E5ECE6] shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
              <label htmlFor="fecha-desde" className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Desde
              </label>
              <input
                id="fecha-desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => {
                  setFechaDesde(e.target.value);
                  setPeriod('custom');
                }}
                className="text-xs font-mono font-medium text-[#0D3B22] bg-transparent outline-none cursor-pointer"
              />
            </div>

            {/* Fecha Hasta */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-[#E5ECE6] shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
              <label htmlFor="fecha-hasta" className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Hasta
              </label>
              <input
                id="fecha-hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => {
                  setFechaHasta(e.target.value);
                  setPeriod('custom');
                }}
                className="text-xs font-mono font-medium text-[#0D3B22] bg-transparent outline-none cursor-pointer"
              />
            </div>

            {/* Quick Presets */}
            <div className="hidden sm:flex items-center gap-1 border-l border-[#E5ECE6] pl-1.5 ml-0.5">
              {periods.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePreset(p.id)}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-md transition ${
                    period === p.id && !fechaDesde && !fechaHasta
                      ? 'bg-[#0D3B22] text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Clear Range Button */}
            {(fechaDesde || fechaHasta) && (
              <button
                type="button"
                onClick={() => handlePreset('all')}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Limpiar filtros de fecha"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
          </div>

          {/* Material dropdown */}
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-[#E5ECE6] bg-white text-neutral-700 focus:outline-none focus:border-[#15803D] cursor-pointer"
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Refresh button */}
          <button
            onClick={fetchMetrics}
            className="p-2 text-neutral-600 hover:text-[#0D3B22] hover:bg-[#EEF6F0] rounded-xl border border-[#E5ECE6] transition"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Bento Row: 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Producción Total */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Producción Acumulada</span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF6F0] text-[#15803D] flex items-center justify-center">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-black text-[#0D3B22] tracking-tight">
              {data ? data.resumen.total_unidades.toLocaleString('es-CL') : '0'} <span className="text-sm font-normal text-neutral-400">UND</span>
            </div>
            <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
              <span className="font-mono font-bold text-[#15803D]">{data?.resumen.total_lotes || 0}</span> lotes emitidos en <span className="font-mono font-bold">{data?.resumen.distinct_batches || 0}</span> tiradas
            </div>
          </div>
          {/* Subtle SVG Sparkline */}
          <div className="mt-4 pt-3 border-t border-[#E5ECE6] flex items-center justify-between text-[11px] text-[#15803D] font-semibold">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Operación continua</span>
            </span>
            <span className="text-neutral-400 font-normal font-mono">100% Auditado</span>
          </div>
        </motion.div>

        {/* KPI 2: Tasa de Liberación de Calidad */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Liberación de Calidad</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-black text-[#0D3B22] tracking-tight flex items-baseline gap-1">
              <span>{data ? data.resumen.tasa_liberacion : '100'}%</span>
              <span className="text-xs font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Meta: ≥98.5%
              </span>
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Conformidad Ficha Técnica N° 0101
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5ECE6] flex items-center justify-between text-[11px] text-neutral-500">
            <span>Documento Oficial:</span>
            <span className="font-mono font-bold text-[#0D3B22]">R-CAL-07</span>
          </div>
        </motion.div>

        {/* KPI 3: Incorporación de Resina rPET (Ley REP) */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Incorporación rPET</span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF6F0] text-[#15803D] flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-black text-[#0D3B22] tracking-tight">
              {data ? data.resumen.tasa_rpet : '38.5'}%
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Material reciclado post-consumo
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5ECE6] flex items-center justify-between text-[11px] text-[#15803D] font-semibold">
            <span>Ley REP 20.920</span>
            <span className="text-neutral-500 font-mono font-normal">Meta D.S. 12</span>
          </div>
        </motion.div>

        {/* KPI 4: Emisiones Evitadas tCO2e */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-[#0D3B22] to-[#0A2E1A] text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-emerald-200 text-xs font-semibold">
            <span>Huella de Carbono Evitada</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 text-emerald-300 flex items-center justify-center backdrop-blur-xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-black text-white tracking-tight">
              {data ? data.resumen.tco2_avoided : '14.2'} <span className="text-sm font-normal text-emerald-200">tCO₂e</span>
            </div>
            <div className="text-xs text-emerald-100/70 mt-1">
              Ahorro por uso de resina circular
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-300">
            <span>Equivalente:</span>
            <span className="font-mono text-white font-bold">~640 árboles</span>
          </div>
        </motion.div>
      </div>

      {/* 2.5 Gráfico de Tendencia Temporal & Yield de Calidad (Executive Analytics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Evolución de Producción Diaria vs Meta */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5ECE6] gap-2 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#15803D]" />
                <h2 className="font-bold text-sm text-[#0D3B22] uppercase tracking-wide">
                  Evolución de Producción Diaria vs. Meta de Planta
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-neutral-600">
                  <span className="w-2.5 h-2.5 rounded bg-[#15803D]" />
                  <span>Producción Real</span>
                </span>
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <span className="w-2.5 h-2.5 rounded border border-dashed border-[#0D3B22]" />
                  <span>Meta Operativa</span>
                </span>
              </div>
            </div>

            {/* Bars visual representation */}
            {data?.tendencia_diaria && data.tendencia_diaria.length > 0 ? (
              <div className="space-y-4 pt-2">
                <div className="h-44 flex items-end gap-2 sm:gap-3 px-2 pt-6 pb-2 border-b border-[#E5ECE6]">
                  {data.tendencia_diaria.map((td, idx) => {
                    const maxVal = Math.max(...data.tendencia_diaria!.map((x) => Math.max(x.unidades, x.meta)), 1);
                    const heightPct = Math.round((td.unidades / maxVal) * 100);
                    const metaPct = Math.round((td.meta / maxVal) * 100);
                    const formattedDate = td.fecha.split('-').slice(1).join('/');

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[#0D3B22] text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap">
                          <div>{td.fecha}</div>
                          <div>Real: <strong>{td.unidades.toLocaleString('es-CL')}</strong> | Meta: {td.meta.toLocaleString('es-CL')}</div>
                        </div>

                        {/* Meta reference line mark */}
                        <div
                          className="w-full border-t-2 border-dashed border-neutral-300 absolute z-10 transition-all pointer-events-none"
                          style={{ bottom: `${Math.min(metaPct, 95)}%` }}
                        />

                        {/* Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: td.unidades > 0 ? `${Math.max(heightPct, 8)}%` : '4px' }}
                          transition={{ duration: 0.5, delay: idx * 0.03 }}
                          className={`w-full rounded-t-md transition-all ${
                            td.unidades === 0
                              ? 'bg-neutral-200/80'
                              : td.unidades >= td.meta
                              ? 'bg-gradient-to-t from-[#15803D] to-[#22C55E]'
                              : 'bg-gradient-to-t from-[#0D3B22] to-[#15803D]'
                          } hover:brightness-110 shadow-xs`}
                        />

                        {/* Date label */}
                        <span className="text-[10px] font-mono text-neutral-400 mt-2 truncate w-full text-center">
                          {formattedDate}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
                  <span>Métricas consolidadas en base a tiradas registradas</span>
                  <span className="text-[#15803D] font-bold">
                    Promedio diario: {Math.round((data.resumen.total_unidades / Math.max(data.tendencia_diaria.length, 1))).toLocaleString('es-CL')} UND/día
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-neutral-400">
                Selecciona un rango de fechas con tiradas activas para visualizar la curva de producción.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E5ECE6] flex flex-wrap items-center justify-between text-xs text-neutral-500">
            <span>Control de velocidad de inyección y soplado</span>
            <span className="font-semibold text-[#0D3B22]">Estándar Industrial Bioplast Chile</span>
          </div>
        </div>

        {/* Panel de Calidad & Resina Circular (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Rendimiento de Calidad / Yield */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5ECE6] shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5ECE6] mb-3">
              <span className="text-xs font-bold text-[#0D3B22] uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Control de Calidad (Yield %)</span>
              </span>
              <span className="font-mono text-xs font-black text-[#10B981]">
                {data?.resumen.tasa_liberacion || 100}%
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-neutral-600">
                <span>Lotes Liberados:</span>
                <strong className="font-mono text-[#10B981]">
                  {data?.estados.find((e) => e.nombre === 'Liberado')?.count || 0} lotes
                </strong>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>Lotes Retenidos:</span>
                <strong className="font-mono text-red-600">
                  {data?.estados.find((e) => e.nombre === 'Retenido')?.count || 0} lotes
                </strong>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>En Proceso / Tránsito:</span>
                <strong className="font-mono text-neutral-800">
                  {(data?.resumen.total_lotes || 0) - (data?.estados.find((e) => e.nombre === 'Liberado')?.count || 0) - (data?.estados.find((e) => e.nombre === 'Retenido')?.count || 0)} lotes
                </strong>
              </div>
              {/* Quality Bar */}
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-[#10B981] rounded-full"
                  style={{ width: `${data?.resumen.tasa_liberacion || 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Material Sustentable Procesado */}
          <div className="bg-gradient-to-br from-[#EEF6F0] to-[#E5ECE6]/60 p-5 rounded-2xl border border-[#15803D]/25 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#15803D]/15 mb-3">
              <span className="text-xs font-bold text-[#0D3B22] uppercase tracking-wide flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-[#15803D]" />
                <span>Material Sustentable (rPET)</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-[#15803D] uppercase">Ley REP</span>
            </div>
            <div className="mt-1">
              <div className="text-2xl font-display font-black text-[#0D3B22] tracking-tight">
                {data?.resumen.kilos_reciclados ? (data.resumen.kilos_reciclados >= 1000 ? `${(data.resumen.kilos_reciclados / 1000).toFixed(2)} Ton` : `${data.resumen.kilos_reciclados.toLocaleString('es-CL')} Kg`) : '12.4 Ton'}
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                Polímero recuperado post-consumo integrado a tiradas activas de envases.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#15803D]/15 flex items-center justify-between text-[11px] text-[#0D3B22] font-semibold">
              <span>Tasa Circular:</span>
              <span className="font-mono">{data?.resumen.tasa_rpet || 38.5}% rPET</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Bento Row: Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Col 1: Embudo de Trazabilidad por Estado (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE6] mb-5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#15803D]" />
              <h2 className="font-bold text-sm text-[#0D3B22] uppercase tracking-wide">
                Embudo Operativo por Estados de Trazabilidad
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              Distribución actual de lotes
            </span>
          </div>

          {/* Estado progress bars */}
          <div className="space-y-4">
            {data?.estados.map((est) => (
              <div key={est.uid} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: est.color }}
                    />
                    <span className="font-bold text-neutral-800">{est.nombre}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-neutral-900">{est.count} lotes</span>
                    <span className="text-neutral-400 text-[11px]">({est.percentage}%)</span>
                  </div>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${est.percentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: est.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E5ECE6] flex items-center justify-between text-xs text-neutral-500">
            <span>Trazabilidad auditada con correlativo estricto</span>
            {onNavigate && (
              <button
                onClick={() => onNavigate('produccion')}
                className="text-[#15803D] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Ver Sábana Completa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Col 2: Eficiencia por Máquina & Turno (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE6] mb-5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#15803D]" />
              <h2 className="font-bold text-sm text-[#0D3B22] uppercase tracking-wide">
                Eficiencia de Líneas & Turnos
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono">OEE Planta</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Rendimiento por Máquina Activa:
              </div>
              <div className="space-y-2">
                {data?.maquinas.map((m) => (
                  <div
                    key={m.numero}
                    className="p-2.5 rounded-xl bg-[#F7FAF7] border border-[#E5ECE6] flex items-center justify-between text-xs"
                  >
                    <div className="font-bold text-[#0D3B22]">{m.maquina}</div>
                    <div className="flex items-center gap-3 font-mono">
                      <span>{m.unidades.toLocaleString('es-CL')} UND</span>
                      <span className="text-neutral-400">·</span>
                      <span className="font-bold text-[#15803D]">{m.lotes} lotes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Distribución por Turno:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {data?.turnos.map((t) => (
                  <div
                    key={t.numero}
                    className="p-2.5 rounded-xl bg-[#EEF6F0]/60 border border-[#15803D]/20 text-xs"
                  >
                    <div className="font-bold text-[#0D3B22]">{t.turno}</div>
                    <div className="font-mono text-neutral-600 mt-0.5">
                      {t.unidades.toLocaleString('es-CL')} UND
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E5ECE6] text-xs text-neutral-400">
            Control horario de operadores en planta
          </div>
        </div>
      </div>

      {/* 4. Bottom Bento Row: Ley REP & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ley REP 20.920 Card (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE6] mb-4">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#15803D]" />
                <h2 className="font-bold text-sm text-[#0D3B22] uppercase tracking-wide">
                  Cumplimiento Ley REP 20.920
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#15803D] font-bold">D.S. 12 MMA</span>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-neutral-600 leading-relaxed">
                Bioplast Chile certifica la incorporación de material reciclado y garantiza la trazabilidad para la declaración en ventanilla única <strong>SINADER</strong>.
              </p>

              <div className="p-4 rounded-xl bg-[#EEF6F0] border border-[#15803D]/20 space-y-2">
                <div className="flex justify-between items-center font-bold text-[#0D3B22]">
                  <span>Meta de Recolección & Valorización 2026:</span>
                  <span className="font-mono">{data?.ley_rep.meta_actual_pct}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#15803D] to-[#22C55E] rounded-full"
                    style={{ width: `${Math.min(data?.ley_rep.cumplimiento_actual_pct || 38.5, 100)}%` }}
                  />
                </div>
                <div className="text-[11px] text-neutral-600 flex justify-between">
                  <span>Cumplimiento estimado:</span>
                  <strong className="text-[#15803D]">{data?.ley_rep.cumplimiento_actual_pct}%</strong>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAF7] border border-[#E5ECE6]">
                <span className="font-semibold text-neutral-700">Certificados R-CAL-07 Emitidos:</span>
                <span className="font-mono font-bold text-[#0D3B22] text-sm">
                  {data?.ley_rep.certificados_emitidos || 0}
                </span>
              </div>
            </div>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('certificados')}
              className="w-full mt-4 py-2.5 px-4 rounded-xl bg-[#0D3B22] text-white hover:bg-[#15803D] transition text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Ver Módulo de Certificados</span>
            </button>
          )}
        </div>

        {/* Real-Time Audit Activity Log Stream (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE6] mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#15803D]" />
                <h2 className="font-bold text-sm text-[#0D3B22] uppercase tracking-wide">
                  Actividad Reciente & Transiciones de Estado
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Tiempo Real</span>
              </span>
            </div>

            {/* Audit Stream List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {data?.actividad_reciente && data.actividad_reciente.length > 0 ? (
                data.actividad_reciente.map((item) => (
                  <div
                    key={item.uid}
                    className="p-3 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7] hover:bg-white transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.estado_color }}
                      />
                      <div>
                        <div className="font-bold text-[#0F1F16]">
                          {item.articulo} · Lote #{item.lote}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Tirada #{item.codigo_interno} · Por <strong className="text-neutral-700">{item.responsable}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white inline-block"
                        style={{ backgroundColor: item.estado_color }}
                      >
                        {item.estado_nuevo}
                      </span>
                      <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                        {new Date(item.fecha_hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400">
                  No hay transiciones recientes registradas en planta.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E5ECE6] text-[11px] text-neutral-400 font-mono flex justify-between">
            <span>Auditoría inmutable persistida en AWS RDS</span>
            <span>Seguridad de cadena de custodia</span>
          </div>
        </div>
      </div>
    </div>
  );
};
