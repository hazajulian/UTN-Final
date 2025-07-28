// Página de inicio de sesión: permite loguear usuarios, mostrar errores, alternar idioma y moverse a registro o modo invitado.

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { en } from '../../i18n/en';
import { es } from '../../i18n/es';
import './Login.css';

export function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  // Idioma persistente
  const lang = localStorage.getItem('lang') || 'EN';
  const t = lang === 'EN' ? en : es;

  // Estilo auth-page global
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  // Login con feedback de error
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t.login.error);
    }
  };

  // Alternar idioma (EN/ES)
  const handleLangToggle = () => {
    const newLang = lang === 'EN' ? 'ES' : 'EN';
    localStorage.setItem('lang', newLang);
    window.location.reload();
  };

  return (
    <div className="login-container">
      <h2>{t.login.title}</h2>

      {/* Botón de idioma debajo del título */}
      <div className="auth-lang-toggle">
        <button onClick={handleLangToggle}>
          {lang}
        </button>
      </div>

      {error && <div className="error-login">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <label>
          {t.login.email}
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          {t.login.password}
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">{t.login.signIn}</button>
      </form>

      <Link to="/forgot-password" className="link-forgot">
        {t.login.forgot}
      </Link>

      <div className="auth-actions">
        <button
          type="button"
          className="auth-btn"
          onClick={() => navigate('/')}
        >
          {t.login.guest}
        </button>
        <button
          type="button"
          className="auth-btn"
          onClick={() => navigate('/register')}
        >
          {t.login.register}
        </button>
      </div>
    </div>
  );
}
