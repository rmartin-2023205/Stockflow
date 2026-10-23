import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  TrendingUp,
  Tag,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Building2,
  DollarSign
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../hooks';
import { formatCurrency, calculateProfitAndMargin } from '../../utils/format';
import ProductDrawer from './ProductDrawer';

export default function ProductsView() {
  const { organization, role } = useAuth();
  const currency = organization?.currency || 'GTQ';
  const isOwner = role === 'OWNER';

  // Use custom hook for products, categories, filters and pagination
  const {
    products,
    categories,
    meta,
    loading,
    error,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    togglingId,
    toggleProductStatus,
    refreshProducts,
    refreshCategories,
  } = useProducts();

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    refreshProducts();
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = (product) => {
    if (!isOwner) return;
    toggleProductStatus(product);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#161B26]">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <span>Catálogo de Productos</span>
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {meta.total} {meta.total === 1 ? 'artículo' : 'artículos'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Control de códigos SKU, precios de venta, costos unitarios y existencias en tiempo real.
          </p>
        </div>

        {/* Action Button */}
        {isOwner && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo Producto</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-[#0D1017] border border-[#1A212F] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código SKU..."
            className="w-full bg-[#121622] border border-[#1E2536] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="flex items-center space-x-1.5 bg-[#121622] border border-[#1E2536] rounded-xl px-2.5 py-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#121622] text-slate-300">
                Todas las categorías
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#121622] text-white">
                  {cat.name} ({cat._count?.products ?? 0})
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-[#121622] border border-[#1E2536] rounded-xl p-0.5">
            <button
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => {
                setStatusFilter('active');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => {
                setStatusFilter('inactive');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inactivos
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchProducts}
            title="Recargar catálogo"
            className="p-2 rounded-xl bg-[#121622] border border-[#1E2536] text-slate-400 hover:text-white hover:bg-[#181E2E] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main High-Density Table */}
      <div className="rounded-2xl bg-[#0D1017] border border-[#1A212F] overflow-hidden shadow-xl">
        {loading && products.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs font-mono">Consultando inventario...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-xs text-red-300">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-3.5 py-1.5 rounded-xl bg-[#141A24] border border-[#232B3A] text-xs text-white hover:bg-[#1B2332] cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#121622] border border-[#1E2536] flex items-center justify-center text-slate-500 mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No se encontraron productos</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || selectedCategory || statusFilter !== 'all'
                ? 'Ningún artículo coincide con los filtros aplicados. Intenta restablecer la búsqueda.'
                : 'Aún no has registrado ningún artículo en el catálogo de tu negocio.'}
            </p>
            {isOwner && !search && !selectedCategory && statusFilter === 'all' && (
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Primer Producto</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1A212F] bg-[#0F141E]/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4 text-right">P. Costo</th>
                  <th className="py-3 px-4 text-right">P. Venta</th>
                  <th className="py-3 px-4 text-right">Margen</th>
                  <th className="py-3 px-4 text-center">Existencias</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161B26]">
                {products.map((p) => {
                  const { profit, marginPercentage, health } = calculateProfitAndMargin(
                    p.costPrice,
                    p.salePrice
                  );
                  const currentStock = p.stockQuantity ?? p.currentStock ?? 0;
                  const isOutOfStock = currentStock <= 0;
                  const isLowStock = currentStock <= p.minStock && !isOutOfStock;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#121622]/60 transition-colors group"
                    >
                      {/* SKU */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {p.sku}
                        </span>
                      </td>

                      {/* Product Name & Category */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-white group-hover:text-emerald-300 transition-colors">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.category ? (
                            <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-[#161C28] border border-[#222A3B]">
                              {p.category.name}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-600 italic">
                              Sin categoría
                            </span>
                          )}
                          {p.description && (
                            <span className="text-[10px] text-slate-500 truncate max-w-[200px]" title={p.description}>
                              · {p.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-slate-400">
                        {formatCurrency(p.costPrice, currency)}
                      </td>

                      {/* Sale Price */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-white">
                        {formatCurrency(p.salePrice, currency)}
                      </td>

                      {/* Margin */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5 font-mono">
                          <span
                            className={`font-semibold ${
                              profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {marginPercentage}%
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          (+{formatCurrency(profit, currency)})
                        </span>
                      </td>

                      {/* Stock with badges */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            Agotado (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            Bajo stock ({currentStock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {currentStock} uds
                          </span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          disabled={!isOwner || togglingId === p.id}
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition ${
                            p.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20'
                          } ${!isOwner ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          {togglingId === p.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : p.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-500" />
                              <span>Inactivo</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isOwner && (
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2232] transition cursor-pointer"
                            title="Editar producto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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

      {/* Sliding Product Drawer */}
      <ProductDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        product={editingProduct}
        categories={categories}
        onSuccess={() => {
          refreshProducts();
          refreshCategories();
        }}
      />
    </div>
  );
}
