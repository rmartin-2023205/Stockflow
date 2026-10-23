import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Coins,
  Receipt,
  Calendar,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trophy,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/format';

export default function ReportsView() {
  const { organization, role } = useAuth();
  const currency = organization?.currency || 'GTQ';
  const isOwner = role === 'OWNER';

  const [period, setPeriod] = useState('7days'); // today, 7days, 30days, month
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    if (!isOwner) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getReports({ period });
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Error al obtener reporte financiero.');
    } finally {
      setLoading(false);
    }
  }, [period, isOwner]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (!isOwner) {
    return (
      <div className="p-16 rounded-2xl bg-[#0D1017] border border-[#1A212F] text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-base font-bold text-white">Acceso Restringido a Propietarios</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Los reportes financieros consolidados y análisis de márgenes de ganancia solo están disponibles para el rol de Propietario.
        </p>
      </div>
    );
  }

  const { metrics, topProducts = [], paymentMethods = [], dailyTrend = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#161B26]">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Reportes y Analíticas Financieras</span>
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Rentabilidad Real
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Análisis de ingresos brutos, costos de mercancía vendida, márgenes y ranking de ventas.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center bg-[#0D1017] border border-[#1E2536] rounded-xl p-1 self-start sm:self-auto">
          {[
            { label: 'Hoy', value: 'today' },
            { label: '7 Días', value: '7days' },
            { label: '30 Días', value: '30days' },
            { label: 'Este Mes', value: 'month' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setPeriod(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                period === tab.value
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs font-mono">Consolidando métricas financieras...</span>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-[#0D1017] border border-red-500/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-xs text-red-300">{error}</p>
          <button
            onClick={fetchReport}
            className="px-3.5 py-1.5 rounded-xl bg-[#141A24] border border-[#232B3A] text-xs text-white hover:bg-[#1B2332] cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 4 Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Revenue */}
            <div className="p-5 rounded-2xl bg-[#0D1017] border border-[#1A212F] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Ingresos Totales</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-white tracking-tight">
                  {formatCurrency(metrics?.totalRevenue || 0, currency)}
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                  {metrics?.totalSalesCount || 0} transacciones completadas
                </span>
              </div>
            </div>

            {/* 2. Cost of Goods Sold */}
            <div className="p-5 rounded-2xl bg-[#0D1017] border border-[#1A212F] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Costo de Mercancía</span>
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-sky-300 tracking-tight">
                  {formatCurrency(metrics?.totalCostOfGoods || 0, currency)}
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                  Costo de reposición según snapshots
                </span>
              </div>
            </div>

            {/* 3. Gross Profit & Margin % */}
            <div className="p-5 rounded-2xl bg-[#0D1017] border border-[#1A212F] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Ganancia Bruta</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  {metrics?.profitMarginPercentage || 0}% margen
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                  {formatCurrency(metrics?.grossProfit || 0, currency)}
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                  Utilidad libre tras descontar costo
                </span>
              </div>
            </div>

            {/* 4. Average Ticket */}
            <div className="p-5 rounded-2xl bg-[#0D1017] border border-[#1A212F] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Ticket Promedio</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-purple-300 tracking-tight">
                  {formatCurrency(metrics?.averageTicket || 0, currency)}
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                  Gasto medio por cliente atendido
                </span>
              </div>
            </div>
          </div>

          {/* Grid: Top 5 Products & Payment Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Top 5 Products (Col 7) */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0D1017] border border-[#1A212F] space-y-4">
              <div className="flex items-center justify-between border-b border-[#161B26] pb-3">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Top 5 Artículos Más Vendidos
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Ordenado por unidades
                </span>
              </div>

              {topProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No hay ventas registradas en este período.
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, index) => {
                    const maxUnits = topProducts[0]?.unitsSold || 1;
                    const percentage = Math.round((p.unitsSold / maxUnits) * 100);

                    return (
                      <div key={p.productId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2 truncate">
                            <span className="font-mono text-[11px] font-bold text-slate-500 w-4">
                              #{index + 1}
                            </span>
                            <span className="font-mono text-emerald-400 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10">
                              {p.sku}
                            </span>
                            <span className="text-white font-medium truncate">{p.name}</span>
                          </div>

                          <div className="text-right font-mono shrink-0">
                            <span className="text-white font-bold">{p.unitsSold} uds</span>
                            <span className="text-slate-500 text-[10px] ml-2">
                              ({formatCurrency(p.totalRevenue, currency)})
                            </span>
                          </div>
                        </div>

                        {/* Relative Progress Bar */}
                        <div className="w-full bg-[#161C28] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Methods Breakdown (Col 5) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0D1017] border border-[#1A212F] space-y-4">
              <div className="flex items-center justify-between border-b border-[#161B26] pb-3">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Desglose por Forma de Pago
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {metrics?.totalSalesCount || 0} pagos
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {paymentMethods.map((pm) => {
                  const sharePercentage =
                    metrics?.totalRevenue > 0
                      ? Math.round((pm.total / metrics.totalRevenue) * 100)
                      : 0;

                  return (
                    <div
                      key={pm.method}
                      className="p-3 rounded-xl bg-[#121622] border border-[#1E2536] flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#181F2E] flex items-center justify-center text-slate-300">
                          {pm.method === 'CASH' ? (
                            <Banknote className="w-4 h-4 text-emerald-400" />
                          ) : pm.method === 'CARD' ? (
                            <CreditCard className="w-4 h-4 text-sky-400" />
                          ) : (
                            <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{pm.label}</p>
                          <span className="text-[10px] font-mono text-slate-500">
                            {pm.count} transacciones ({sharePercentage}%)
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-white">
                        {formatCurrency(pm.total, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Cancellation alerts if any */}
              {metrics?.cancelledSalesCount > 0 && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center justify-between">
                  <span>Ventas Anuladas en período:</span>
                  <span className="font-mono font-bold text-red-400">
                    {metrics.cancelledSalesCount} ({formatCurrency(metrics.cancelledRevenue, currency)})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
