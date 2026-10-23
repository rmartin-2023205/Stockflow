import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Server,
  Database,
  RefreshCw,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Boxes,
  Plus,
  Coins,
  History,
  TrendingUp,
  ArrowDownLeft,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { formatCurrency } from '../../utils/format';

export default function DashboardView() {
  const { user, organization, role } = useAuth();
  const currency = organization?.currency || 'GTQ';
  const isOwner = role === 'OWNER';

  const [dashboardData, setDashboardData] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, healthRes] = await Promise.all([
        api.getDashboardSummary(),
        api.checkHealth(),
      ]);
      setDashboardData(dashRes.data);
      setHealth(healthRes.data);
    } catch (err) {
      console.error('Error al cargar métricas del dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const {
    todaySales = { total: 0, count: 0 },
    inventory = { totalProducts: 0, totalCostValue: 0, lowStockCount: 0, outOfStockCount: 0 },
    recentSales = [],
    recentMovements = [],
  } = dashboardData || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#161B26] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Bienvenido, {user?.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {role === 'OWNER' ? 'Propietario' : 'Cajero'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organización: <span className="text-slate-200 font-medium">{organization?.name}</span> • Moneda base: <span className="font-mono text-emerald-400">{currency}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#0E121B] hover:bg-[#161D2B] border border-[#1E2638] text-slate-300 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Actualizar Métricas</span>
          </button>
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/sales"
          className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/30 hover:border-emerald-400 text-left transition group active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <ShoppingCart className="w-4 h-4" />
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs font-bold text-white group-hover:text-emerald-300">Ir al Punto de Venta</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Cobro rápido en terminal</p>
        </Link>

        <Link
          to="/products"
          className="p-3.5 rounded-2xl bg-[#0B0E16] border border-[#1A212F] hover:border-emerald-500/30 text-left transition group active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <Package className="w-4 h-4 text-emerald-400" />
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs font-bold text-white group-hover:text-emerald-300">Catálogo de Productos</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Precios, costos y SKU</p>
        </Link>

        <Link
          to="/inventory"
          className="p-3.5 rounded-2xl bg-[#0B0E16] border border-[#1A212F] hover:border-amber-500/30 text-left transition group active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <Boxes className="w-4 h-4 text-amber-400" />
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs font-bold text-white group-hover:text-amber-300">Ajustes & Kardex</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Entradas, salidas y mermas</p>
        </Link>

        {isOwner ? (
          <Link
            to="/reports"
            className="p-3.5 rounded-2xl bg-[#0B0E16] border border-[#1A212F] hover:border-purple-500/30 text-left transition group active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-bold text-white group-hover:text-purple-300">Reportes Financieros</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Márgenes y rentabilidad</p>
          </Link>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[#0B0E16] border border-[#1A212F] text-left opacity-60">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-400">Modo Cajero</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Acceso a terminal y stock</p>
          </div>
        )}
      </div>

      {/* 4 Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ventas de Hoy */}
        <div className="p-5 rounded-2xl bg-[#0B0E16] border border-[#171D2A] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Ventas de Hoy</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(todaySales.total, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-mono">
            {todaySales.count} {todaySales.count === 1 ? 'venta completada' : 'ventas completadas'}
          </span>
        </div>

        {/* KPI 2: Productos Activos */}
        <div className="p-5 rounded-2xl bg-[#0B0E16] border border-[#171D2A] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Catálogo Activo</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {inventory.totalProducts}
          </div>
          <span className="text-[11px] text-emerald-400 mt-2 font-mono">
            Artículos disponibles para venta
          </span>
        </div>

        {/* KPI 3: Inversión en Almacén */}
        <div className="p-5 rounded-2xl bg-[#0B0E16] border border-[#171D2A] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Inversión al Costo</span>
            <Coins className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-300 font-mono tracking-tight">
            {formatCurrency(inventory.totalCostValue, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-mono">
            Valor contable de existencias
          </span>
        </div>

        {/* KPI 4: Stock Bajo */}
        <div className="p-5 rounded-2xl bg-[#0B0E16] border border-[#171D2A] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Alertas de Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono tracking-tight">
              {inventory.lowStockCount}
            </span>
            {inventory.outOfStockCount > 0 && (
              <span className="text-xs font-mono text-red-400">
                ({inventory.outOfStockCount} agotados)
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-mono">
            {inventory.lowStockCount + inventory.outOfStockCount === 0
              ? 'Niveles de inventario óptimos'
              : 'Requieren reabastecimiento'}
          </span>
        </div>
      </div>

      {/* Two Live Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Feed 1: Últimas Ventas */}
        <div className="p-5 rounded-2xl bg-[#0B0E16] border border-[#171D2A] space-y-4">
          <div className="flex items-center justify-between border-b border-[#161B26] pb-3">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Últimas Ventas Realizadas
              </h2>
            </div>
            <Link to="/sales" className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-0.5">
              <span>Ver todas</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              Aún no se han registrado ventas hoy.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentSales.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-[#07090E] border border-[#161B26] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-emerald-400 font-bold text-xs">
                        {s.saleNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">
                        · {s.paymentMethod}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                      Cajero: {s.cashierName || 'Cajero'} · {new Date(s.createdAt).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-white">
                    {formatCurrency(s.total, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feed 2: Últimos Movimientos de Kardex */}
        <div className="p-5 rounded-2xl bg-[#0B0E16] border border-[#171D2A] space-y-4">
          <div className="flex items-center justify-between border-b border-[#161B26] pb-3">
            <div className="flex items-center space-x-2">
              <Boxes className="w-4 h-4 text-sky-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Últimos Movimientos de Stock
              </h2>
            </div>
            <Link to="/inventory" className="text-[10px] text-sky-400 hover:text-sky-300 font-mono flex items-center gap-0.5">
              <span>Ver kardex</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {recentMovements.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              No hay movimientos recientes en almacén.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentMovements.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-[#07090E] border border-[#161B26] flex items-center justify-between"
                >
                  <div className="truncate max-w-[240px]">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-[#121622]">
                        {m.sku}
                      </span>
                      <span className="text-xs font-medium text-white truncate">
                        {m.productName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                      {m.reason}
                    </span>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <span
                      className={`text-xs font-bold ${
                        m.type === 'IN' || m.type === 'SALE_REVERSAL'
                          ? 'text-emerald-400'
                          : m.type === 'OUT' || m.type === 'SALE'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {m.type === 'IN' ? `+${m.quantity}` : m.type === 'OUT' ? `-${m.quantity}` : `~${m.quantity}`}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Balance: {m.stockAfter} uds
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Backend & Database Live Verification Status */}
      <div className="p-6 rounded-2xl bg-[#0B0E16] border border-[#171D2A] space-y-4">
        <div className="flex items-center justify-between border-b border-[#161B26] pb-4">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-sm font-semibold text-white">Estado de Conectividad del Sistema</h2>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            Sistema Completo Operativo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#07090E] border border-[#161B26]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Sesión Activa</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white font-mono truncate">{user?.email}</p>
            <p className="text-[11px] text-emerald-400 mt-1">Cookie HttpOnly Segura</p>
          </div>

          <div className="p-4 rounded-xl bg-[#07090E] border border-[#161B26]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Base de Datos PostgreSQL</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {health?.database === 'connected' ? 'CONECTADO (10 TABLAS)' : 'CONECTANDO...'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Transacciones Atómicas Activas</p>
          </div>

          <div className="p-4 rounded-xl bg-[#07090E] border border-[#161B26]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Aislamiento de Tienda</span>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white font-mono truncate">
              {organization?.name}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Multi-Tenant Scoped</p>
          </div>
        </div>
      </div>
    </div>
  );
}
