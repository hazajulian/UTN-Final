// Configuración y funciones HTTP de la API REST de LoL. 
// Incluye manejo de token y endpoints principales para el frontend.

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

// Interceptor: agrega token de autorización si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- ENDPOINTS DE AUTENTICACIÓN Y UTILIDADES ---

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register({ username, email, password }) {
  const { data } = await api.post('/auth/register', { username, email, password });
  return data;
}

export function forgotPassword({ email }) {
  return api.post('/auth/forgot-password', { email });
}

export function resetPassword({ token, newPassword, confirmPassword }) {
  return api.post('/auth/reset-password', { token, newPassword, confirmPassword });
}

export function sendContact({ subject, message }) {
  return api.post('/contact', { subject, message });
}
