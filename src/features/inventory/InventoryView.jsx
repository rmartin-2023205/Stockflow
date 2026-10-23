import React, { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  RefreshCw,
  Loader2,
  AlertTriangle,
  History,
  ShoppingCart,
  Calendar,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';
import InventoryMetrics from './InventoryMetrics';
import StockMovementModal from './StockMovementModal';

export default function InventoryView() {
  const { organization, role } = useAuth();
  const currency = organization?.currency || 'GTQ';
  const isOwner = role === 'OWNER';

  // Navigation tab: 'kardex' | 'alerts'
  const [activeTab, setActiveTab] = useState('kardex');

  // Summary Metrics State
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Products list (for picker in modal and filter)
  const [products, setProducts] = useState([]);

  // Kardex Ledger State
  const [movements, setMovements] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [loadingMovements, setLoadingMovements] = useState(true);
  const [movementsError, setMovementsError] = useState(null);

  // Low Stock Alerts State
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProductId, setModalProductId] = useState('');
  const [modalType, setModalType] = useState('IN');

  // Load summary metrics
  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await api.getInventorySummary();
      setSummary(res.data);
    } catch (err) {
      console.error('Error al obtener métricas de inventario:', err);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  // Load products list for dropdowns
  const fetchProductsList = useCallback(async () => {
    try {
      const res = await api.getProducts({ limit: 100, status: 'all' });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Error al cargar lista de productos:', err);
    }
  }, []);

  // Load Kardex movements
  const fetchMovements = useCallback(async () => {
    setLoadingMovements(true);
    setMovementsError(null);
    try {
      const params = {
        page,
        limit: 15,
      };
      if (typeFilter) params.type = typeFilter;
      if (productFilter) params.productId = productFilter;

      const res = await api.getStockMovements(params);
      setMovements(res.data.movements || []);
      setMeta(res.data.meta || { total: 0, page: 1, limit: 15, totalPages: 1 });
    } catch (err) {
      setMovementsError(err.message || 'Error al consultar historial del Kardex.');
    } finally {
      setLoadingMovements(false);
    }
  }, [page, typeFilter, productFilter]);

  // Load low stock products
  const fetchLowStock = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await api.getLowStockProducts();
      setLowStockProducts(res.data || []);
    } catch (err) {
      console.error('Error al cargar alertas de stock:', err);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchProductsList();
  }, [fetchSummary, fetchProductsList]);

  useEffect(() => {
    if (activeTab === 'kardex') {
      fetchMovements();
    } else if (activeTab === 'alerts') {
      fetchLowStock();
    }
  }, [activeTab, fetchMovements, fetchLowStock]);

  const handleOpenMovementModal = (productId = '', type = 'IN') => {
    setModalProductId(productId);
    setModalType(type);
    setModalOpen(true);
  };

  const handleMovementSuccess = () => {
    fetchSummary();
    fetchProductsList();
    if (activeTab === 'kardex') fetchMovements();
    if (activeTab === 'alerts') fetchLowStock();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#161B26]">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-400" />
              <span>Centro de Control de Inventario</span>
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Kardex & Auditoría
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro inmutable de movimientos, alertas automáticas de reposición y valoración contable.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => handleOpenMovementModal()}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Registrar Movimiento</span>
          </button>
        )}
      </div>

      {/* Top Metrics Cards */}
      <InventoryMetrics
        summary={summary}
        currency={currency}
        loading={loadingSummary}
      />

      {/* Main Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-[#1A212F]">
        <button
          onClick={() => setActiveTab('kardex')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'kardex'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Kardex / Historial de Movimientos</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#161C28] text-slate-300">
            {meta.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'alerts'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Alertas de Reabastecimiento</span>
          {(summary?.lowStockCount || 0) + (summary?.outOfStockCount || 0) > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {(summary?.lowStockCount || 0) + (summary?.outOfStockCount || 0)}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: KARDEX MOVEMENTS */}
      {activeTab === 'kardex' && (
        <div className="space-y-4">
          {/* Kardex Filters */}
          <div className="p-3.5 rounded-2xl bg-[#0D1017] border border-[#1A212F] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter Pills */}
              <div className="flex items-center bg-[#121622] border border-[#1E2536] rounded-xl p-0.5">
                {[
                  { label: 'Todos', value: '' },
                  { label: 'Entradas (IN)', value: 'IN' },
                  { label: 'Salidas (OUT)', value: 'OUT' },
                  { label: 'Ajustes', value: 'ADJUSTMENT' },
                  { label: 'Ventas (SALE)', value: 'SALE' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setTypeFilter(item.value);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      typeFilter === item.value
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Product Filter Dropdown */}
              <div className="flex items-center space-x-1.5 bg-[#121622] border border-[#1E2536] rounded-xl px-2.5 py-1.5">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={productFilter}
                  onChange={(e) => {
                    setProductFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  <option value="" className="bg-[#121622] text-slate-300">
                    Todos los productos
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#121622] text-white">
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchMovements}
              title="Recargar kardex"
              className="p-2 rounded-xl bg-[#121622] border border-[#1E2536] text-slate-400 hover:text-white hover:bg-[#181E2E] transition cursor-pointer self-end sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMovements ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          {/* High-Density Movements Table */}
          <div className="rounded-2xl bg-[#0D1017] border border-[#1A212F] overflow-hidden shadow-xl">
            {loadingMovements && movements.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                <span className="text-xs font-mono">Consultando kardex de auditoría...</span>
              </div>
            ) : movementsError ? (
              <div className="py-16 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
                <p className="text-xs text-red-300">{movementsError}</p>
                <button
                  onClick={fetchMovements}
                  className="px-3.5 py-1.5 rounded-xl bg-[#141A24] border border-[#232B3A] text-xs text-white hover:bg-[#1B2332] cursor-pointer"
                >
                  Reintentar
                </button>
              </div>
            ) : movements.length === 0 ? (
              <div className="py-16 text-center space-y-3 px-4">
                <div className="w-12 h-12 rounded-2xl bg-[#121622] border border-[#1E2536] flex items-center justify-center text-slate-500 mx-auto">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-white">Sin registros de movimientos</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Aún no se han ejecutado entradas, salidas o ajustes de inventario para este filtro.
                </p>
                {isOwner && (
                  <button
                    onClick={() => handleOpenMovementModal()}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Registrar Primer Movimiento</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#1A212F] bg-[#0F141E]/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Fecha y Hora</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4 text-center">Cantidad</th>
                      <th className="py-3 px-4 text-center">Balance Almacén</th>
                      <th className="py-3 px-4">Motivo / Justificación</th>
                      <th className="py-3 px-4 text-right">Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161B26]">
                    {movements.map((m) => {
                      const isEntry = m.type === 'IN' || m.type === 'SALE_REVERSAL';
                      const isExit = m.type === 'OUT' || m.type === 'SALE';
                      const isAdjustment = m.type === 'ADJUSTMENT';

                      return (
                        <tr key={m.id} className="hover:bg-[#121622]/60 transition-colors">
                          {/* Date */}
                          <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                            {new Date(m.createdAt).toLocaleString('es-GT', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          {/* Type */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {m.type === 'IN' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <ArrowDownLeft className="w-3 h-3" />
                                Entrada
                              </span>
                            ) : m.type === 'OUT' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <ArrowUpRight className="w-3 h-3" />
                                Salida
                              </span>
                            ) : m.type === 'ADJUSTMENT' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <SlidersHorizontal className="w-3 h-3" />
                                Ajuste
                              </span>
                            ) : m.type === 'SALE' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                <ShoppingCart className="w-3 h-3" />
                                Venta POS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                Reversa
                              </span>
                            )}
                          </td>

                          {/* Product */}
                          <td className="py-3 px-4">
                            <span className="font-mono text-emerald-400 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 mr-2">
                              {m.product.sku}
                            </span>
                            <span className="font-medium text-white">{m.product.name}</span>
                          </td>

                          {/* Quantity */}
                          <td className="py-3 px-4 text-center whitespace-nowrap font-mono font-bold">
                            <span
                              className={
                                isEntry
                                  ? 'text-emerald-400'
                                  : isExit
                                  ? 'text-rose-400'
                                  : 'text-amber-400'
                              }
                            >
                              {isEntry ? `+${m.quantity}` : isExit ? `-${m.quantity}` : `~${m.quantity}`}
                            </span>
                          </td>

                          {/* Balance */}
                          <td className="py-3 px-4 text-center whitespace-nowrap font-mono text-[11px] text-slate-400">
                            <span>{m.stockBefore}</span>
                            <span className="mx-1 text-slate-600">→</span>
                            <span className="text-white font-semibold">{m.stockAfter} uds</span>
                          </td>

                          {/* Reason */}
                          <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={m.reason}>
                            {m.reason || '-'}
                          </td>

                          {/* User */}
                          <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-[11px] text-slate-400">
                            {m.user?.name || 'Sistema'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {meta.totalPages > 1 && (
              <div className="p-3.5 border-t border-[#1A212F] bg-[#0F141E]/80 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Página <span className="font-mono text-white">{meta.page}</span> de{' '}
                  <span className="font-mono text-white">{meta.totalPages}</span>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={meta.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-[#1E2536] hover:bg-[#161C28] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-[#1E2536] hover:bg-[#161C28] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LOW STOCK ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {loadingAlerts ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs font-mono">Buscando productos en riesgo de quiebre...</span>
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#0D1017] border border-[#1A212F] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">¡Niveles de stock óptimos!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No hay productos en riesgo de desabastecimiento. Todos los artículos activos superan su umbral mínimo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((p) => {
                const isOutOfStock = p.stockQuantity <= 0;
                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-[#0D1017] border border-[#1A212F] hover:border-amber-500/30 transition-all flex flex-col justify-between shadow-sm space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-emerald-400 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                            {p.sku}
                          </span>
                          <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                            {p.name}
                          </h3>
                        </div>

                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-red-500/15 text-red-400 border border-red-500/25 shrink-0">
                            AGOTADO (0)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25 shrink-0">
                            BAJO STOCK
                          </span>
                        )}
                      </div>

                      {/* Stock Bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-400">Existencias actuales:</span>
                          <span className={`font-bold ${isOutOfStock ? 'text-red-400' : 'text-amber-400'}`}>
                            {p.stockQuantity} de {p.minStock} mín.
                          </span>
                        </div>
                        <div className="w-full bg-[#161C28] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOutOfStock ? 'bg-red-500 w-0' : 'bg-amber-400'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(5, (p.stockQuantity / p.minStock) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => handleOpenMovementModal(p.id, 'IN')}
                        className="w-full py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        <span>Reabastecer con Entrada</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Stock Movement Modal */}
      <StockMovementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        products={products}
        initialProductId={modalProductId}
        initialType={modalType}
        onSuccess={handleMovementSuccess}
      />
    </div>
  );
}
