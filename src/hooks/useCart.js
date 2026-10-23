import { useState, useMemo, useCallback } from 'react';

/**
 * Hook personalizado para gestionar el estado del carrito en el Punto de Venta (POS).
 * Encapsula adición de productos, validación de stock disponible, cantidades, descuentos y totales.
 * 
 * @param {Array} initialCart - Carrito inicial (por defecto vacío [])
 * @returns {Object} - Métodos y propiedades calculadas del carrito
 */
export function useCart(initialCart = []) {
  const [cart, setCart] = useState(initialCart);
  const [discount, setDiscount] = useState(0);

  const addToCart = useCallback((product) => {
    const availableStock = product.stockQuantity ?? product.currentStock ?? 0;
    if (availableStock <= 0) return false;

    let addedSuccessfully = true;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= availableStock) {
          alert(`No puedes agregar más unidades. Stock disponible: ${availableStock}.`);
          addedSuccessfully = false;
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    return addedSuccessfully;
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const availableStock = item.product.stockQuantity ?? item.product.currentStock ?? 0;
            const newQty = item.quantity + delta;

            if (newQty > availableStock) {
              alert(`Stock máximo disponible alcanzado: ${availableStock}.`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscount(0);
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = parseFloat(item.product.salePrice) || 0;
      return acc + price * item.quantity;
    }, 0);
  }, [cart]);

  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const sanitizedDiscount = Math.min(roundedSubtotal, Math.max(0, discount));
  const total = Math.round((roundedSubtotal - sanitizedDiscount) * 100) / 100;

  const totalItemsCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  return {
    cart,
    setCart,
    discount,
    setDiscount,
    subtotal: roundedSubtotal,
    discountTotal: sanitizedDiscount,
    total,
    totalItemsCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
