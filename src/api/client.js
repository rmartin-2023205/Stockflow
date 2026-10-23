/**
 * Centralized API client for StockFlow
 */
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiClient(endpoint, options = {}) {
  const { body, headers, ...customConfig } = options;

  const config = {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
    ...customConfig,
  };

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data?.error?.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.details = data?.error?.details || null;
      error.code = data?.error?.code || 'API_ERROR';
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = new Error('No se pudo conectar con el servidor de la API.');
      networkError.code = 'NETWORK_ERROR';
      throw networkError;
    }
    throw err;
  }
}

export const api = {
  get: (endpoint, options) => apiClient(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'POST', body }),
  patch: (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => apiClient(endpoint, { ...options, method: 'DELETE' }),
  checkHealth: () => apiClient('/health'),
  
  // Auth endpoints
  login: (credentials) => apiClient('/auth/login', { body: credentials, method: 'POST' }),
  register: (data) => apiClient('/auth/register', { body: data, method: 'POST' }),
  logout: () => apiClient('/auth/logout', { method: 'POST' }),
  getMe: () => apiClient('/auth/me', { method: 'GET' }),

  // Categories endpoints
  getCategories: () => apiClient('/categories'),
  createCategory: (data) => apiClient('/categories', { body: data, method: 'POST' }),
  updateCategory: (id, data) => apiClient(`/categories/${id}`, { body: data, method: 'PATCH' }),
  deleteCategory: (id) => apiClient(`/categories/${id}`, { method: 'DELETE' }),

  // Products endpoints
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const qs = query.toString();
    return apiClient(`/products${qs ? `?${qs}` : ''}`);
  },
  getProductById: (id) => apiClient(`/products/${id}`),
  createProduct: (data) => apiClient('/products', { body: data, method: 'POST' }),
  updateProduct: (id, data) => apiClient(`/products/${id}`, { body: data, method: 'PATCH' }),
  toggleProductStatus: (id, isActive) => apiClient(`/products/${id}/status`, { body: { isActive }, method: 'PATCH' }),

  // Inventory endpoints
  getInventorySummary: () => apiClient('/inventory/summary'),
  getLowStockProducts: () => apiClient('/inventory/low-stock'),
  getStockMovements: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const qs = query.toString();
    return apiClient(`/inventory/movements${qs ? `?${qs}` : ''}`);
  },
  createStockMovement: (data) => apiClient('/inventory/movements', { body: data, method: 'POST' }),

  // Sales & POS endpoints
  getSales: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const qs = query.toString();
    return apiClient(`/sales${qs ? `?${qs}` : ''}`);
  },
  getSaleById: (id) => apiClient(`/sales/${id}`),
  createSale: (data) => apiClient('/sales', { body: data, method: 'POST' }),
  cancelSale: (id, reason) => apiClient(`/sales/${id}/cancel`, { body: { reason }, method: 'POST' }),

  // Reports & Analytics
  getReports: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const qs = query.toString();
    return apiClient(`/reports${qs ? `?${qs}` : ''}`);
  },

  // Dashboard & Real-Time Overview
  getDashboardSummary: () => apiClient('/dashboard/summary'),

  // Staff & Members
  getMembers: () => apiClient('/organizations/members'),
  addMember: (data) => apiClient('/organizations/members', { body: data, method: 'POST' }),
  removeMember: (membershipId) => apiClient(`/organizations/members/${membershipId}`, { method: 'DELETE' }),
};

