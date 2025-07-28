// Contexto de autenticación: gestiona usuario y token, con persistencia local y helpers para login/register/logout.

import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Usuario y token persistidos en localStorage para mantener sesión entre recargas
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  // Sincroniza user con localStorage
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // Sincroniza token con localStorage
  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  // Login: guarda usuario y token tras autenticarse
  async function login(credentials) {
    const data = await apiLogin(credentials);
    setUser(data.user);
    setToken(data.token);
    return data.user;
  }

  // Register: crea usuario (pero no loguea automáticamente)
  async function register(credentials) {
    const data = await apiRegister(credentials);
    return data;
  }

  // Logout: limpia sesión
  function logout() {
    setUser(null);
    setToken('');
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      setUser,
      setToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook para acceder al contexto fácilmente
export function useAuth() {
  return useContext(AuthContext);
}
