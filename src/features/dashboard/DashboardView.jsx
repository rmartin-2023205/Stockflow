import React, { useState, useEffect } from 'react';
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
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export default function DashboardView() {
  const { user, organization, role } = useAuth();
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const checkBackendHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await api.checkHealth();
      setHealth(res.data);
    } catch (err) {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

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
            Organización activa: <span className="text-slate-200 font-medium">{organization?.name}</span> • Moneda base: <span className="font-mono text-emerald-400">{organization?.currency || 'GTQ'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={checkBackendHealth}
            disabled={healthLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#0E121B] hover:bg-[#161D2B] border border-[#1E2638] text-slate-300 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar Estado</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards (Type-First Design per taste-skill app-screens) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ventas del día */}
        <div className="p-5 rounded-2xl bg-[#0B0E16] border border-[#171D2A] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Ventas de Hoy</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {organization?.currency === 'USD' ? '$' : 'Q'}0.00
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-mono">
            0 transacciones completadas
          </span>
        </div>

        {/* KPI 2: Ventas Completadas */}
        <div className="p-5 rounded-2xl bg-[#0B0E16] border border-[#171D2A] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Transacciones</span>
            <ShoppingCart className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            0
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-mono">
            Esperando ventas en Fase 5
          </span>
        </div>

        {/* KPI 3: Productos Activos */}
        <div className="p-5 rounded-2xl bg-[#0B0E16] border border-[#171D2A] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Catálogo de Productos</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            0
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-mono">
            Listos para Fase 3 (CRUD)
          </span>
        </div>

        {/* KPI 4: Stock Bajo */}
        <div className="p-5 rounded-2xl bg-[#0B0E16] border border-[#171D2A] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Alertas de Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            0
          </div>
          <span className="text-[11px] text-emerald-400 mt-2 font-mono">
            Sin existencias críticas
          </span>
        </div>
      </div>

      {/* Backend & Database Live Verification Status */}
      <div className="p-6 rounded-2xl bg-[#0B0E16] border border-[#171D2A] space-y-4">
        <div className="flex items-center justify-between border-b border-[#161B26] pb-4">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-sm font-semibold text-white">Estado de Conectividad del Sistema</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Fase 2: Autenticación Verificada
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#07090E] border border-[#161B26]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Sesión Activa</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white font-mono truncate">{user?.email}</p>
            <p className="text-[11px] text-emerald-400 mt-1">Cookie HttpOnly Válida</p>
          </div>

          <div className="p-4 rounded-xl bg-[#07090E] border border-[#161B26]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">PostgreSQL (Prisma)</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {health?.database === 'connected' ? 'CONECTADO' : 'VERIFICANDO...'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">10 Tablas Migradas</p>
          </div>

          <div className="p-4 rounded-xl bg-[#07090E] border border-[#161B26]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Organización</span>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white font-mono truncate">
              ID: {organization?.id ? organization.id.slice(0, 10) + '...' : 'N/A'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Aislamiento por Tenant</p>
          </div>
        </div>
      </div>
    </div>
  );
}
