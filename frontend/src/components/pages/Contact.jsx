// Página de contacto: permite a los usuarios logueados enviar mensajes al soporte. Muestra links sociales y feedback de estado.

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sendContact } from '../../services/api'; // Envía mensaje al backend
import './Contact.css';

// Traducciones
import { en } from '../../i18n/en';
import { es } from '../../i18n/es';

export default function Contact() {
  const { user } = useAuth();

  // Idioma persistente
  const lang = localStorage.getItem('lang') || 'EN';
  const t = lang === 'EN' ? en : es;

  // Estados del formulario
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null); // 'success', 'auth', 'error' o mensaje custom
  const [loading, setLoading] = useState(false);

  // Enviar mensaje
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await sendContact({ subject, message });
      setStatus('success');
      setSubject('');
      setMessage('');
    } catch (err) {
      if (err.response?.status === 401) setStatus('auth');
      else setStatus(err.response?.data?.message || 'error');
    }
    setLoading(false);
  };

  return (
    <div className="contact-container">
      <h1>{t.contact.title}</h1>

      {/* Aviso si no está logueado */}
      {!user && (
        <p
          className="login-note"
          dangerouslySetInnerHTML={{ __html: t.contact.loginNote }}
        />
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="contact-form">
        <label>
          {t.contact.subject}
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
            disabled={!user || loading}
            maxLength={64}
          />
        </label>
        <label>
          {t.contact.message}
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={6}
            required
            disabled={!user || loading}
            maxLength={1000}
          />
        </label>
        <button type="submit" disabled={!user || loading}>
          {loading ? t.contact.sending : t.contact.send}
        </button>

        {/* Estado */}
        {status === 'success' && <p className="success">{t.contact.success}</p>}
        {status === 'auth'    && <p className="error">{t.contact.authError}</p>}
        {status === 'error'   && <p className="error">{t.contact.error}</p>}
        {typeof status === 'string' && !['success', 'auth', 'error'].includes(status) && (
          <p className="error">{status}</p>
        )}
      </form>

      {/* Redes sociales */}
      <div className="social-links">
        <a href="https://www.youtube.com/leagueoflegends" target="_blank" rel="noopener noreferrer" className="social-btn youtube">
          {t.contact.social.youtube}
        </a>
        <a href="https://www.leagueoflegends.com/es-mx" target="_blank" rel="noopener noreferrer" className="social-btn website">
          {t.contact.social.website}
        </a>
        <a href="https://www.instagram.com/leagueoflegends" target="_blank" rel="noopener noreferrer" className="social-btn instagram">
          {t.contact.social.instagram}
        </a>
        <a href="https://twitter.com/LeagueOfLegends" target="_blank" rel="noopener noreferrer" className="social-btn twitter">
          {t.contact.social.twitter}
        </a>
      </div>
    </div>
  );
}
