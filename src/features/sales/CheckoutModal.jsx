import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  DollarSign,
  AlertCircle,
  Loader2,
  Check,
  Coins
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function CheckoutModal({
  isOpen,
  onClose,
  total,
  subtotal,
  discount,
  currency = 'GTQ',
  onConfirmCheckout,
  loading,
}) {
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, CARD, TRANSFER
  const [amountReceived, setAmountReceived] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('CASH');
      setAmountReceived(String(total));
      setError(null);
    }
  }, [isOpen, total]);

  if (!isOpen) return null;

  const parsedReceived = parseFloat(amountReceived) || 0;
  const change = Math.max(0, Math.round((parsedReceived - total) * 100) / 100);
  const isInsufficientCash = paymentMethod === 'CASH' && parsedReceived < total;

  const handleQuickCash = (value) => {
    setAmountReceived(String(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isInsufficientCash) {
      setError(`El monto recibido (${formatCurrency(parsedReceived, currency)}) es menor al total a pagar.`);
      return;
    }

    onConfirmCheckout({
      paymentMethod,
      amountReceived: paymentMethod === 'CASH' ? parsedReceived : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => !loading && onClose()}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-md bg-[#0D1017] border border-[#1A212F] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A212F] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Completar Cobro</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Selecciona la forma de pago
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
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

        {/* Big Total Box */}
        <div className="p-4 rounded-xl bg-[#121622] border border-[#1E2536] text-center space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
            Total a Cobrar
          </span>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
            {formatCurrency(total, currency)}
          </div>
          {discount > 0 && (
            <span className="text-[10px] text-slate-500 block font-mono">
              (Subtotal: {formatCurrency(subtotal, currency)} · Descuento: -{formatCurrency(discount, currency)})
            </span>
          )}
        </div>

        {/* Payment Methods Tabs */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">
            Método de Pago
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                paymentMethod === 'CASH'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#121622] border-[#1E2536] text-slate-400 hover:text-white'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Efectivo</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                paymentMethod === 'CARD'
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                  : 'bg-[#121622] border-[#1E2536] text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Tarjeta</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('TRANSFER')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                paymentMethod === 'TRANSFER'
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                  : 'bg-[#121622] border-[#1E2536] text-slate-400 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Transferencia</span>
            </button>
          </div>
        </div>

        {/* Cash Calculator */}
        {paymentMethod === 'CASH' && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Efectivo Recibido del Cliente
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-mono text-slate-500">
                  {currency === 'GTQ' ? 'Q' : '$'}
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  className="w-full bg-[#121622] border border-[#1E2536] rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500/50 text-right"
                />
              </div>
            </div>

            {/* Quick Bill Amounts */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickCash(total)}
                className="px-2.5 py-1 rounded-lg bg-[#161C28] hover:bg-[#1E2536] text-[11px] font-mono text-emerald-400 border border-[#222A3B] transition cursor-pointer"
              >
                Exacto
              </button>
              {[20, 50, 100, 200].map((bill) => (
                <button
                  key={bill}
                  type="button"
                  onClick={() => handleQuickCash(bill)}
                  className="px-2.5 py-1 rounded-lg bg-[#161C28] hover:bg-[#1E2536] text-[11px] font-mono text-slate-300 border border-[#222A3B] transition cursor-pointer"
                >
                  +{bill}
                </button>
              ))}
            </div>

            {/* Change Display Box */}
            <div className="p-3 rounded-xl bg-[#121622] border border-[#1E2536] flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Cambio a devolver:
              </span>
              <span
                className={`text-base font-mono font-bold ${
                  isInsufficientCash ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {isInsufficientCash ? 'Monto insuficiente' : formatCurrency(change, currency)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end space-x-3 border-t border-[#161B26]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-[#161C28] transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || isInsufficientCash}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando Venta...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Confirmar y Finalizar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
