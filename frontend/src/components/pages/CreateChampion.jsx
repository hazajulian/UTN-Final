// Formulario para crear un campeón custom, con opciones completas, validaciones y soporte multilenguaje.

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

import './CreateChampion.css';

// Traducciones
import { en } from '../../i18n/en';
import { es } from '../../i18n/es';

// Opciones posibles de región, rol y posición
const REGION_OPTIONS = [
  'Demacia','Noxus','Ionia','Piltover & Zaun','Freljord','Shurima',
  'Shadow Isles','Bilgewater','Targon','Bandle City','Ixtal','Runeterra'
];
const ROLE_OPTIONS = [
  'Assassin','Fighter','Mage','Marksman','Support','Tank'
];
const POSITION_OPTIONS = ['Top','Jungle','Mid','ADC','Support'];

const DEFAULT_ICON = 'https://static.wikia.nocookie.net/leagueoflegends/images/6/6c/Champion.png';

export default function CreateChampion({ lang = 'EN' }) {
  const { user, token } = useAuth();
  const t = lang === 'EN' ? en : es;

  // Estado principal del formulario
  const [form, setForm] = useState({
    id: '',
    name: '',
    title: '',
    region: '',
    roles: [],
    positions: [],
    difficulty: 1,
    iconUrl: '',
    skins: [],
    lore: '',
    allytips: [''],
    enemytips: [''],
    passiveIcon: '',
    passiveName: '',
    passiveDesc: '',
    qIcon: '',
    qName: '',
    qDesc: '',
    wIcon: '',
    wName: '',
    wDesc: '',
    eIcon: '',
    eName: '',
    eDesc: '',
    rIcon: '',
    rName: '',
    rDesc: '',
  });
  const [error, setError] = useState('');

  // Handlers para los distintos campos y arrays
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleCheckboxChange(e, field, max) {
    const { value, checked } = e.target;
    setForm(f => {
      const arr = f[field];
      if (checked) {
        if (arr.length >= max) return f;
        return { ...f, [field]: [...arr, value] };
      } else {
        return { ...f, [field]: arr.filter(x => x !== value) };
      }
    });
  }

  function handleArrayChange(field, idx, value) {
    setForm(f => {
      const arr = [...f[field]];
      arr[idx] = value;
      return { ...f, [field]: arr };
    });
  }

  function addArrayItem(field) {
    setForm(f => ({ ...f, [field]: [...f[field], ''] }));
  }

  function removeArrayItem(field, idx) {
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  }

  function addSkin() {
    setForm(f => ({ ...f, skins: [...f.skins, { name: '', imageUrl: '' }] }));
  }

  function handleSkinChange(idx, key, value) {
    setForm(f => {
      const arr = [...f.skins];
      arr[idx][key] = value;
      return { ...f, skins: arr };
    });
  }

  function removeSkin(idx) {
    setForm(f => ({
      ...f,
      skins: f.skins.filter((_, i) => i !== idx),
    }));
  }

  // Envío del formulario
  async function handleSubmit(e) {
    e.preventDefault();
    const _token = token || (user && user.token) || localStorage.getItem("token");
    if (!_token) {
      setError(t.createChampion.mustBeLoggedIn);
      return;
    }
    if (!form.id || !form.name || !form.passiveName) {
      setError(t.createChampion.fillRequiredFields);
      return;
    }

    const dataToSend = {
      id: form.id,
      name: form.name,
      title: form.title,
      region: form.region,
      roles: form.roles,
      positions: form.positions,
      iconUrl: form.iconUrl || DEFAULT_ICON,
      skins: form.skins.length
        ? form.skins.filter(s => s.name && s.imageUrl)
        : [{ name: form.name, imageUrl: form.iconUrl || DEFAULT_ICON }],
      lore: form.lore || t.createChampion.noLoreProvided,
      allytips: form.allytips.filter(Boolean).length
        ? form.allytips.filter(Boolean)
        : [t.createChampion.noAllyTips],
      enemytips: form.enemytips.filter(Boolean).length
        ? form.enemytips.filter(Boolean)
        : [t.createChampion.noEnemyTips],
      info: {
        attack: 0, defense: 0, magic: 0,
        difficulty: Number(form.difficulty) || 1,
      },
      stats: {},
      abilities: {
        passive: {
          name: form.passiveName,
          description: form.passiveDesc || '',
          iconUrl: form.passiveIcon || '',
        },
        spells: [
          { key: 'Q', name: form.qName, description: form.qDesc, iconUrl: form.qIcon || '' },
          { key: 'W', name: form.wName, description: form.wDesc, iconUrl: form.wIcon || '' },
          { key: 'E', name: form.eName, description: form.eDesc, iconUrl: form.eIcon || '' },
          { key: 'R', name: form.rName, description: form.rDesc, iconUrl: form.rIcon || '' },
        ]
      }
    };

    try {
      await axios.post(
        'http://localhost:3010/api/v1/champions',
        dataToSend,
        { headers: { Authorization: `Bearer ${_token}` } }
      );
      alert(t.createChampion.success);
      setError('');
    } catch (err) {
      setError(t.createChampion.failed);
    }
  }

  return (
    <form className="cc-wrap" onSubmit={handleSubmit}>
      {error && <div className="cc-error">{error}</div>}

      <h1 className="cc-title">{t.createChampion.title}</h1>

      {/* Info básica */}
      <div className="cc-card">
        <h2>{t.createChampion.basicInfo} *</h2>
        <label>
          {t.createChampion.id} *
          <input name="id" value={form.id} onChange={handleChange} placeholder={t.createChampion.idPlaceholder} />
        </label>
        <label>
          {t.createChampion.name} *
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>
          {t.createChampion.titleLabel}
          <input name="title" value={form.title} onChange={handleChange} />
        </label>
        <label>
          {t.createChampion.iconUrl}
          <input name="iconUrl" value={form.iconUrl} onChange={handleChange} placeholder={t.createChampion.optional} />
        </label>
        <label>
          {t.createChampion.region} *
          <select name="region" value={form.region} onChange={handleChange} className="cc-select">
            <option value="">{t.createChampion.selectRegion}</option>
            {REGION_OPTIONS.map(r => (
              <option key={r} value={r}>{t.regions[r] || r}</option>
            ))}
          </select>
        </label>

        {/* Roles */}
        <fieldset className="cc-fieldset">
          <legend>{t.createChampion.roles} * (max 3)</legend>
          {ROLE_OPTIONS.map(r => (
            <label key={r} className="cc-checkbox">
              <input
                type="checkbox"
                value={r}
                checked={form.roles.includes(r)}
                onChange={e => handleCheckboxChange(e, 'roles', 3)}
              />
              {t.roles[r] || r}
            </label>
          ))}
        </fieldset>

        {/* Posiciones */}
        <fieldset className="cc-fieldset">
          <legend>{t.createChampion.positions} * (max 2)</legend>
          {POSITION_OPTIONS.map(p => (
            <label key={p} className="cc-checkbox">
              <input
                type="checkbox"
                value={p}
                checked={form.positions.includes(p)}
                onChange={e => handleCheckboxChange(e, 'positions', 2)}
              />
              {t.positions[p] || p}
            </label>
          ))}
        </fieldset>

        <label>
          {t.createChampion.lore}
          <textarea name="lore" value={form.lore} onChange={handleChange} placeholder={t.createChampion.lorePlaceholder} />
        </label>
      </div>

      {/* Tips aliados y enemigos */}
      <div className="cc-card">
        <h2>{t.createChampion.tips}</h2>
        <div className="cc-tips-group">
          <div>
            <h3>{t.createChampion.allyTips}</h3>
            {form.allytips.map((tip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <input
                  value={tip}
                  onChange={e => handleArrayChange('allytips', i, e.target.value)}
                  placeholder={t.createChampion.allyTipPlaceholder}
                />
                <button type="button" onClick={() => removeArrayItem('allytips', i)}>×</button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('allytips')}>+ {t.createChampion.addTip}</button>
          </div>
          <div>
            <h3>{t.createChampion.enemyTips}</h3>
            {form.enemytips.map((tip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <input
                  value={tip}
                  onChange={e => handleArrayChange('enemytips', i, e.target.value)}
                  placeholder={t.createChampion.enemyTipPlaceholder}
                />
                <button type="button" onClick={() => removeArrayItem('enemytips', i)}>×</button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('enemytips')}>+ {t.createChampion.addTip}</button>
          </div>
        </div>
      </div>

      {/* Dificultad */}
      <div className="cc-card">
        <h2>{t.createChampion.difficulty} *</h2>
        <input
          type="range"
          min="1"
          max="10"
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
        />
        <div className="cc-diff-display">{form.difficulty}</div>
      </div>

      {/* Habilidades */}
      <div className="cc-card">
        <h2>{t.createChampion.abilities} *</h2>
        <div className="cc-grid cc-grid--2col">
          <div className="cc-ability-col">
            <label>
              {t.createChampion.passiveIcon}
              <input
                name="passiveIcon"
                value={form.passiveIcon}
                onChange={handleChange}
                placeholder={t.createChampion.optional}
              />
            </label>
            <label>
              {t.createChampion.passiveName} *
              <input
                name="passiveName"
                value={form.passiveName}
                onChange={handleChange}
              />
            </label>
            <label>
              {t.createChampion.description} *
              <textarea
                name="passiveDesc"
                value={form.passiveDesc}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="cc-ability-grid">
            {['Q','W','E','R'].map((key,i) => (
              <div key={key} className="cc-ability-item">
                <label>
                  {key} {t.createChampion.icon}
                  <input
                    name={`${key.toLowerCase()}Icon`}
                    value={form[`${key.toLowerCase()}Icon`]}
                    onChange={handleChange}
                    placeholder={t.createChampion.optional}
                  />
                </label>
                <label>
                  {key} {t.createChampion.name} *
                  <input
                    name={`${key.toLowerCase()}Name`}
                    value={form[`${key.toLowerCase()}Name`]}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  {t.createChampion.description} *
                  <textarea
                    name={`${key.toLowerCase()}Desc`}
                    value={form[`${key.toLowerCase()}Desc`]}
                    onChange={handleChange}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skins */}
      <div className="cc-card">
        <h2>{t.createChampion.skins}</h2>
        <div className="cc-skins-grid">
          {form.skins.map((skin, i) => (
            <div key={i} className="cc-skin-row">
              <input
                value={skin.name}
                placeholder={t.createChampion.skinName}
                onChange={e => handleSkinChange(i, 'name', e.target.value)}
              />
              <input
                value={skin.imageUrl}
                placeholder={t.createChampion.skinImageUrl}
                onChange={e => handleSkinChange(i, 'imageUrl', e.target.value)}
              />
              <button
                type="button"
                className="remove-skin-btn"
                onClick={() => removeSkin(i)}
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" className="cc-add-skin" onClick={addSkin}>
            + {t.createChampion.addSkin}
          </button>
        </div>
      </div>

      {/* Botón submit */}
      <button type="submit" className="cc-submit">
        {t.createChampion.saveChampion}
      </button>
    </form>
  );
}
