import axios from 'axios';

// URL base del backend local
const BASE_URL = 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token en cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores globales
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si la API devuelve un 401 Unauthorized, podríamos limpiar el token y redirigir
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Opcional: Redirigir al login si es necesario, 
      // pero la reactividad del AuthContext manejará la desconexión
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);
