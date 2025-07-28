// Pie de página con links a contacto y documentación de la API, con soporte multilenguaje.

import React from 'react';
import { Link } from 'react-router-dom';

// Traducciones
import { en } from '../i18n/en';
import { es } from '../i18n/es';

import './Footer.css';

export function Footer({ lang = 'EN' }) {
  const t = lang === 'EN' ? en : es;

  return (
    <footer className="footer">
      <Link to="/contact">{t.footer.contact}</Link>
      <span> | </span>
      <Link to="/swagger">{t.footer.apiDocs}</Link>
    </footer>
  );
}
