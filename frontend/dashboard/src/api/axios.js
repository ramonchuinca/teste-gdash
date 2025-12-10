import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const instance = axios.create({
  baseURL: API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',   // ← OBRIGATÓRIO!
    'Accept': 'application/json',
  },
});

// Interceptor do token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
