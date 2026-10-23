import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  Package
} from 'lucide-react';
import { api } from './api/client';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.checkHealth();
      setHealth(response.data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background subtle glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">Stock<span className="text-indigo-400">Flow</span></span>
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Fase 1
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <a 
              href="/api/health" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <span>/api/health</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fundamentos de Arquitectura Verificados</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Infraestructura Base de <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">StockFlow</span>
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
            Monorepo configurado con React + Vite + Tailwind CSS en el cliente, Express + Prisma en el servidor y PostgreSQL como motor de persistencia.
          </p>
        </div>

        {/* Health Check Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse"></div>
              <h2 className="font-semibold text-white text-base">Estado del Sistema & Conectividad</h2>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Verificar</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400">Consultando endpoint /api/health...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-sm">Fallo en la verificación del backend</span>
              </div>
              <p className="text-xs text-red-300 font-mono">{error}</p>
            </div>
          ) : health ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* API Server Status */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400">Servidor Express</span>
                  <Server className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-sm capitalize text-white">{health.status}</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-2 font-mono">
                  Uptime: {health.uptime ? `${Math.round(health.uptime)}s` : 'N/A'}
                </span>
              </div>

              {/* Database Status */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400">PostgreSQL (Prisma)</span>
                  <Database className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex items-center gap-2">
                  {health.database === 'connected' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-sm text-emerald-300">Conectado</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-sm text-amber-300 capitalize">{health.database}</span>
                    </>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-2 font-mono">
                  Engine: Prisma ORM
                </span>
              </div>

              {/* Monorepo Workspace */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400">Entorno</span>
                  <Layers className="w-4 h-4 text-sky-400" />
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-sm text-white uppercase">{health.environment || 'development'}</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-2 font-mono">
                  Última prueba: {lastChecked || 'N/A'}
                </span>
              </div>
            </div>
          ) : null}

          {/* Architecture Roadmap summary */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Fases 0 y 1 Completadas (Fundamentos & Health Check)</span>
            </div>
            <div className="text-slate-500">
              Próximo paso: Fase 2 (Modelado y Autenticación)
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        StockFlow &copy; {new Date().getFullYear()} — Gestión de inventario y ventas para pequeños negocios.
      </footer>
    </div>
  );
}
