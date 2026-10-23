import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Loader2,
  Check,
  Sparkles,
  Barcode,
  Layers,
  Info
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, calculateProfitAndMargin } from '../../utils/format';

export default function ProductDrawer({
  isOpen,
  onClose,
  product = null,
  categories = [],
  onSuccess,
}) {
  const { organization } = useAuth();
  const currency = organization?.currency || 'GTQ';
  const isEditing = Boolean(product);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    costPrice: '',
    salePrice: '',
    currentStock: '0',
    minStock: '5',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync state when product opens or changes
  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        costPrice: product.costPrice ? String(product.costPrice) : '0',
        salePrice: product.salePrice ? String(product.salePrice) : '0',
        currentStock: String(product.currentStock ?? 0),
        minStock: String(product.minStock ?? 5),
        isActive: product.isActive ?? true,
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        categoryId: '',
        costPrice: '',
        salePrice: '',
        currentStock: '0',
        minStock: '5',
        isActive: true,
      });
    }
    setError(null);
  }, [product, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSkuChange = (e) => {
    // Automatically force uppercase and remove spaces
    const clean = e.target.value.toUpperCase().replace(/\s+/g, '');
    setFormData((prev) => ({ ...prev, sku: clean }));
  };

  const generateRandomSku = () => {
    const prefix = 'PRD';
    const rand = Math.floor(10000 + Math.random() * 90000);
    setFormData((prev) => ({ ...prev, sku: `${prefix}-${rand}` }));
  };

  const { profit, marginPercentage, health } = calculateProfitAndMargin(
    formData.costPrice,
    formData.salePrice
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        categoryId: formData.categoryId || undefined,
        costPrice: parseFloat(formData.costPrice) || 0,
        salePrice: parseFloat(formData.salePrice) || 0,
        minStock: parseInt(formData.minStock, 10) || 0,
      };

      if (!isEditing) {
        payload.sku = formData.sku.trim();
        payload.currentStock = parseInt(formData.currentStock, 10) || 0;
        await api.createProduct(payload);
      } else {
        // If editing SKU changed, include it
        if (formData.sku.trim() !== product.sku) {
          payload.sku = formData.sku.trim();
        }
        await api.updateProduct(product.id, payload);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D1017] border-l border-[#1A212F] shadow-2xl flex flex-col h-full transform transition-all ease-out duration-300">
          {/* Header */}
          <div className="p-5 border-b border-[#1A212F] flex items-center justify-between bg-[#0F141E]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <p className="text-[11px] font-mono text-slate-400">
                  {isEditing ? `SKU: ${product?.sku}` : 'Crea un artículo en tu catálogo'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#161C28] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* SKU & Generator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Código SKU *</span>
                </label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={generateRandomSku}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Autogenerar</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                name="sku"
                required
                value={formData.sku}
                onChange={handleSkuChange}
                placeholder="Ej. BEB-001"
                className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 uppercase tracking-wider"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Identificador único de producto (letras, números y guiones).
              </span>
            </div>

            {/* Product Name */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Nombre del Producto *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Coca-Cola 600ml Desechable"
                className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Categoría</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
              >
                <option value="">(Sin categoría)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Descripción (opcional)
              </label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                placeholder="Detalles sobre empaque, marca o especificaciones..."
                className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none"
              />
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1 mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  <span>Precio Costo *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-slate-500">
                    {currency === 'GTQ' ? 'Q' : '$'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full bg-[#121622] border border-[#1E2536] rounded-xl pl-8 pr-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-right"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1 mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Precio Venta *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-emerald-400">
                    {currency === 'GTQ' ? 'Q' : '$'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full bg-[#121622] border border-[#1E2536] rounded-xl pl-8 pr-3 py-2 text-xs font-mono text-emerald-300 font-semibold placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-right"
                  />
                </div>
              </div>
            </div>

            {/* Financial Margin Card */}
            <div className="p-3.5 rounded-xl bg-[#121622] border border-[#1E2536] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Rendimiento Estimado
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    health === 'healthy'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : health === 'moderate'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      : health === 'negative'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}
                >
                  {health === 'healthy'
                    ? 'Margen Saludable'
                    : health === 'moderate'
                    ? 'Margen Moderado'
                    : health === 'negative'
                    ? 'Pérdida / Negativo'
                    : 'Margen Bajo'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1C2232]">
                <div>
                  <span className="text-[10px] text-slate-500 block">Ganancia Unitaria</span>
                  <span
                    className={`text-xs font-mono font-bold ${
                      profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatCurrency(profit, currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Margen sobre Venta</span>
                  <span
                    className={`text-xs font-mono font-bold ${
                      profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {marginPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Stock Quantities */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  {isEditing ? 'Stock Actual' : 'Stock Inicial *'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  name="currentStock"
                  disabled={isEditing}
                  value={formData.currentStock}
                  onChange={handleChange}
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs font-mono ${
                    isEditing
                      ? 'bg-[#0E121B] text-slate-500 border-[#1A212E] cursor-not-allowed'
                      : 'bg-[#121622] text-white border-[#1E2536] focus:outline-none focus:border-emerald-500/50'
                  }`}
                />
                {isEditing ? (
                  <span className="text-[9px] text-slate-500 mt-1 block">
                    Modificar solo mediante Ajustes de Inventario.
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-500 mt-1 block">
                    Crea un movimiento inicial de entrada.
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Stock Mínimo (Alerta)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleChange}
                  className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">
                  Aviso visual cuando baje de este umbral.
                </span>
              </div>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[#1A212F] bg-[#0F141E] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-[#161C28] transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Guardar Cambios' : 'Crear Producto'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
