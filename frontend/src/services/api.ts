import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem('ambapari_user');
  if (user) {
    try {
      const { token } = JSON.parse(user);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch { /* corrupted localStorage entry */ }
  }
  return config;
});

export default api;
