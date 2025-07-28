// Página de reseteo de contraseña: permite establecer una nueva contraseña a través de un token. 
// Feedback en tiempo real, alternancia de idioma y controles accesibles.

import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/api';
import { en } from '../../i18n/en';
import { es } from '../../i18n/es';
import './ResetPassword.css';

// Hook para obtener el query param ?token=
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function ResetPassword() {
  const query = useQuery();
  const navigate = useNavigate();
  const token = query.get('token') || '';

  // Estados del form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Traducciones y idioma persistente
  const lang = localStorage.getItem('lang') || 'EN';
  const t = lang === 'EN' ? en : es;

  // Estilo auth-page global
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  // Alternar idioma y recargar
  const handleLangToggle = () => {
    const newLang = lang === 'EN' ? 'ES' : 'EN';
    localStorage.setItem('lang', newLang);
    window.location.reload();
  };

  // Envío de nueva contraseña
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 4) {
      setError(t.reset.errors.short);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.reset.errors.mismatch);
      return;
    }

    try {
      const resp = await resetPassword({ token, newPassword, confirmPassword });
      setMessage(resp.data?.message || t.reset.success);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        setError(err.response.data.message || t.reset.errors.invalid);
      } else {
        setError(err.response?.data?.message || t.reset.errors.general);
      }
    }
  };

  return (
    <div className="reset-container">
      <h2>{t.reset.title}</h2>

      {/* Botón de idioma debajo del título */}
      <div className="auth-lang-toggle">
        <button onClick={handleLangToggle}>{lang}</button>
      </div>

      {error && <div className="error-reset">{error}</div>}
      {message && <div className="success-reset">{message}</div>}

      {/* Form solo si no hay mensaje de éxito */}
      {!message && (
        <form onSubmit={handleSubmit} className="reset-form">
          <label>
            {t.reset.newPass}
            <div className="input-group">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder={t.reset.placeholder1}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-pass-btn"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? t.reset.hide : t.reset.show}
              >
                {showPass ? t.reset.hide : t.reset.show}
              </button>
            </div>
          </label>

          <label>
            {t.reset.confirmPass}
            <input
              type={showPass ? 'text' : 'password'}
              placeholder={t.reset.placeholder2}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="submit-btn">
            {t.reset.submit}
          </button>
        </form>
      )}

      {/* Footer para volver a login */}
      <div className="auth-footer">
        <Link to="/login" className="back-btn">← {t.reset.back}</Link>
      </div>
    </div>
  );
}
