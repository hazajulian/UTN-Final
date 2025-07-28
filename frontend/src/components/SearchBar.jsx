// Barra de búsqueda reutilizable con soporte multilenguaje y custom icon.
// Permite buscar campeones (o cualquier dato) desde un input controlado.

import React, { useRef } from 'react';
import './SearchBar.css';

// Icono de búsqueda personalizado
import searchIcon from '../assets/lupa.png';

// Textos multilenguaje
import { en } from '../i18n/en';
import { es } from '../i18n/es';

export function SearchBar({
  value,       // Valor actual del input
  onChange,    // Callback para actualizar valor
  lang = 'EN', // Idioma de la UI
  className = ''
}) {
  const inputRef = useRef(null);
  const t = lang === 'EN' ? en : es;

  return (
    <div className={`search-bar ${className}`}>
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={t.searchBar.placeholder}
      />
      <img
        src={searchIcon}
        alt={t.searchBar.placeholder}
        className="search-icon"
        onClick={() => inputRef.current?.focus()} // Focus al input al clickear la lupa
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
}
