// Detalle de campeón: muestra toda la información, skins, habilidades, stats, traducciones y favorito.
// Permite añadir/eliminar de favoritos y soporta traducción manual (EN/ES).

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { useAuth } from '../../context/AuthContext';

// Traducciones globales y específicas del campeón
import { en } from '../../i18n/en';
import { es } from '../../i18n/es';
import { champions_es } from '../../i18n/champions_es';

// Iconos (favorito, flechas)
import {
  FaHeart, FaRegHeart,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import './ChampionDetail.css';

const PLACEHOLDER_IMG = "https://static.thenounproject.com/png/104062-200.png";

export default function ChampionDetail({ lang = 'EN' }) {
  const { id } = useParams();
  const { user } = useAuth();
  const t = lang === 'ES' ? es : en;
  const champTranslations = lang === 'ES' ? champions_es : null;
  const favKey = user ? `favorites_${user.id}` : null;

  const [champ, setChamp] = useState(null);
  const [currentSkin, setCurrentSkin] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [toast, setToast] = useState('');

  // Carga los datos del campeón desde la API
  useEffect(() => {
    axios.get(`http://localhost:3010/api/v1/champions/${id}`)
      .then(res => {
        const data = res.data;
        if (data.skins?.[0]?.name === 'default') {
          data.skins[0].name = data.name;
        }
        setChamp(data);
      })
      .catch(() => setChamp(null));
  }, [id]);

  // Lee favoritos del localStorage y setea el estado
  useEffect(() => {
    if (!favKey) return;
    const favs = JSON.parse(localStorage.getItem(favKey)) || [];
    setIsFav(favs.includes(id));
  }, [id, favKey]);

  // Añadir o quitar de favoritos (con feedback)
  const toggleFav = () => {
    if (!favKey) {
      showToast(t.createChampion?.mustBeLoggedIn);
      return;
    }
    const favs = JSON.parse(localStorage.getItem(favKey)) || [];
    let next, msg;
    if (isFav) {
      next = favs.filter(x => x !== id);
      msg = t.championDetail?.removeFromFavorites || 'Champion removed from favorites';
    } else {
      next = [...favs, id];
      msg = t.championDetail?.addToFavorites || 'Champion added to favorites';
    }
    localStorage.setItem(favKey, JSON.stringify(next));
    setIsFav(!isFav);
    showToast(msg);
  };

  // Feedback visual para acciones (toast)
  const showToast = txt => {
    setToast(txt);
    setTimeout(() => setToast(''), 2000);
  };

  if (!champ) {
    return <div className="cd-loading">{t.championDetail?.loading || 'Loading champion…'}</div>;
  }

  // Traducción manual del campeón si está en español
  const translatedChamp = champTranslations?.[id] || {};

  // Skins traducidas si corresponde
  let mappedSkins = champ.skins || [];
  if (
    lang === "ES" &&
    translatedChamp.skins &&
    mappedSkins.length === translatedChamp.skins.length
  ) {
    mappedSkins = mappedSkins.map((skin, i) => ({
      ...skin,
      name: translatedChamp.skins[i]
    }));
  }

  // Info básica traducida si corresponde
  const region    = translatedChamp.basicInfo?.region || champ.region;
  const roles     = translatedChamp.basicInfo?.roles || champ.roles || [];
  const positions = translatedChamp.basicInfo?.positions || champ.positions || [];

  const name      = champ.name;
  const title     = translatedChamp.title || champ.title;
  const lore      = translatedChamp.lore || champ.lore;
  const allytips  = translatedChamp.allytips || champ.allytips || [];
  const enemytips = translatedChamp.enemytips || champ.enemytips || [];

  // Traducción de habilidades
  const abilities = (() => {
    const orig = champ.abilities || { passive: {}, spells: [] };
    const tr = translatedChamp.abilities || {};

    const passive = {
      ...orig.passive,
      ...(tr.passive || {}),
      iconUrl: orig.passive?.iconUrl
    };

    const spells = (orig.spells || []).map((s, i) => ({
      ...s,
      ...(tr.spells?.[i] || {}),
      iconUrl: s.iconUrl
    }));

    return { passive, spells };
  })();

  const info = champ.info || {};
  const stats = champ.stats || {};

  // Manejo de skins y navegación
  const skinObj = mappedSkins[currentSkin] || {};
  const skinImg = skinObj.imageUrl || PLACEHOLDER_IMG;
  const skinName = skinObj.name || t.championDetail?.noName || "No name";

  const prevSkin = () =>
    setCurrentSkin(i => (mappedSkins.length === 0 ? 0 : i === 0 ? mappedSkins.length - 1 : i - 1));
  const nextSkin = () =>
    setCurrentSkin(i => (mappedSkins.length === 0 ? 0 : i === mappedSkins.length - 1 ? 0 : i + 1));

  // Dificultad (de 1 a 3 barras)
  let diff = info.difficulty || 0;
  let filledBars = diff <= 3 ? 1 : diff <= 6 ? 2 : 3;

  // Traducción de nombres de stats según idioma
  const translateStat = stat => {
    const ts = t.championDetail?.stats || {};
    return ts[stat] || stat;
  };

  return (
    <div className="cd-container">
      {/* Toast de feedback */}
      {toast && <div className="cd-toast">{toast}</div>}

      {/* HEADER: Nombre, título y favorito */}
      <header className="cd-header">
        <div>
          <h1 className="cd-name">{name}</h1>
          <p className="cd-title">{title}</p>
        </div>
        <button
          className="cd-fav-btn"
          onClick={toggleFav}
          title={isFav ? t.championDetail?.removeFromFavorites : t.championDetail?.addToFavorites}
        >
          {isFav ? <FaHeart /> : <FaRegHeart />}
        </button>
      </header>

      {/* SKINS */}
      <div className="cd-skins">
        <button className="cd-skin-nav prev" onClick={prevSkin}>
          <FaChevronLeft />
        </button>
        <img src={skinImg} alt={skinName} className="cd-skin-img" />
        <button className="cd-skin-nav next" onClick={nextSkin}>
          <FaChevronRight />
        </button>
        <p className="cd-skin-name">{skinName}</p>
      </div>

      {/* INFO BÁSICA + DIFICULTAD */}
      <div className="cd-info-diff">
        <section className="cd-basic-info">
          <h2>{t.championDetail?.basicInfo}</h2>
          <p><strong>{t.championDetail?.region}:</strong> {region}</p>
          <p><strong>{t.championDetail?.roles}:</strong> {roles.join(', ')}</p>
          <p><strong>{t.championDetail?.positions}:</strong> {positions.join(', ')}</p>
        </section>
        <section className="cd-difficulty">
          <h2>{t.championDetail?.difficulty}</h2>
          <div className="cd-diff-bars">
            {[1, 2, 3].map(n => (
              <span
                key={n}
                className={`cd-diff-bar${n <= filledBars ? ' filled' : ''}`}
              />
            ))}
          </div>
        </section>
      </div>

      {/* LORE */}
      <section className="cd-lore">
        <h2>{t.championDetail?.lore}</h2>
        <p>{lore || t.championDetail?.noLore}</p>
      </section>

      {/* TIPS */}
      <section className="cd-tips">
        <div className="cd-tip-list">
          <h2>{t.championDetail?.allyTips}</h2>
          <ul>
            {allytips.length
              ? allytips.map((tip, i) => <li key={i}>{tip}</li>)
              : <li>{t.championDetail?.noTips}</li>
            }
          </ul>
        </div>
        <div className="cd-tip-list">
          <h2>{t.championDetail?.enemyTips}</h2>
          <ul>
            {enemytips.length
              ? enemytips.map((tip, i) => <li key={i}>{tip}</li>)
              : <li>{t.championDetail?.noTips}</li>
            }
          </ul>
        </div>
      </section>

      {/* HABILIDADES */}
      <section className="cd-abilities">
        <h2>{t.championDetail?.abilities}</h2>
        <div className="cd-ability">
          <img
            src={abilities.passive?.iconUrl || PLACEHOLDER_IMG}
            alt={abilities.passive?.name || t.championDetail?.noName}
            className="cd-ability-icon"
          />
          <div>
            <h3>{t.championDetail?.passive}: {abilities.passive?.name || t.championDetail?.noName}</h3>
            <p>{abilities.passive?.description || t.championDetail?.noDescription}</p>
          </div>
        </div>
        {(abilities.spells || []).map((s, i) => (
          <div className="cd-ability" key={i}>
            <img
              src={s.iconUrl || PLACEHOLDER_IMG}
              alt={s.name || t.championDetail?.noName}
              className="cd-ability-icon"
            />
            <div>
              <h3>{['Q', 'W', 'E', 'R'][i]}: {s.name || t.championDetail?.noName}</h3>
              <p>{s.description || t.championDetail?.noDescription}</p>
            </div>
          </div>
        ))}
      </section>

      {/* STATS */}
      <section className="cd-stats-section">
        <div className="cd-stats-grid">
          {Object.entries(stats).map(([k, v]) => (
            <div className="cd-stat" key={k}>
              <span className="cd-stat-name">{translateStat(k)}</span>
              <span className="cd-stat-value">{v}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
