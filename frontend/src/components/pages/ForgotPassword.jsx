// Página para recuperar contraseña: permite enviar un email para restablecer la contraseña, con feedback e idioma alternable.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/api';
import { en } from '../../i18n/en';
import { es } from '../../i18n/es';
import './ForgotPassword.css';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Idioma desde localStorage (persistente)
  const lang = localStorage.getItem('lang') || 'EN';
  const t = lang === 'EN' ? en : es;

  // Estilo body especial para páginas auth
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  // Toggle idioma y recarga
  const handleLangToggle = () => {
    const newLang = lang === 'EN' ? 'ES' : 'EN';
    localStorage.setItem('lang', newLang);
    window.location.reload();
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.forgot.errors.invalid);
      return;
    }

    try {
      const resp = await forgotPassword({ email });
      setMessage(resp.data?.message || t.forgot.success);
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setError(t.forgot.errors.tooMany);
      } else if (status === 404) {
        setError(t.forgot.errors.notFound);
      } else {
        setError(err.response?.data?.message || t.forgot.errors.general);
      }
    }
  };

  return (
    <div className="forgot-container">
      <h2>{t.forgot.title}</h2>

      {/* Botón idioma debajo del título */}
      <div className="auth-lang-toggle">
        <button onClick={handleLangToggle}>{lang}</button>
      </div>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <form onSubmit={handleSubmit} className="forgot-form">
        <label>
          {t.forgot.email}
          <input
            type="email"
            placeholder={t.forgot.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="submit-btn">
          {t.forgot.submit}
        </button>
      </form>

      <div className="auth-footer">
        <Link to="/login" className="back-btn">← {t.forgot.back}</Link>
      </div>
    </div>
  );
}
