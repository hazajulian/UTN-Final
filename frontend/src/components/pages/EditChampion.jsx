// Formulario para editar un campeón custom: permite modificar todos los datos, skins, tips y habilidades, validando dueño y tipo.

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Traducciones (usamos el subobjeto editChampion para los textos)
import { en } from '../../i18n/en';
import { es } from '../../i18n/es';

import './CreateChampion.css';

// Opciones posibles para región, rol y posición
const REGION_OPTIONS = [
  'Demacia','Noxus','Ionia','Piltover & Zaun','Freljord','Shurima',
  'Shadow Isles','Bilgewater','Targon','Bandle City','Ixtal','Runeterra'
];
const ROLE_OPTIONS = [
  'Assassin','Fighter','Mage','Marksman','Support','Tank'
];
const POSITION_OPTIONS = ['Top','Jungle','Mid','ADC','Support'];

export default function EditChampion({ lang = 'EN' }) {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const t = lang === 'EN' ? en.editChampion : es.editChampion;

  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Carga datos del campeón al montar
  useEffect(() => {
    async function fetchChampion() {
      try {
        const res = await axios.get(`http://localhost:3010/api/v1/champions/${id}`);

        // Validaciones de edición
        if (res.data.seed) {
          setError(t.cannotEditOfficial);
        } else if (
          (res.data.owner && user && (res.data.owner !== user.id && res.data.owner !== user._id))
        ) {
          setError(t.notOwner);
        } else {
          setForm({
            id: res.data.id || '',
            name: res.data.name || '',
            title: res.data.title || '',
            region: res.data.region || '',
            roles: res.data.roles || [],
            positions: res.data.positions || [],
            difficulty: res.data.info?.difficulty || 1,
            iconUrl: res.data.iconUrl || '',
            skins: res.data.skins?.map(s => ({ name: s.name, imageUrl: s.imageUrl })) || [],
            lore: res.data.lore || '',
            allytips: res.data.allytips || [],
            enemytips: res.data.enemytips || [],
            passiveIcon: res.data.abilities?.passive?.iconUrl || '',
            passiveName: res.data.abilities?.passive?.name || '',
            passiveDesc: res.data.abilities?.passive?.description || '',
            qIcon: res.data.abilities?.spells?.[0]?.iconUrl || '',
            qName: res.data.abilities?.spells?.[0]?.name || '',
            qDesc: res.data.abilities?.spells?.[0]?.description || '',
            wIcon: res.data.abilities?.spells?.[1]?.iconUrl || '',
            wName: res.data.abilities?.spells?.[1]?.name || '',
            wDesc: res.data.abilities?.spells?.[1]?.description || '',
            eIcon: res.data.abilities?.spells?.[2]?.iconUrl || '',
            eName: res.data.abilities?.spells?.[2]?.name || '',
            eDesc: res.data.abilities?.spells?.[2]?.description || '',
            rIcon: res.data.abilities?.spells?.[3]?.iconUrl || '',
            rName: res.data.abilities?.spells?.[3]?.name || '',
            rDesc: res.data.abilities?.spells?.[3]?.description || '',
          });
        }
      } catch (err) {
        setError(t.championNotFound);
      } finally {
        setLoading(false);
      }
    }
    fetchChampion();
  }, [id, user, t]);

  // Manejadores para el formulario
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

  function handleListChange(field, idx, value) {
    setForm(f => {
      const arr = Array.isArray(f[field]) ? [...f[field]] : [];
      arr[idx] = value;
      return { ...f, [field]: arr };
    });
  }

  // Añadir/Quitar skins y tips
  function addSkin() {
    setForm(f => ({ ...f, skins: [...f.skins, { name: '', imageUrl: '' }] }));
  }
  function removeSkin(idx) {
    setForm(f => ({
      ...f,
      skins: f.skins.filter((_, i) => i !== idx),
    }));
  }
  function addTip(field) {
    setForm(f => ({ ...f, [field]: [...(f[field] || []), ''] }));
  }
  function removeTip(field, idx) {
    setForm(f => ({
      ...f,
      [field]: f[field].filter((_, i) => i !== idx)
    }));
  }

  // Submit para actualizar campeón
  async function handleSubmit(e) {
    e.preventDefault();
    const _token = token || (user && user.token) || localStorage.getItem("token");
    if (!_token) {
      setError(t.mustBeLoggedIn);
      return;
    }
    if (!form.id || !form.name || !form.passiveName) {
      setError(t.fillRequiredFields);
      return;
    }

    const data = {
      id: form.id,
      name: form.name,
      title: form.title,
      region: form.region,
      roles: form.roles,
      positions: form.positions,
      info: { difficulty: form.difficulty },
      iconUrl: form.iconUrl,
      skins: (form.skins || []).filter(s => s.name && s.imageUrl),
      lore: form.lore,
      allytips: form.allytips.filter(Boolean),
      enemytips: form.enemytips.filter(Boolean),
      abilities: {
        passive: {
          name: form.passiveName,
          description: form.passiveDesc,
          iconUrl: form.passiveIcon
        },
        spells: [
          { key: 'Q', name: form.qName, description: form.qDesc, iconUrl: form.qIcon },
          { key: 'W', name: form.wName, description: form.wDesc, iconUrl: form.wIcon },
          { key: 'E', name: form.eName, description: form.eDesc, iconUrl: form.eIcon },
          { key: 'R', name: form.rName, description: form.rDesc, iconUrl: form.rIcon },
        ]
      }
    };

    try {
      await axios.patch(`http://localhost:3010/api/v1/champions/${id}`, data, {
        headers: { Authorization: `Bearer ${_token}` }
      });
      alert(t.updateSuccess);
      navigate('/profile');
    } catch (err) {
      setError(t.updateFailed);
    }
  }

  // Eliminar campeón
  async function handleDelete() {
    if (!window.confirm(t.deleteConfirm)) return;
    const _token = token || (user && user.token) || localStorage.getItem("token");
    if (!_token) {
      setError(t.mustBeLoggedIn);
      return;
    }
    try {
      await axios.delete(`http://localhost:3010/api/v1/champions/${id}`, {
        headers: { Authorization: `Bearer ${_token}` }
      });
      alert(t.deleteSuccess);
      navigate('/profile');
    } catch (err) {
      setError(t.deleteFailed);
    }
  }

  // Distintos estados
  if (loading) return <div className="cc-loading">{t.loading}</div>;
  if (error) return <div className="cc-error">{error}</div>;
  if (!form) return null;

  return (
    <form className="cc-wrap" onSubmit={handleSubmit}>
      <h1 className="cc-title">{t.editChampion}</h1>

      {/* INFO BÁSICA */}
      <div className="cc-card">
        <h2>{t.basicInfo} *</h2>
        <label>
          {t.id} *
          <input name="id" value={form.id} readOnly />
        </label>
        <label>
          {t.name} *
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>
          {t.title}
          <input name="title" value={form.title} onChange={handleChange} />
        </label>
        <label>
          {t.iconUrl}
          <input name="iconUrl" value={form.iconUrl} onChange={handleChange} placeholder={t.optional} />
        </label>
        <label>
          {t.region} *
          <select name="region" value={form.region} onChange={handleChange}>
            <option value="">{t.selectRegion}</option>
            {REGION_OPTIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        {/* ROLES */}
        <fieldset className="cc-fieldset">
          <legend>{t.roles} * (max 3)</legend>
          {ROLE_OPTIONS.map(r => (
            <label key={r} className="cc-checkbox">
              <input
                type="checkbox"
                value={r}
                checked={form.roles.includes(r)}
                onChange={e => handleCheckboxChange(e, 'roles', 3)}
              />
              {r}
            </label>
          ))}
        </fieldset>

        {/* POSITIONS */}
        <fieldset className="cc-fieldset">
          <legend>{t.positions} * (max 2)</legend>
          {POSITION_OPTIONS.map(p => (
            <label key={p} className="cc-checkbox">
              <input
                type="checkbox"
                value={p}
                checked={form.positions.includes(p)}
                onChange={e => handleCheckboxChange(e, 'positions', 2)}
              />
              {p}
            </label>
          ))}
        </fieldset>
      </div>

      {/* DIFICULTAD */}
      <div className="cc-card">
        <h2>{t.difficulty} *</h2>
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

      {/* HABILIDADES */}
      <div className="cc-card">
        <h2>{t.abilities} *</h2>
        <div className="cc-grid cc-grid--2col">
          <div className="cc-ability-col">
            <label>
              {t.passiveIcon}
              <input
                name="passiveIcon"
                value={form.passiveIcon}
                onChange={handleChange}
                placeholder={t.optional}
              />
            </label>
            <label>
              {t.passiveName} *
              <input
                name="passiveName"
                value={form.passiveName}
                onChange={handleChange}
              />
            </label>
            <label>
              {t.description} *
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
                  {key} {t.icon}
                  <input
                    name={`${key.toLowerCase()}Icon`}
                    value={form[`${key.toLowerCase()}Icon`]}
                    onChange={handleChange}
                    placeholder={t.optional}
                  />
                </label>
                <label>
                  {key} {t.name} *
                  <input
                    name={`${key.toLowerCase()}Name`}
                    value={form[`${key.toLowerCase()}Name`]}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  {t.description} *
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

      {/* SKINS */}
      <div className="cc-card">
        <h2>{t.skins}</h2>
        <div className="cc-skins-grid">
          {form.skins.map((skin, i) => (
            <div key={i} className="cc-skin-row">
              <input
                value={skin.name}
                placeholder={t.skinNamePlaceholder}
                onChange={e => handleListChange('skins', i, { ...skin, name: e.target.value })}
              />
              <input
                value={skin.imageUrl}
                placeholder={t.skinImagePlaceholder}
                onChange={e => handleListChange('skins', i, { ...skin, imageUrl: e.target.value })}
              />
              <button
                type="button"
                className="remove-skin-btn"
                onClick={() => removeSkin(i)}
              >×</button>
            </div>
          ))}
          <button type="button" className="cc-add-skin" onClick={addSkin}>
            + {t.addSkin}
          </button>
        </div>
      </div>

      {/* LORE */}
      <div className="cc-card">
        <h2>{t.lore}</h2>
        <textarea
          name="lore"
          value={form.lore}
          onChange={handleChange}
          placeholder={t.lorePlaceholder}
        />
      </div>

      {/* ALLY TIPS */}
      <div className="cc-card">
        <h2>{t.allyTips}</h2>
        {form.allytips?.map((tip, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              value={tip}
              onChange={e => handleListChange('allytips', i, e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="remove-tips-btn" type="button" onClick={() => removeTip('allytips', i)} style={{ fontSize: 18 }}>×</button>
          </div>
        ))}
        <button type="button" onClick={() => addTip('allytips')} className="cc-add-skin" style={{ marginTop: 4 }}>
          + {t.addTip}
        </button>
      </div>

      {/* ENEMY TIPS */}
      <div className="cc-card">
        <h2>{t.enemyTips}</h2>
        {form.enemytips?.map((tip, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              value={tip}
              onChange={e => handleListChange('enemytips', i, e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="remove-tips-btn" type="button" onClick={() => removeTip('enemytips', i)} style={{ fontSize: 18 }}>×</button>
          </div>
        ))}
        <button type="button" onClick={() => addTip('enemytips')} className="cc-add-skin" style={{ marginTop: 4 }}>
          + {t.addTip}
        </button>
      </div>

      {/* BOTONES */}
      <button type="submit" className="cc-submit">{t.saveChanges}</button>
      <button
        type="button"
        className="cc-delete-btn"
        onClick={handleDelete}
      >
        {t.deleteChampion}
      </button>

      {error && <div className="cc-error">{error}</div>}
    </form>
  );
}
