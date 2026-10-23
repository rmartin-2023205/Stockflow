import React from 'react';
import {
  Printer,
  CheckCircle2,
  X,
  PlusCircle,
  Building2,
  Calendar,
  User,
  CreditCard
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function ReceiptModal({
  isOpen,
  onClose,
  sale,
  currency = 'GTQ',
  onNewSale,
}) {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-sm bg-[#0D1017] border border-[#1A212F] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Success Header */}
        <div className="flex items-center justify-between border-b border-[#1A212F] pb-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Venta Completada</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#161C28] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Ticket Receipt Area */}
        <div
          id="printable-receipt"
          className="bg-white text-black p-5 rounded-xl font-mono text-[11px] space-y-3 shadow-inner selection:bg-black selection:text-white"
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-gray-400 pb-3 space-y-0.5">
            <h2 className="text-sm font-black tracking-tight uppercase">STOCKFLOW POS</h2>
            <p className="text-[10px] text-gray-600">Comprobante de Venta Interno</p>
            <p className="text-[11px] font-bold mt-1">{sale.saleNumber}</p>
          </div>

          {/* Meta Info */}
          <div className="text-[10px] text-gray-700 space-y-1 border-b border-dashed border-gray-400 pb-2.5">
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span>
                {new Date(sale.createdAt).toLocaleString('es-GT', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cajero:</span>
              <span className="font-semibold">{sale.cashier?.name || 'Cajero Principal'}</span>
            </div>
            <div className="flex justify-between">
              <span>Pago:</span>
              <span className="font-semibold">
                {sale.paymentMethod === 'CASH'
                  ? 'EFECTIVO'
                  : sale.paymentMethod === 'CARD'
                  ? 'TARJETA'
                  : 'TRANSFERENCIA'}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-1.5 border-b border-dashed border-gray-400 pb-3">
            <div className="grid grid-cols-12 text-[10px] font-bold uppercase text-gray-500 pb-1">
              <span className="col-span-6">Producto</span>
              <span className="col-span-2 text-center">Cant</span>
              <span className="col-span-4 text-right">Total</span>
            </div>

            {sale.items?.map((item) => (
              <div key={item.id} className="grid grid-cols-12 leading-tight">
                <span className="col-span-6 truncate font-medium">
                  {item.productNameSnapshot}
                </span>
                <span className="col-span-2 text-center text-gray-600">
                  x{item.quantity}
                </span>
                <span className="col-span-4 text-right font-bold">
                  {formatCurrency(item.lineTotal, currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 pt-1 text-[11px]">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(sale.subtotal, currency)}</span>
            </div>

            {parseFloat(sale.discountTotal) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Descuento:</span>
                <span>-{formatCurrency(sale.discountTotal, currency)}</span>
              </div>
            )}

            <div className="flex justify-between font-black text-xs pt-1 border-t border-gray-300">
              <span>TOTAL:</span>
              <span>{formatCurrency(sale.total, currency)}</span>
            </div>

            {sale.paymentMethod === 'CASH' && sale.amountReceived && (
              <div className="pt-1 text-[10px] space-y-0.5 text-gray-700">
                <div className="flex justify-between">
                  <span>Efectivo Recibido:</span>
                  <span>{formatCurrency(sale.amountReceived, currency)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Cambio Entregado:</span>
                  <span>{formatCurrency(sale.changeAmount || 0, currency)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Barcode Mock & Footer */}
          <div className="text-center pt-3 border-t border-dashed border-gray-400 space-y-1">
            <p className="text-[9px] text-gray-500">¡Gracias por su compra!</p>
            <p className="text-[8px] font-mono tracking-widest text-gray-400">||| |||| || ||||| ||||| |||</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 pt-1">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl border border-[#1E2536] text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#161C28] transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onNewSale?.();
            }}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black text-xs font-semibold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>
    </div>
  );
}
