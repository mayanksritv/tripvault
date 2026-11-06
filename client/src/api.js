import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, '');
const apiBaseUrl = normalizedApiUrl.endsWith('/api') ? normalizedApiUrl : `${normalizedApiUrl}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tripvault_token') || sessionStorage.getItem('tripvault_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Let Axios set the multipart boundary for FormData uploads.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }
  return config;
});

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.code === 'ECONNABORTED') return 'The server is taking too long to respond. Please try again.';
  if (!error?.response) return 'Could not reach the TripVault API. Check your internet connection and the configured backend URL.';
  return error.response.data?.message || fallback;
}

export default api;
