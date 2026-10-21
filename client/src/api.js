import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tripvault_token') || sessionStorage.getItem('tripvault_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.code === 'ECONNABORTED') return 'The server is taking too long to respond. Please try again.';
  if (!error?.response) return 'Could not reach TripVault. Check that the backend is running on port 5000.';
  return error.response.data?.message || fallback;
}

export default api;
