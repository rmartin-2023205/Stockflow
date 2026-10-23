import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  Barcode,
  History,
  Tag,
  AlertTriangle,
  Receipt,
  Sparkles,
  Loader2,
  Percent,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useCart, useDebounce } from '../../hooks';
import { formatCurrency } from '../../utils/format';
import CheckoutModal from './CheckoutModal';
import ReceiptModal from './ReceiptModal';
import SalesHistoryModal from './SalesHistoryModal';

export default function PosView() {
  const { organization, role } = useAuth();
  const currency = organization?.currency || 'GTQ';

  // Products and Categories
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Search & Filter with Debounce
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);
  const [selectedCategory, setSelectedCategory] = useState('');
  const searchInputRef = useRef(null);

  // Shopping Cart Custom Hook
  const {
    cart,
    discount,
    setDiscount,
    subtotal,
    discountTotal,
    total,
    totalItemsCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [showDiscountInput, setShowDiscountInput] = useState(false);

  // Modals
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Load initial data
  const loadData = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        api.getProducts({ limit: 100, status: 'active' }),
        api.getCategories(),
      ]);
      setProducts(prodsRes.data.products || []);
      setCategories(catsRes.data || []);
    } catch (err) {
      console.error('Error al cargar datos del POS:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Focus search input on load
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Filter products by debounced search and category
  const filteredProducts = products.filter((p) => {
    const term = debouncedSearch.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term);
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleClearCart = () => {
    clearCart();
    setShowDiscountInput(false);
  };

  // Process Checkout
  const handleConfirmCheckout = async ({ paymentMethod, amountReceived }) => {
    setCheckoutLoading(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        discountTotal,
        amountReceived,
      };

      const res = await api.createSale(payload);
      setCompletedSale(res.data);
      setCheckoutOpen(false);
      setReceiptOpen(true);
      handleClearCart();
      loadData(); // Reload inventory balances
    } catch (err) {
      alert(err.message || 'Error al procesar la venta.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#161B26]">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <span>Punto de Venta Transaccional (POS)</span>
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Terminal Activo
          </span>
        </div>

        <button
          onClick={() => setHistoryOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#121622] hover:bg-[#1A2232] text-slate-300 hover:text-white border border-[#1E2536] text-xs font-medium transition cursor-pointer"
        >
          <History className="w-4 h-4 text-emerald-400" />
          <span>Historial de Ventas</span>
        </button>
      </div>

      {/* Split-Screen Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Product Catalog & Search (Col 7 / 8) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Search and Category Filters */}
          <div className="p-3.5 rounded-2xl bg-[#0D1017] border border-[#1A212F] space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Escanear código de barras o escribir nombre/SKU..."
                className="w-full bg-[#121622] border border-[#1E2536] rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
              />
              <Barcode className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3 opacity-60" />
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  !selectedCategory
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#121622] text-slate-400 hover:text-white border border-[#1E2536]'
                }`}
              >
                Todas ({products.length})
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#121622] text-slate-400 hover:text-white border border-[#1E2536]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          {loadingProducts ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <span className="text-xs font-mono">Cargando catálogo para venta...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 rounded-2xl bg-[#0D1017] border border-[#1A212F] text-center space-y-2 text-slate-500">
              <Package className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No se encontraron artículos con ese criterio de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((p) => {
                const stock = p.stockQuantity ?? p.currentStock ?? 0;
                const isOutOfStock = stock <= 0;
                const isLowStock = stock <= p.minStock && !isOutOfStock;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                    className={`p-3.5 rounded-2xl bg-[#0D1017] border text-left flex flex-col justify-between transition-all group ${
                      isOutOfStock
                        ? 'border-[#1A212F] opacity-50 cursor-not-allowed'
                        : 'border-[#1A212F] hover:border-emerald-500/40 hover:bg-[#121622] active:scale-[0.98] cursor-pointer shadow-sm hover:shadow-lg'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-emerald-400 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 truncate max-w-[90px]">
                          {p.sku}
                        </span>

                        {isOutOfStock ? (
                          <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded">
                            Agotado
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                            {stock} disp
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-emerald-400/80">
                            {stock} disp
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 min-h-[32px]">
                        {p.name}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#161B26] flex items-center justify-between">
                      <span className="text-sm font-bold font-mono text-white">
                        {formatCurrency(p.salePrice, currency)}
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Shopping Cart (Col 5 / 4) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
          <div className="rounded-2xl bg-[#0D1017] border border-[#1A212F] shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
            {/* Cart Header */}
            <div className="p-4 border-b border-[#1A212F] bg-[#0F141E] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Ticket de Venta
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {totalItemsCount} {totalItemsCount === 1 ? 'ítem' : 'ítems'}
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  title="Vaciar ticket"
                  className="text-[10px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Vaciar</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-2 text-slate-500">
                  <div className="w-10 h-10 rounded-xl bg-[#121622] flex items-center justify-center mx-auto text-slate-600">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <p className="text-xs">El carrito de cobro está vacío.</p>
                  <p className="text-[11px] text-slate-600">
                    Haz clic en los productos para agregarlos al ticket.
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const lineTotal =
                    Math.round(parseFloat(item.product.salePrice) * item.quantity * 100) / 100;
                  const available =
                    item.product.stockQuantity ?? item.product.currentStock ?? 0;

                  return (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-xl bg-[#121622] border border-[#1E2536] space-y-2 animate-in fade-in duration-100"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-emerald-400 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10">
                            {item.product.sku}
                          </span>
                          <h4 className="text-xs font-semibold text-white mt-1 leading-snug">
                            {item.product.name}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">
                            {formatCurrency(item.product.salePrice, currency)} c/u
                          </span>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-500 hover:text-red-400 transition p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quantity Selector & Line Total */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#1C2232]">
                        <div className="flex items-center space-x-1.5 bg-[#0C0F16] border border-[#1E2536] rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#181E2C] transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-xs text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            disabled={item.quantity >= available}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#181E2C] transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {formatCurrency(lineTotal, currency)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Financial Summary & Checkout */}
            <div className="p-4 border-t border-[#1A212F] bg-[#0F141E] space-y-3">
              {/* Discount Row */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowDiscountInput(!showDiscountInput)}
                  className="text-[11px] text-emerald-400/90 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <Percent className="w-3 h-3" />
                  <span>{showDiscountInput ? 'Ocultar descuento' : '+ Aplicar descuento'}</span>
                </button>

                {discount > 0 && (
                  <span className="font-mono text-amber-400 text-xs">
                    -{formatCurrency(discountTotal, currency)}
                  </span>
                )}
              </div>

              {showDiscountInput && (
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-xs text-slate-400">Monto:</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={discount || ''}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="flex-1 bg-[#121622] border border-[#1E2536] rounded-xl px-2.5 py-1 text-xs font-mono text-white text-right focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              )}

              {/* Subtotal & Total */}
              <div className="space-y-1.5 pt-1 border-t border-[#161B26] text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrency(subtotal, currency)}</span>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Total a Cobrar:
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                    {formatCurrency(total, currency)}
                  </span>
                </div>
              </div>

              {/* Big Checkout Button */}
              <button
                disabled={cart.length === 0}
                onClick={() => setCheckoutOpen(true)}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Cobrar {formatCurrency(total, currency)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        total={total}
        subtotal={subtotal}
        discount={discountTotal}
        currency={currency}
        loading={checkoutLoading}
        onConfirmCheckout={handleConfirmCheckout}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        sale={completedSale}
        currency={currency}
        onNewSale={() => {
          setReceiptOpen(false);
          searchInputRef.current?.focus();
        }}
      />

      {/* Sales History Modal */}
      <SalesHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        currency={currency}
        onSelectSaleReceipt={(sale) => {
          setHistoryOpen(false);
          setCompletedSale(sale);
          setReceiptOpen(true);
        }}
      />
    </div>
  );
}
