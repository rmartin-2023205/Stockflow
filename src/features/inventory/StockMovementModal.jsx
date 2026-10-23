import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  Package,
  AlertCircle,
  Loader2,
  Check,
  FileText,
  Calculator
} from 'lucide-react';
import { api } from '../../api/client';

export default function StockMovementModal({
  isOpen,
  onClose,
  products = [],
  initialProductId = '',
  initialType = 'IN',
  onSuccess,
}) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [type, setType] = useState('IN'); // IN, OUT, ADJUSTMENT
  const [quantity, setQuantity] = useState('1');
  const [newStock, setNewStock] = useState('0');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialProductId) {
      setSelectedProductId(initialProductId);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
    setType(initialType || 'IN');
    setQuantity('1');
    setReason('');
    setReference('');
    setError(null);
  }, [initialProductId, initialType, isOpen, products]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const currentStock = selectedProduct ? (selectedProduct.stockQuantity ?? selectedProduct.currentStock ?? 0) : 0;

  // Initialize newStock when selecting product or switching to ADJUSTMENT
  useEffect(() => {
    if (type === 'ADJUSTMENT' && selectedProduct) {
      setNewStock(String(currentStock));
    }
  }, [type, selectedProductId, currentStock, selectedProduct]);

  // Calculate projected balance
  let projectedStock = currentStock;
  let hasInsufficientStock = false;

  const parsedQty = parseInt(quantity, 10) || 0;
  const parsedNewStock = parseInt(newStock, 10) || 0;

  if (type === 'IN') {
    projectedStock = currentStock + parsedQty;
  } else if (type === 'OUT') {
    projectedStock = currentStock - parsedQty;
    if (projectedStock < 0) {
      hasInsufficientStock = true;
    }
  } else if (type === 'ADJUSTMENT') {
    projectedStock = parsedNewStock;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      setError('Debes seleccionar un producto.');
      return;
    }
    if (!reason.trim()) {
      setError('El motivo del movimiento es obligatorio.');
      return;
    }
    if (type === 'OUT' && hasInsufficientStock) {
      setError(`Stock insuficiente. Disponible: ${currentStock}, Solicitado: ${parsedQty}.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        productId: selectedProductId,
        type,
        reason: reason.trim(),
        reference: reference.trim() || undefined,
      };

      if (type === 'ADJUSTMENT') {
        payload.newStock = parsedNewStock;
      } else {
        payload.quantity = parsedQty;
      }

      await api.createStockMovement(payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Error al registrar el movimiento.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-lg bg-[#0D1017] border border-[#1A212F] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#161B26] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Registrar Movimiento de Inventario</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Trazabilidad inmutable con impacto en stock
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

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Picker */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Producto a Modificar *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">Selecciona un producto...</option>
              {products.map((p) => {
                const stock = p.stockQuantity ?? p.currentStock ?? 0;
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — Stock actual: {stock}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Movement Type Tabs */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Tipo de Movimiento *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('IN')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  type === 'IN'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#121622] border-[#1E2536] text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>Entrada (IN)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('OUT')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  type === 'OUT'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-[#121622] border-[#1E2536] text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                <span>Salida (OUT)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('ADJUSTMENT')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  type === 'ADJUSTMENT'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-[#121622] border-[#1E2536] text-slate-400 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Ajuste Conteo</span>
              </button>
            </div>
          </div>

          {/* Quantity or Target Balance Input */}
          {type === 'ADJUSTMENT' ? (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Nuevo Stock Real Verificado *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Ingresa el conteo físico exacto. El sistema calculará la diferencia automáticamente.
              </span>
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                {type === 'IN' ? 'Cantidad a Ingresar *' : 'Cantidad a Retirar *'}
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full bg-[#121622] border rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none ${
                  hasInsufficientStock
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-[#1E2536] focus:border-emerald-500/50'
                }`}
              />
            </div>
          )}

          {/* Interactive Calculator Preview Box */}
          <div className="p-3.5 rounded-xl bg-[#121622] border border-[#1E2536] space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                Impacto en Existencias
              </span>
              <span className="text-[11px] font-mono">
                {selectedProduct ? selectedProduct.name : 'Selecciona un producto'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1C2232] text-center">
              <div>
                <span className="text-[10px] text-slate-500 block">Stock Actual</span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {currentStock} uds
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Operación</span>
                <span
                  className={`text-xs font-mono font-bold ${
                    type === 'IN'
                      ? 'text-emerald-400'
                      : type === 'OUT'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {type === 'IN'
                    ? `+${parsedQty}`
                    : type === 'OUT'
                    ? `-${parsedQty}`
                    : `~ ${parsedNewStock - currentStock >= 0 ? '+' : ''}${parsedNewStock - currentStock}`}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Stock Resultante</span>
                <span
                  className={`text-xs font-mono font-bold ${
                    hasInsufficientStock
                      ? 'text-red-400'
                      : 'text-white'
                  }`}
                >
                  {projectedStock} uds
                </span>
              </div>
            </div>

            {hasInsufficientStock && (
              <p className="text-[10px] text-red-400 pt-1 text-center font-medium">
                ⚠️ Salida mayor a las existencias físicas disponibles.
              </p>
            )}
          </div>

          {/* Reason & Reference */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Motivo / Justificación *
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej. Compra con factura a proveedor / Producto roto en almacén"
                className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Número de Referencia / Comprobante (opcional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej. FAC-2024-089 / GUIA-4402"
                className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#161B26] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-[#161C28] transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || hasInsufficientStock}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Aplicar Movimiento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
