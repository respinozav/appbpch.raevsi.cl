import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api, DashboardMetricsData } from '../api/client';
import { 
  Factory, Award, Leaf, Layers, ArrowUpRight, 
  RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, 
  Sliders, History, Clock, ArrowRight, TrendingUp, Calendar,
  PieChart, Download
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
  const [donutHoverIndex, setDonutHoverIndex] = useState<number | null>(null);
  const [donutViewMode, setDonutViewMode] = useState<'turnos' | 'maquinas'>('turnos');
  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await api.listBatches({
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
        limit: 1000,
      });

      const batches = res.items || [];
      const rows: string[][] = [
        [
          "Código Tirada",
          "Fecha",
          "Lote Inicio",
          "Lote Fin",
          "Total Lotes",
          "Artículo",
          "Material",
          "Color Bidón",
          "Color Asa",
          "Máquina",
          "Turno",
          "Operador",
          "Cantidad Unitaria",
          "Total Unidades",
          "Estado Trazabilidad",
        ],
      ];

      if (batches.length > 0) {
        batches.forEach((b: any) => {
          if (
            materialFilter !== 'all' &&
            b.material &&
            !b.material.toLowerCase().includes(materialFilter.toLowerCase())
          ) {
            return;
          }

          const fechaStr = b.fecha ? new Date(b.fecha).toLocaleDateString('es-CL') : 'N/A';
          rows.push([
            String(b.codigo_interno || ''),
            fechaStr,
            String(b.lote_inicio || ''),
            String(b.lote_fin || ''),
            String(b.total_lotes || ''),
            `"${(b.articulo || '').replace(/"/g, '""')}"`,
            `"${(b.material || '').replace(/"/g, '""')}"`,
            `"${(b.color_bidon || '').replace(/"/g, '""')}"`,
            `"${(b.color_asa || '').replace(/"/g, '""')}"`,
            String(b.numero_maquina || ''),
            String(b.turno || ''),
            String(b.operador || ''),
            String(b.cantidad_unitaria || ''),
            String((b.cantidad_unitaria || 0) * (b.total_lotes || 0)),
            `"${(b.estado?.nombre || 'Producción').replace(/"/g, '""')}"`,
          ]);
        });
      } else if (data?.tendencia_diaria) {
        rows.length = 0;
        rows.push(["Fecha", "Unidades Producidas", "Lotes", "Meta Operativa", "Cumplimiento %"]);
        data.tendencia_diaria.forEach((td) => {
          rows.push([
            td.fecha,
            String(td.unidades),
            String(td.lotes),
            String(td.meta),
            `${td.cumplimiento_pct}%`,
          ]);
        });
      }

      const csvContent = "\uFEFF" + rows.map((r) => r.join(";")).join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateTag = new Date().toISOString().split("T")[0];
      link.setAttribute("href", url);
      link.setAttribute("download", `reporte_produccion_bioplast_${dateTag}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error al exportar datos:", err);
      alert("No fue posible exportar los datos. Por favor reintente.");
    } finally {
      setExporting(false);
    }
  };

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

  // Métricas calculadas para Bento Header
  const totalLotes = data?.resumen.total_lotes || 0;
  const liberadosCount = data?.estados.find((e) => e.nombre === 'Liberado')?.count || 0;
  const retenidosCount = data?.estados.find((e) => e.nombre === 'Retenido')?.count || 0;
  const enProcesoCount = (data?.estados || [])
    .filter((e) => ['Producción', 'Almacenaje', 'Despacho'].includes(e.nombre))
    .reduce((acc, curr) => acc + curr.count, 0);

  const liberadosPct = totalLotes > 0 ? ((liberadosCount / totalLotes) * 100).toFixed(1) : '100';
  const enProcesoPct = totalLotes > 0 ? ((enProcesoCount / totalLotes) * 100).toFixed(1) : '0';
  const retenidosPct = totalLotes > 0 ? ((retenidosCount / totalLotes) * 100).toFixed(1) : '0';

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

          {/* Export button */}
          <button
            onClick={handleExportData}
            disabled={exporting || loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-[#15803D]/30 bg-[#EEF6F0] text-[#0D3B22] hover:bg-[#15803D] hover:text-white transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Exportar lotes del período a CSV / Excel"
          >
            <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-bounce' : ''}`} />
            <span>{exporting ? 'Exportando...' : 'Exportar Lotes'}</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={fetchMetrics}
            className="p-2 text-neutral-600 hover:text-[#0D3B22] hover:bg-[#EEF6F0] rounded-xl border border-[#E5ECE6] transition cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Bento Row: 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Producción Acumulada */}
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
              <span className="font-mono font-bold text-[#15803D]">{totalLotes}</span> lotes emitidos en <span className="font-mono font-bold">{data?.resumen.distinct_batches || 0}</span> tiradas
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5ECE6] flex items-center justify-between text-[11px] text-[#15803D] font-semibold">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Operación continua</span>
            </span>
            <span className="text-neutral-400 font-normal font-mono">100% Auditado</span>
          </div>
        </motion.div>

        {/* KPI 2: Lotes Liberados */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Lotes Liberados</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-black text-[#0D3B22] tracking-tight flex items-baseline gap-2">
              <span>{liberadosCount}</span>
              <span className="text-sm font-normal text-neutral-400">LOTES</span>
              <span className="text-xs font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 ml-auto">
                {liberadosPct}%
              </span>
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Aprobación Calidad Ficha F-0101
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5ECE6] flex items-center justify-between text-[11px] text-neutral-500">
            <span className="text-[#15803D] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certificables</span>
            </span>
            <span className="font-mono font-bold text-[#0D3B22]">R-CAL-07</span>
          </div>
        </motion.div>

        {/* KPI 3: En Proceso / Tránsito */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>En Proceso / Tránsito</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-black text-[#0D3B22] tracking-tight flex items-baseline gap-2">
              <span>{enProcesoCount}</span>
              <span className="text-sm font-normal text-neutral-400">LOTES</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 ml-auto">
                {enProcesoPct}%
              </span>
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Producción, Almacenaje y Despacho
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5ECE6] flex items-center justify-between text-[11px] text-neutral-500">
            <span className="text-blue-700 font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Flujo logístico activo</span>
            </span>
            <span className="font-mono text-neutral-400 font-normal">En Planta</span>
          </div>
        </motion.div>

        {/* KPI 4: Lotes Retenidos (Tipo Advertencia) */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-red-50/70 via-white to-amber-50/30 p-5 rounded-2xl border border-red-200/90 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-red-800 text-xs font-semibold">
            <span className="flex items-center gap-1.5 font-bold">
              <span>Lotes Retenidos</span>
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-black text-red-700 tracking-tight flex items-baseline gap-2">
              <span>{retenidosCount}</span>
              <span className="text-sm font-normal text-red-400">LOTES</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ml-auto ${
                  retenidosCount > 0
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                }`}
              >
                {retenidosCount > 0 ? `${retenidosPct}%` : '0%'}
              </span>
            </div>
            <div className="text-xs text-red-600/90 mt-1 font-medium">
              Requiere Disposición / Calidad
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-red-200/60 flex items-center justify-between text-[11px] text-red-700 font-semibold">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>Bloqueo preventivo</span>
            </span>
            <span className="font-mono text-red-600 font-medium">No certificables</span>
          </div>
        </motion.div>
      </div>

      {/* 2.5 Gráfico de Evolución de Producción Diaria vs Meta de Planta (Full Width) */}
      <div className="w-full bg-white p-6 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between">
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
            (() => {
              const tendencia = data.tendencia_diaria;
              const maxUnits = Math.max(...tendencia.map((x) => x.unidades), 0);
              const metaVal = tendencia[0]?.meta || 30000;
              const chartMax = Math.max(maxUnits, metaVal * 1.15, 1000);
              const metaHeightPct = Math.min(Math.round((metaVal / chartMax) * 100), 92);
              const totalPeriodUnits = tendencia.reduce((acc, curr) => acc + curr.unidades, 0);
              const activeDays = tendencia.filter((x) => x.unidades > 0).length;
              const dailyAvg = activeDays > 0 ? Math.round(totalPeriodUnits / activeDays) : 0;

              return (
                <div className="space-y-4 pt-2">
                  <div className="relative h-52 border-b border-[#E5ECE6] pt-8 pb-1 px-1">
                    {/* Línea horizontal continua unificada de Meta de Planta */}
                    <div
                      className="absolute left-0 right-0 border-t-2 border-dashed border-[#15803D]/50 pointer-events-none z-10 flex items-center justify-end pr-2"
                      style={{ bottom: `${metaHeightPct}%` }}
                    >
                      <span className="text-[10px] font-mono font-bold text-[#15803D] bg-white/95 px-2.5 py-0.5 rounded-full border border-[#15803D]/30 shadow-2xs -translate-y-1/2">
                        Meta: {metaVal.toLocaleString('es-CL')} UND/día
                      </span>
                    </div>

                    {/* SVG Poligonal fino y elegante que traza la trayectoria continua (sube y baja) siguiendo las barras */}
                    {tendencia.length > 1 && (
                      <div className="absolute inset-x-0 top-8 bottom-7 pointer-events-none z-10 overflow-hidden">
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 1000 100"
                          preserveAspectRatio="none"
                        >
                          <polyline
                            fill="none"
                            stroke="#0D3B22"
                            strokeWidth="1.2"
                            strokeOpacity="0.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                            points={tendencia
                              .map((td, idx) => {
                                const total = tendencia.length;
                                // Centro horizontal porcentual exacto de cada columna
                                const x = ((idx + 0.5) / total) * 1000;
                                const heightPct = Math.round((td.unidades / chartMax) * 100);
                                const y = 100 - Math.max(heightPct, td.unidades > 0 ? 10 : 2);
                                return `${x.toFixed(1)},${y.toFixed(1)}`;
                              })
                              .join(' ')}
                          />
                          {tendencia.map((td, idx) => {
                            if (td.unidades === 0) return null;
                            const total = tendencia.length;
                            const x = ((idx + 0.5) / total) * 1000;
                            const heightPct = Math.round((td.unidades / chartMax) * 100);
                            const y = 100 - Math.max(heightPct, 10);
                            return (
                              <circle
                                key={`pt-${idx}`}
                                cx={x}
                                cy={y}
                                r="1.5"
                                fill="#FFFFFF"
                                stroke="#0D3B22"
                                strokeWidth="1"
                                vectorEffect="non-scaling-stroke"
                              />
                            );
                          })}
                        </svg>
                      </div>
                    )}

                    {/* Contenedor flexible de barras diarias */}
                    <div className="flex items-end gap-1.5 sm:gap-2.5 h-full w-full relative z-20">
                      {tendencia.map((td, idx) => {
                        const heightPct = Math.round((td.unidades / chartMax) * 100);
                        const isOverMeta = td.unidades >= td.meta;
                        const hasProduction = td.unidades > 0;
                        const [y, m, d] = td.fecha.split('-');
                        const formattedDate = `${d}/${m}/${y}`;

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative select-none">
                            {/* Tooltip on hover */}
                            <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[#0D3B22] text-white text-[10px] font-mono p-2.5 rounded-xl shadow-xl z-30 whitespace-nowrap border border-white/10">
                              <div className="font-bold border-b border-white/20 pb-1 mb-1">{formattedDate}</div>
                              <div className="flex items-center gap-2">
                                <span>Real: <strong>{td.unidades.toLocaleString('es-CL')}</strong> UND</span>
                                <span className={isOverMeta ? 'text-emerald-300 font-bold' : 'text-neutral-300'}>
                                  ({td.cumplimiento_pct}%)
                                </span>
                              </div>
                              <div className="text-[9px] text-neutral-300 mt-0.5">
                                Tiradas: {td.lotes} lotes · Meta: {td.meta.toLocaleString('es-CL')} UND
                              </div>
                            </div>

                            {/* Indicador numérico sobre barras activas */}
                            {hasProduction && (
                              <span className="text-[9px] font-mono font-bold text-[#0D3B22] mb-1 truncate max-w-full">
                                {td.unidades >= 1000 ? `${Math.round(td.unidades / 1000)}k` : td.unidades}
                              </span>
                            )}

                            {/* Barra con altura CSS fluida */}
                            <div
                              style={{ height: hasProduction ? `${Math.max(heightPct, 10)}%` : '6px' }}
                              className={`w-full max-w-[54px] rounded-t-lg transition-all duration-500 ease-out cursor-pointer ${
                                !hasProduction
                                  ? 'bg-neutral-200/70 hover:bg-neutral-300'
                                  : isOverMeta
                                  ? 'bg-gradient-to-t from-[#15803D] to-[#22C55E] hover:brightness-110 shadow-xs'
                                  : 'bg-gradient-to-t from-[#0D3B22] to-[#15803D] hover:brightness-110 shadow-xs'
                              }`}
                            />

                            {/* Etiqueta de fecha completa DD/MM/AAAA */}
                            <span className={`text-[9px] sm:text-[10px] font-mono mt-2 truncate w-full text-center ${hasProduction ? 'font-bold text-[#0D3B22]' : 'text-neutral-400'}`}>
                              {formattedDate}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-neutral-500 font-mono gap-2 pt-1">
                    <span>
                      Días activos: <strong className="text-[#0D3B22]">{activeDays}</strong> de {data.tendencia_diaria.length} días
                    </span>
                    <span className="text-[#15803D] font-bold">
                      Promedio diario activo: {dailyAvg.toLocaleString('es-CL')} UND/día
                    </span>
                  </div>
                </div>
              );
            })()
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

      {/* 3. Lower Bento Row: Dual Symmetric Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Columna Izquierda (7 cols): Distribución por Estados + Actividad Reciente */}
        <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
          {/* Card A: Gráfico de Barras de Trazabilidad por Estado */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between flex-1">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5ECE6] gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#15803D]" />
                  <h2 className="font-bold text-sm text-[#0D3B22] uppercase tracking-wide">
                    Distribución por Estados de Trazabilidad
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-full bg-[#EEF6F0] text-[#15803D] border border-[#15803D]/20">
                    {totalLotes} Lotes Totales
                  </span>
                </div>
              </div>

              {/* Vertical Bar Chart */}
              {data?.estados && data.estados.length > 0 ? (
                (() => {
                  const maxStateCount = Math.max(...data.estados.map((e) => e.count), 1);
                  
                  const stateGradients: Record<string, { bar: string; badge: string; text: string }> = {
                    'Producción': {
                      bar: 'from-[#15803D] via-[#16A34A] to-[#22C55E]',
                      badge: 'bg-emerald-50 text-[#15803D] border-[#15803D]/30',
                      text: 'text-[#15803D]'
                    },
                    'Almacenaje': {
                      bar: 'from-[#1D4ED8] via-[#2563EB] to-[#60A5FA]',
                      badge: 'bg-blue-50 text-blue-700 border-blue-200',
                      text: 'text-blue-700'
                    },
                    'Despacho': {
                      bar: 'from-[#6D28D9] via-[#7C3AED] to-[#A78BFA]',
                      badge: 'bg-purple-50 text-purple-700 border-purple-200',
                      text: 'text-purple-700'
                    },
                    'Liberado': {
                      bar: 'from-[#047857] via-[#059669] to-[#34D399]',
                      badge: 'bg-teal-50 text-teal-700 border-teal-200',
                      text: 'text-teal-700'
                    },
                    'Retenido': {
                      bar: 'from-[#B91C1C] via-[#DC2626] to-[#F87171]',
                      badge: 'bg-red-50 text-red-700 border-red-200',
                      text: 'text-red-700'
                    },
                  };

                  return (
                    <div className="space-y-3 pt-2">
                      {/* Área gráfica de barras con línea base inferior */}
                      <div className="h-40 flex items-end justify-between gap-2 sm:gap-4 px-2 pt-6 pb-1 border-b border-[#E5ECE6]">
                        {data.estados.map((est, idx) => {
                          // Máximo 78% para que el badge superior descanse holgadamente dentro del área de la barra
                          const heightPct = Math.round((est.count / maxStateCount) * 78);
                          const hasLots = est.count > 0;
                          const colors = stateGradients[est.nombre] || {
                            bar: 'from-[#15803D] to-[#22C55E]',
                            badge: 'bg-emerald-50 text-[#15803D] border-emerald-200',
                            text: 'text-[#15803D]'
                          };

                          return (
                            <div
                              key={est.uid || idx}
                              className="flex-1 flex flex-col items-center h-full justify-end group relative select-none"
                            >
                              {/* Floating Tooltip */}
                              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[#0D3B22] text-white text-[10px] font-mono p-2 rounded-xl shadow-xl z-30 whitespace-nowrap border border-white/10 text-center">
                                <div className="font-bold">{est.nombre}</div>
                                <div className="text-emerald-300 font-bold">{est.count} lotes ({est.percentage}%)</div>
                              </div>

                              {/* Lot Count Pill Badge */}
                              <span
                                className={`text-[10px] font-mono font-black mb-1.5 px-2 py-0.5 rounded-full border shadow-2xs transition-transform group-hover:scale-105 shrink-0 ${
                                  hasLots ? colors.badge : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                                }`}
                              >
                                {est.count}
                              </span>

                              {/* Vertical Bar */}
                              <div
                                style={{ height: hasLots ? `${Math.max(heightPct, 12)}%` : '6px' }}
                                className={`w-full max-w-[50px] rounded-t-xl transition-all duration-500 ease-out shadow-xs cursor-pointer shrink-0 ${
                                  hasLots
                                    ? `bg-gradient-to-t ${colors.bar} hover:brightness-110 shadow-sm`
                                    : 'bg-neutral-200/80 hover:bg-neutral-300'
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Etiquetas inferiores: Porcentaje y Nombre del Estado completamente visibles debajo de la línea base */}
                      <div className="flex items-start justify-between gap-2 sm:gap-4 px-2 pt-1">
                        {data.estados.map((est, idx) => {
                          const hasLots = est.count > 0;
                          const colors = stateGradients[est.nombre] || {
                            text: 'text-[#15803D]'
                          };

                          return (
                            <div key={est.uid || idx} className="flex-1 flex flex-col items-center text-center">
                              <span className="text-[11px] font-mono font-bold text-neutral-600">
                                {est.percentage}%
                              </span>
                              <span
                                className={`text-[11px] sm:text-xs font-bold mt-0.5 leading-tight ${
                                  hasLots ? colors.text : 'text-neutral-400'
                                }`}
                              >
                                {est.nombre}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Subtítulo de flujo secuencial */}
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono px-1 pt-1">
                        <span>Flujo: Producción ➔ Almacén ➔ Despacho ➔ Liberado</span>
                        <span className="text-[#15803D] font-bold">100% Trazable</span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400">
                  No hay lotes registrados para los filtros actuales.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5ECE6] flex items-center justify-between text-xs text-neutral-500">
              <span>Trazabilidad auditada con correlativo estricto</span>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('produccion')}
                  className="text-[#15803D] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver Sábana Completa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Card B: Actividad Reciente & Transiciones de Estado */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE6] mb-3">
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
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {data?.actividad_reciente && data.actividad_reciente.length > 0 ? (
                  data.actividad_reciente.map((item) => (
                    <div
                      key={item.uid}
                      className="p-2.5 rounded-xl border border-[#E5ECE6] bg-[#F7FAF7] hover:bg-white transition flex items-center justify-between gap-3 text-xs"
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
              <span>Cadena de custodia</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha (5 cols): Eficiencia de Líneas & Turnos (Donut Chart) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5ECE6] shadow-sm flex flex-col justify-between h-full">
          <div>
            {/* Header with Title and Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5ECE6] gap-2 mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#15803D]" />
                <h2 className="font-bold text-sm text-[#0D3B22] uppercase tracking-wide">
                  Eficiencia de Líneas & Turnos
                </h2>
              </div>
              
              {/* Toggle: Turnos vs Máquinas */}
              <div className="inline-flex items-center p-0.5 rounded-xl bg-[#F7FAF7] border border-[#E5ECE6] text-[11px] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setDonutViewMode('turnos');
                    setDonutHoverIndex(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    donutViewMode === 'turnos'
                      ? 'bg-white text-[#0D3B22] shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Turnos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDonutViewMode('maquinas');
                    setDonutHoverIndex(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    donutViewMode === 'maquinas'
                      ? 'bg-white text-[#0D3B22] shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Máquinas
                </button>
              </div>
            </div>

            {/* Donut Chart Visualizer */}
            {(() => {
              const colorPalettes = [
                {
                  id: 'c1',
                  stroke: '#15803D',
                  grad: 'from-[#15803D] to-[#22C55E]',
                  badge: 'bg-emerald-50 text-[#15803D] border-emerald-200',
                  dot: 'bg-[#15803D]',
                  fill: '#15803D'
                },
                {
                  id: 'c2',
                  stroke: '#1D4ED8',
                  grad: 'from-[#1D4ED8] to-[#3B82F6]',
                  badge: 'bg-blue-50 text-blue-700 border-blue-200',
                  dot: 'bg-[#1D4ED8]',
                  fill: '#1D4ED8'
                },
                {
                  id: 'c3',
                  stroke: '#7C3AED',
                  grad: 'from-[#7C3AED] to-[#A78BFA]',
                  badge: 'bg-purple-50 text-purple-700 border-purple-200',
                  dot: 'bg-[#7C3AED]',
                  fill: '#7C3AED'
                },
                {
                  id: 'c4',
                  stroke: '#D97706',
                  grad: 'from-[#D97706] to-[#F59E0B]',
                  badge: 'bg-amber-50 text-amber-700 border-amber-200',
                  dot: 'bg-[#D97706]',
                  fill: '#D97706'
                }
              ];

              const rawList = donutViewMode === 'turnos'
                ? (data?.turnos || []).map((t, idx) => ({
                    label: t.turno,
                    subtitle: `Jornada ${idx === 0 ? 'Mañana' : idx === 1 ? 'Tarde' : 'Noche'}`,
                    unidades: t.unidades,
                    lotes: t.lotes,
                    color: colorPalettes[idx % colorPalettes.length]
                  }))
                : (data?.maquinas || []).map((m, idx) => ({
                    label: m.maquina,
                    subtitle: `Línea de Soplado #${m.numero}`,
                    unidades: m.unidades,
                    lotes: m.lotes,
                    color: colorPalettes[idx % colorPalettes.length]
                  }));

              const totalDonutUnits = rawList.reduce((acc, it) => acc + it.unidades, 0);
              const totalDonutLotes = rawList.reduce((acc, it) => acc + it.lotes, 0);

              const radius = 76;
              const circumference = 2 * Math.PI * radius; // ~477.52
              let accumulatedLength = 0;

              const activeHovered = donutHoverIndex !== null ? rawList[donutHoverIndex] : null;

              return (
                <div>
                  {totalDonutUnits === 0 ? (
                    <div className="py-12 text-center text-xs text-neutral-400">
                      Sin registros de producción en el rango seleccionado.
                    </div>
                  ) : (
                    <>
                      {/* Donut Chart with Center KPI */}
                      <div className="relative flex items-center justify-center my-3">
                        <svg
                          viewBox="0 0 220 220"
                          className="w-48 h-48 sm:w-52 sm:h-52 -rotate-90 transform"
                        >
                          <circle
                            cx="110"
                            cy="110"
                            r={radius}
                            fill="transparent"
                            stroke="#F0F4F1"
                            strokeWidth="20"
                          />

                          {rawList.map((item, idx) => {
                            const pct = totalDonutUnits > 0 ? item.unidades / totalDonutUnits : 0;
                            const segmentLength = pct * circumference;
                            const strokeDasharray = `${Math.max(segmentLength - 3, 0)} ${circumference}`;
                            const strokeDashoffset = -accumulatedLength;
                            accumulatedLength += segmentLength;

                            const isHovered = donutHoverIndex === idx;

                            return (
                              <circle
                                key={idx}
                                cx="110"
                                cy="110"
                                r={radius}
                                fill="transparent"
                                stroke={item.color.stroke}
                                strokeWidth={isHovered ? 26 : 20}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="cursor-pointer transition-all duration-300 ease-out"
                                style={{
                                  opacity: donutHoverIndex === null || isHovered ? 1 : 0.45,
                                  filter: isHovered ? 'drop-shadow(0px 2px 8px rgba(0,0,0,0.18))' : 'none'
                                }}
                                onMouseEnter={() => setDonutHoverIndex(idx)}
                                onMouseLeave={() => setDonutHoverIndex(null)}
                              />
                            );
                          })}
                        </svg>

                        {/* Interactive Center Box */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none px-4">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest line-clamp-1">
                            {activeHovered ? activeHovered.label : 'Volumen Total'}
                          </span>
                          <span className="text-xl sm:text-2xl font-display font-extrabold text-[#0D3B22] leading-tight mt-0.5">
                            {activeHovered
                              ? activeHovered.unidades.toLocaleString('es-CL')
                              : totalDonutUnits.toLocaleString('es-CL')}
                          </span>
                          <span className="text-[10px] font-mono font-bold mt-1 px-2.5 py-0.5 rounded-full border shadow-2xs inline-block transition-all">
                            {activeHovered ? (
                              <span className="text-[#15803D]">
                                {((activeHovered.unidades / totalDonutUnits) * 100).toFixed(1)}% · {activeHovered.lotes} lotes
                              </span>
                            ) : (
                              <span className="text-neutral-600 bg-neutral-100 border-neutral-200">
                                {totalDonutLotes} Lotes en Planta
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Legend List */}
                      <div className="space-y-2 mt-4 pt-3 border-t border-[#E5ECE6]">
                        {rawList.map((item, idx) => {
                          const pct = totalDonutUnits > 0 ? (item.unidades / totalDonutUnits) * 100 : 0;
                          const isHovered = donutHoverIndex === idx;

                          return (
                            <div
                              key={idx}
                              onMouseEnter={() => setDonutHoverIndex(idx)}
                              onMouseLeave={() => setDonutHoverIndex(null)}
                              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between text-xs ${
                                isHovered
                                  ? 'bg-[#EEF6F0] border-[#15803D]/40 shadow-xs scale-[1.01]'
                                  : 'bg-[#F7FAF7] border-[#E5ECE6] hover:bg-neutral-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                                  style={{ backgroundColor: item.color.stroke }}
                                />
                                <div>
                                  <div className="font-bold text-[#0D3B22] leading-tight">
                                    {item.label}
                                  </div>
                                  <div className="text-[10px] text-neutral-400">
                                    {item.subtitle}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 font-mono text-right">
                                <div>
                                  <div className="font-bold text-neutral-800">
                                    {item.unidades.toLocaleString('es-CL')} UND
                                  </div>
                                  <div className="text-[10px] text-neutral-400">
                                    {item.lotes} lotes
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${item.color.badge}`}>
                                  {pct.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Footer note */}
          <div className="mt-5 pt-3 border-t border-[#E5ECE6] text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Control horario de operadores en planta</span>
            <span className="font-mono text-[#15803D] font-bold">OEE Óptimo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
