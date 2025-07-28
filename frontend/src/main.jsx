// Entry point principal de la app LoL Champions.
// Renderiza la aplicación dentro de BrowserRouter y el contexto de autenticación.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import App from './App';

// Reset global de estilos
import './reset.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // Envolvemos toda la app con el router y el provider de autenticación
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
