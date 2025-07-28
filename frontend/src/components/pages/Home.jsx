// Página principal: listado y explorador de campeones. Permite buscar, filtrar por posición, rol o región, y navegar a cada detalle.
// Soporta multilenguaje (EN/ES), favoritos y UX fluida.

import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../SearchBar';
import searchBg from '../../assets/searchbar.png';
import stickL from '../../assets/stickL.png';
import { useAuth } from '../../context/AuthContext';
import { en } from '../../i18n/en';
import { es } from '../../i18n/es';
import './Home.css';
import '../../styles/body.css';

// Opciones de filtros según idioma
const VIEW_OPTIONS_EN = [
  { value: 'all', label: 'All' },
  { value: 'positions', label: 'Positions' },
  { value: 'classes', label: 'Roles' },
  { value: 'regions', label: 'Regions' }
];
const VIEW_OPTIONS_ES = [
  { value: 'all', label: 'Todos' },
  { value: 'positions', label: 'Posiciones' },
  { value: 'classes', label: 'Roles' },
  { value: 'regions', label: 'Regiones' }
];

// Orden de posiciones y clases (roles)
const POSITION_ORDER = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
const CLASSES_ORDER = ['Assassin', 'Fighter', 'Mage', 'Marksman', 'Support', 'Tank'];

