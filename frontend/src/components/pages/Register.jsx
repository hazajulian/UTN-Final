// Página de registro de usuario: permite crear cuenta, validando campos y alternando idioma, con feedback visual y navegación rápida.

import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { en } from '../../i18n/en';
import { es } from '../../i18n/es';
import './Register.css';

export function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors]   = useState({
    username: '',
    email: '',
    password: ''
  });

  // Idioma persistente
  const lang = localStorage.getItem('lang') || 'EN';
  const t = lang === 'EN' ? en : es;

  // Estilo auth-page global
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  // Alternar idioma
  const handleLangToggle = () => {
    const newLang = lang === 'EN' ? 'ES' : 'EN';
    localStorage.setItem('lang', newLang);
    window.location.reload();
  };

  // Validación cliente simple
  const validateClient = () => {
    const errs = { username: '', email: '', password: '' };
    let ok = true;

    if (!username.trim()) {
      errs.username = t.register.errors.username;
      ok = false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = t.register.errors.email;
      ok = false;
    }
    if (password.length < 4) {
      errs.password = t.register.errors.password;
      ok = false;
    }

    setFieldErrors(errs);
    return ok;
  };

  // Envío del formulario y feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validateClient()) return;

    try {
      await register({ username, email, password });
      navigate('/login');
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors && Array.isArray(resp.errors)) {
        const errs = { username: '', email: '', password: '' };
        resp.errors.forEach(({ field, message }) => {
          if (errs[field] !== undefined) errs[field] = message;
        });
        setFieldErrors(errs);
      } else if (resp?.message) {
        setGeneralError(resp.message);
      } else {
        setGeneralError(t.register.errors.general);
      }
    }
  };

  return (
    <div className="register-container">
      <h2>{t.register.title}</h2>

      {/* Botón de idioma debajo del título */}
      <div className="auth-lang-toggle">
        <button onClick={handleLangToggle}>
          {lang}
        </button>
      </div>

      {generalError && <div className="error general">{generalError}</div>}

      <form onSubmit={handleSubmit} className="register-form">
        {/* Username */}
        <label>
          {t.register.username}
          <input
            type="text"
            placeholder={t.register.placeholders.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {fieldErrors.username && (
            <span className="field-error">{fieldErrors.username}</span>
          )}
        </label>

        {/* Email */}
        <label>
          {t.register.email}
          <input
            type="email"
            placeholder={t.register.placeholders.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {fieldErrors.email && (
            <span className="field-error">{fieldErrors.email}</span>
          )}
        </label>

        {/* Password + toggle */}
        <label>
          {t.register.password}
          <div className="input-group">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder={t.register.placeholders.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-pass-btn"
              onClick={() => setShowPass(!showPass)}
              aria-label={showPass ? t.register.hide : t.register.show}
            >
              {showPass ? t.register.hide : t.register.show}
            </button>
          </div>
          {fieldErrors.password && (
            <span className="field-error">{fieldErrors.password}</span>
          )}
        </label>

        <button type="submit" className="submit-btn">
          {t.register.signUp}
        </button>
      </form>

      {/* Footer con link a login */}
      <div className="auth-footer">
        <Link to="/login" className="back-btn">← {t.register.back}</Link>
      </div>
    </div>
  );
}
