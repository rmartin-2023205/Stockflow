import React from 'react';
import {
  Boxes,
  Coins,
  TrendingUp,
  AlertTriangle,
  PackageX
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function InventoryMetrics({ summary, currency = 'GTQ', loading }) {
  const {
    totalUnits = 0,
    totalCostValue = 0,
    totalSaleValue = 0,
    lowStockCount = 0,
    outOfStockCount = 0,
  } = summary || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Units in Warehouse */}
      <div className="p-4 rounded-2xl bg-[#0D1017] border border-[#1A212F] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Unidades</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Boxes className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {loading ? '-' : totalUnits.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Artículos físicos disponibles en almacén
          </span>
        </div>
      </div>

      {/* 2. Total Cost Valuation */}
      <div className="p-4 rounded-2xl bg-[#0D1017] border border-[#1A212F] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Inversión al Costo</span>
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-sky-300 tracking-tight">
            {loading ? '-' : formatCurrency(totalCostValue, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Capital retenido en existencias actuales
          </span>
        </div>
      </div>

      {/* 3. Expected Sale Value */}
      <div className="p-4 rounded-2xl bg-[#0D1017] border border-[#1A212F] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Valor Proyectado Venta</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            {loading ? '-' : formatCurrency(totalSaleValue, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Ingreso bruto potencial al liquidar stock
          </span>
        </div>
      </div>

      {/* 4. Stock Alerts (Low & Out of stock) */}
      <div className="p-4 rounded-2xl bg-[#0D1017] border border-[#1A212F] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Alertas de Stock</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div>
            <span className="text-xl font-bold font-mono text-amber-400">
              {loading ? '-' : lowStockCount}
            </span>
            <span className="text-[10px] text-amber-400/80 block font-medium">Bajo stock</span>
          </div>
          <div className="w-px h-8 bg-[#1E2536]" />
          <div>
            <span className="text-xl font-bold font-mono text-red-400">
              {loading ? '-' : outOfStockCount}
            </span>
            <span className="text-[10px] text-red-400/80 block font-medium">Agotados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