export default function Home({ lang = 'EN' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const storageKey = user ? `favorites_${user.id}` : 'favorites_guest';

  // Traducciones y filtros
  const t = lang === 'EN' ? en.home : es.home;
  const VIEW_OPTIONS = lang === 'EN' ? VIEW_OPTIONS_EN : VIEW_OPTIONS_ES;

  // Estados principales
  const [rawSearch, setRawSearch] = useState('');
  const [view, setView] = useState('all');
  const [allChamps, setAllChamps] = useState([]);
  const [champDetails, setChampDetails] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Cerrar menú de filtro al hacer click fuera
  useEffect(() => {
    const onClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Persistir favoritos
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, storageKey]);

  // Cargar todos los campeones (máximo 500)
  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('http://localhost:3010/api/v1/champions', { params: { page: 1, limit: 500 } })
      .then(res => {
        const data = res.data.data ?? res.data;
        setAllChamps(Array.isArray(data) ? data : []);
      })
      .catch(() => setError(t.errorLoad))
      .finally(() => setLoading(false));
  }, [t.errorLoad]);

  // Filtrar campeones por búsqueda
  const filteredChamps = useMemo(
    () =>
      allChamps.filter(ch =>
        ch.name.toLowerCase().includes(rawSearch.toLowerCase())
      ),
    [allChamps, rawSearch]
  );

  // Unicidad de resultados en búsqueda
  const uniqueSearchChamps = useMemo(() => {
    if (!rawSearch) return [];
    const map = {};
    filteredChamps.forEach(ch => { map[ch.id] = ch; });
    return Object.values(map);
  }, [filteredChamps, rawSearch]);

  // Si la vista es "roles", traigo detalles de cada campeón (para agrupar)
  useEffect(() => {
    if (view !== 'classes') {
      setChampDetails([]);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all(
      filteredChamps.map(ch =>
        axios.get(`http://localhost:3010/api/v1/champions/${ch.id}`).then(r => r.data)
      )
    )
      .then(details => setChampDetails(details))
      .catch(() => setError(t.errorLoad))
      .finally(() => setLoading(false));
  }, [view, filteredChamps, t.errorLoad]);

  // Agrupar por región (para la vista regions)
  const regionGroups = useMemo(() => {
    const groups = {};
    filteredChamps.forEach(ch => {
      const r = ch.region || 'Unknown';
      (groups[r] = groups[r] || []).push(ch);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredChamps]);

  // Agrupar por rol/clase (para la vista classes)
  const classGroups = useMemo(() => {
    const map = {};
    champDetails.forEach(ch =>
      (ch.roles || []).forEach(role => {
        (map[role] = map[role] || []).push(ch);
      })
    );
    return CLASSES_ORDER.filter(c => map[c]).map(c => [c, map[c]]);
  }, [champDetails]);

  // Navegar a detalle
  const goToDetail = id => {
    navigate(`/champions/${id}`);
  };

  // Traducción de etiquetas (posición, clase, región)
  const translatePosition = pos => {
    switch (pos) {
      case 'Top': return t.positionTop;
      case 'Jungle': return t.positionJungle;
      case 'Mid': return t.positionMid;
      case 'ADC': return t.positionADC;
      case 'Support': return t.positionSupport;
      default: return pos.toUpperCase();
    }
  };
  const translateClass = cls => {
    switch (cls) {
      case 'Assassin': return t.roleAssassin;
      case 'Fighter': return t.roleFighter;
      case 'Mage': return t.roleMage;
      case 'Marksman': return t.roleMarksman;
      case 'Support': return t.roleSupport;
      case 'Tank': return t.roleTank;
      default: return cls.toUpperCase();
    }
  };
  const translateRegion = region => {
    switch (region) {
      case 'Bandle City': return t.regionBandle;
      case 'Bilgewater': return t.regionBilge;
      case 'Demacia': return t.regionDemacia;
      case 'Freljord': return t.regionFreljord;
      case 'Ionia': return t.regionIonia;
      case 'Ixtal': return t.regionIxtal;
      case 'Noxus': return t.regionNoxus;
      case 'Piltover': return t.regionPiltover;
      case 'Shadow Isles': return t.regionShadow;
      case 'Shurima': return t.regionShurima;
      case 'Targon': return t.regionTargon;
      case 'Zaun': return t.regionZaun;
      case 'Runeterra': return t.regionRuneterra;
      case 'Void': return t.regionVoid;
      default: return region.toUpperCase();
    }
  };

  return (
    <main className="home">
      <div className='home-container'>
        <img src={stickL} className='home-stick' alt="|" />
        <h1 className="home-title">{t.title}</h1>
        <img src={stickL} className='home-stick' alt="|" />
      </div>

      <div className="search-container">
        <img src={searchBg} alt="decoración" className="search-bg" />
        <div className="search-overlay">
          {/* Dropdown filtro */}
          <div className="filter-dropdown" ref={dropdownRef}>
            <button
              className="filter-btn"
              onClick={() => setOpen(o => !o)}
            >
              {VIEW_OPTIONS.find(o => o.value === view).label}
            </button>
            {open && (
              <ul className="filter-list">
                {VIEW_OPTIONS
                  .filter(opt => opt.value !== view)
                  .map(opt => (
                    <li
                      key={opt.value}
                      className="filter-list-item"
                      onClick={e => {
                        e.stopPropagation();
                        setView(opt.value);
                        setOpen(false);
                      }}
                    >
                      {opt.label}
                    </li>
                  ))
                }
              </ul>
            )}
          </div>
          <SearchBar
            value={rawSearch}
            onChange={setRawSearch}
            lang={lang}
            placeholder={t.searchPlaceholder}
            className="search-bar"
          />
        </div>
      </div>

      {/* Estados de carga y error */}
      {loading && <p className="home-loading">{t.loading}</p>}
      {error && <p className="home-error">{error}</p>}

      {/* Renderizado según búsqueda y filtro */}
      {!loading && !error && (
        <>
          {rawSearch ? (
            <section className="home-grid">
              {uniqueSearchChamps.map(ch => (
                <article
                  key={ch.id}
                  className="home-card"
                  onClick={() => goToDetail(ch.id)}
                >
                  <img src={ch.iconUrl} alt={ch.name} className="home-img" />
                </article>
              ))}
              {uniqueSearchChamps.length === 0 && <p>{t.noChampionsFound}</p>}
            </section>
          ) : (
            <>
              {/* Vista ALL */}
              {view === 'all' && (
                <section className="home-grid">
                  {filteredChamps.map(ch => (
                    <article
                      key={ch.id}
                      className="home-card"
                      onClick={() => goToDetail(ch.id)}
                    >
                      <img src={ch.iconUrl} alt={ch.name} className="home-img" />
                    </article>
                  ))}
                </section>
              )}

              {/* Vista por posiciones */}
              {view === 'positions' && POSITION_ORDER.map(pos => (
                <div key={pos} className="home-section">
                  <h2 className="home-section-title">{translatePosition(pos)}</h2>
                  <div className="home-section-grid">
                    {filteredChamps
                      .filter(ch => (ch.positions || []).includes(pos))
                      .map(ch => (
                        <article
                          key={ch.id}
                          className="home-card"
                          onClick={() => goToDetail(ch.id)}
                        >
                          <img src={ch.iconUrl} alt={ch.name} className="home-img" />
                        </article>
                      ))
                    }
                  </div>
                </div>
              ))}

              {/* Vista por regiones */}
              {view === 'regions' && regionGroups.map(([region, champs]) => (
                <div key={region} className="home-section">
                  <h2 className="home-section-title">{translateRegion(region)}</h2>
                  <div className="home-section-grid">
                    {champs.map(ch => (
                      <article
                        key={ch.id}
                        className="home-card"
                        onClick={() => goToDetail(ch.id)}
                      >
                        <img src={ch.iconUrl} alt={ch.name} className="home-img" />
                      </article>
                    ))}
                  </div>
                </div>
              ))}

              {/* Vista por roles */}
              {view === 'classes' && classGroups.map(([cls, champs]) => (
                <div key={cls} className="home-section">
                  <h2 className="home-section-title">{translateClass(cls)}</h2>
                  <div className="home-section-grid">
                    {champs.map(ch => (
                      <article
                        key={ch.id}
                        className="home-card"
                        onClick={() => goToDetail(ch.id)}
                      >
                        <img src={ch.iconUrl} alt={ch.name} className="home-img" />
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </main>
  );
}
