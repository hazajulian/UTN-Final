// Barra de navegación principal con menú responsive, cambio de idioma, tema y perfil de usuario.
// Utiliza ThemeContext para dark/light mode y AuthContext para mostrar opciones según login.

import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Assets (iconos y logos)
import logoSrc    from '../assets/icon.png';
import btnSrc     from '../assets/btn.png';
import sunSrc     from '../assets/sun.png';
import nightSrc   from '../assets/night.png';
import profileSrc from '../assets/profile.png';
import worldSrc   from '../assets/world.png';
import stickSrc   from '../assets/stick.png';
import picoSrc    from '../assets/pico.png';

// Traducciones
import { en } from '../i18n/en';
import { es } from '../i18n/es';

import './Navbar.css';

export function Navbar({ lang, setLang }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [flash, setFlash] = useState(false);

  const dropdownRef = useRef();
  const menuRef = useRef();

  // Cierra dropdown y hamburguesa al clickear fuera
  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cambia idioma y lo guarda en localStorage
  const handleLanguageToggle = () => {
    const newLang = lang === 'EN' ? 'ES' : 'EN';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  // Acceso a perfil/login
  const handleProfileClick = () => user ? navigate('/profile') : navigate('/login');
  const handleDropdownToggle = () => setDropdownOpen(o => !o);

  // Logout con feedback visual
  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setFlash(true);
    navigate('/');
    setTimeout(() => setFlash(false), 3000);
  };

  const t = lang === 'EN' ? en : es;

  return (
    <>
      <nav className="nav-bar" ref={menuRef}>
        {/* IZQUIERDA: Logo + Botón Play */}
        <div className="nav-left">
          <Link to="/">
            <img src={logoSrc} alt="LoL Logo" className="nav-logo" />
          </Link>
          <a
            className="nav-play-btn"
            href="https://signup.leagueoflegends.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={btnSrc} alt={t.navbar.playNow} className="nav-play-icon" />
            <span className="nav-play-label">{t.navbar.playNow}</span>
          </a>
        </div>

        {/* MENÚ HAMBURGUESA (responsive) */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        {/* CENTRO: Links siempre visibles en desktop */}
        <div className="nav-center">
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            {t.navbar.champions}
          </Link>
          <span className="nav-sep">|</span>
          <Link to="/create-champion" className="nav-link" onClick={() => setMenuOpen(false)}>
            {t.navbar.createChampion}
          </Link>
        </div>

        {/* DERECHA: Menú responsive, idioma, tema y perfil */}
        <div className={`nav-right ${menuOpen ? 'open' : ''}`}>
          {/* Menú hamburguesa (mobile) */}
          {menuOpen && (
            <div className="nav-menuhbr-links">
              <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
                {t.navbar.champions}
              </Link>
              <span className="nav-sep">|</span>
              <Link to="/create-champion" className="nav-link" onClick={() => setMenuOpen(false)}>
                {t.navbar.createChampion}
              </Link>
            </div>
          )}

          {/* Botón de idioma */}
          <button className="nav-icon-btn nav-lang-btn" onClick={handleLanguageToggle}>
            <img src={worldSrc} alt="Language" className="nav-lang-icon" />
            <span className="nav-lang-label">{lang}</span>
          </button>

          {/* Botón de tema claro/oscuro */}
          <button className="nav-icon-btn nav-theme-btn" onClick={toggleTheme}>
            <img
              src={theme === 'light' ? nightSrc : sunSrc}
              alt="Toggle theme"
              className="nav-theme-icon"
            />
          </button>

          {/* Perfil y dropdown */}
          <div className="nav-profile" ref={dropdownRef}>
            <button className="nav-icon-btn" onClick={handleProfileClick}>
              <img src={profileSrc} alt="Profile" className="nav-profile-icon" />
            </button>
            <img src={stickSrc} alt="Divisor" className="nav-stick" />
            <img src={picoSrc} alt="Dropdown" className="nav-pico" onClick={handleDropdownToggle} />

            {dropdownOpen && (
              <ul className="nav-dropdown">
                <li>
                  <Link to="/swagger" className="nav-dropdown-link" onClick={() => setDropdownOpen(false)}>
                    {t.navbar.swagger}
                  </Link>
                </li>
                {user ? (
                  <li>
                    <button onClick={handleLogout} className="nav-dropdown-btn">
                      {t.navbar.logout}
                    </button>
                  </li>
                ) : (
                  <li>
                    <Link to="/login" className="nav-dropdown-link" onClick={() => setDropdownOpen(false)}>
                      {t.navbar.login}
                    </Link>
                  </li>
                )}
                <li>
                  <Link to="/contact" className="nav-dropdown-link" onClick={() => setDropdownOpen(false)}>
                    {t.navbar.help}
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>

      {/* Mensaje flash tras logout */}
      {flash && (
        <div className="flash-message">
          {t.navbar.userLoggedOut}
        </div>
      )}
    </>
  );
}
