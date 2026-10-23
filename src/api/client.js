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
};
