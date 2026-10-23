import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

/**
 * Hook personalizado para gestionar el catálogo de productos,
 * categorías asociadas, paginación, filtros de estado y alternancia activo/inactivo.
 * 
 * @param {Object} initialFilters - Filtros iniciales de búsqueda y paginación
 * @returns {Object} - Estado y funciones operativas del catálogo
 */
export function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState(initialFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || 'all');
  const [page, setPage] = useState(initialFilters.page || 1);
  const [togglingId, setTogglingId] = useState(null);

  // Carga de categorías
  const loadCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.data || []);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  }, []);

  // Carga de productos según filtros
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 15,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(selectedCategory ? { categoryId: selectedCategory } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      };

      const res = await api.getProducts(params);
      setProducts(res.data.products || []);
      setMeta(res.data.meta || { total: 0, page: 1, limit: 15, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Error al obtener productos.');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, statusFilter]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Alternar estado activo / inactivo
  const toggleProductStatus = async (product) => {
    setTogglingId(product.id);
    try {
      const newStatus = !product.isActive;
      await api.toggleProductStatus(product.id, newStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: newStatus } : p))
      );
    } catch (err) {
      alert(err.message || 'No se pudo cambiar el estado del producto.');
      await loadProducts();
    } finally {
      setTogglingId(null);
    }
  };

  return {
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
    refreshProducts: loadProducts,
    refreshCategories: loadCategories,
  };
}
