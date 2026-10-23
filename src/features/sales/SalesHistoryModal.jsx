import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  History,
  Receipt,
  Ban,
  AlertTriangle,
  Loader2,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/format';

export default function SalesHistoryModal({
  isOpen,
  onClose,
  currency = 'GTQ',
  onSelectSaleReceipt,
}) {
  const { role } = useAuth();
  const isOwner = role === 'OWNER';

  const [sales, setSales] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cancellation State
  const [cancelModalId, setCancelModalId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSales({
        page,
        limit: 10,
        status: statusFilter,
      });
      setSales(res.data.sales || []);
      setMeta(res.data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Error al consultar historial de ventas.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    if (isOpen) {
      fetchSales();
    }
  }, [isOpen, fetchSales]);

  if (!isOpen) return null;

  const handleOpenCancel = (saleId) => {
    setCancelModalId(saleId);
    setCancelReason('');
    setCancelError(null);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      setCancelError('El motivo de anulación es obligatorio.');
      return;
    }

    setCancelling(true);
    setCancelError(null);
    try {
      await api.cancelSale(cancelModalId, cancelReason.trim());
      setCancelModalId(null);
      fetchSales();
    } catch (err) {
      setCancelError(err.message || 'Error al anular la venta.');
    } finally {
      setCancelling(false);
    }
  };

  const handleViewReceipt = async (saleId) => {
    try {
      const res = await api.getSaleById(saleId);
      onSelectSaleReceipt?.(res.data);
    } catch (err) {
      alert(err.message || 'Error al cargar comprobante.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-4xl bg-[#0D1017] border border-[#1A212F] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#1A212F] flex items-center justify-between bg-[#0F141E]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Historial de Ventas y Comprobantes
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Consulta ventas completadas o gestiona anulaciones
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

        {/* Filters Toolbar */}
        <div className="p-3.5 border-b border-[#161B26] bg-[#0A0D14] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 mr-1">Filtrar:</span>
            <div className="flex items-center bg-[#121622] border border-[#1E2536] rounded-xl p-0.5">
              {[
                { label: 'Todas', value: 'all' },
                { label: 'Completadas', value: 'COMPLETED' },
                { label: 'Anuladas', value: 'CANCELLED' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    statusFilter === tab.value
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={fetchSales}
            title="Recargar"
            className="p-2 rounded-xl bg-[#121622] border border-[#1E2536] text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && sales.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <span className="text-xs font-mono">Cargando ventas...</span>
            </div>
          ) : error ? (
            <div className="py-16 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="py-16 text-center space-y-2 text-slate-500">
              <Receipt className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No hay ventas registradas con el filtro actual.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1A212F] bg-[#0F141E]/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">No. Venta</th>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Cajero</th>
                  <th className="py-3 px-4 text-center">Artículos</th>
                  <th className="py-3 px-4 text-center">Método</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161B26]">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-[#121622]/60 transition-colors">
                    {/* Sale Number */}
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                      {s.saleNumber}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(s.createdAt).toLocaleString('es-GT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Cashier */}
                    <td className="py-3 px-4 text-slate-300">{s.cashier?.name}</td>

                    {/* Items Count */}
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {s._count?.items ?? 0}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4 text-center font-mono text-[10px] uppercase text-slate-400">
                      {s.paymentMethod}
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                      {formatCurrency(s.total, currency)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {s.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Completada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="w-3 h-3" />
                          Anulada
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleViewReceipt(s.id)}
                        title="Ver ticket de venta"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#161C28] transition cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>

                      {isOwner && s.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleOpenCancel(s.id)}
                          title="Anular venta y devolver stock"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

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

      {/* Cancellation Sub-Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            onClick={() => !cancelling && setCancelModalId(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-sm bg-[#0D1017] border border-red-500/30 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Anular esta Venta?</h3>
                <p className="text-xs text-slate-400">
                  Las existencias se reintegrarán automáticamente al inventario.
                </p>
              </div>
            </div>

            {cancelError && (
              <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                {cancelError}
              </p>
            )}

            <form onSubmit={handleConfirmCancel} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Motivo de Anulación *
                </label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ej. Devolución de cliente / Cobro duplicado"
                  className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalId(null)}
                  disabled={cancelling}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-400 text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Anulando...</span>
                    </>
                  ) : (
                    <span>Confirmar Anulación</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
