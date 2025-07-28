// Página de perfil de usuario: muestra y gestiona campeones custom, permite actualizar datos y contraseña, y borrar la cuenta.

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { en } from '../../i18n/en';
import { es } from '../../i18n/es';

// Icono por defecto si falta imagen del campeón
const DEFAULT_ICON = "https://upload.wikimedia.org/wikipedia/commons/7/77/League_of_Legends_logo.svg";

export default function Profile({ lang = 'EN' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const t = lang === 'EN' ? en : es;

  // Estados principales
  const [champions, setChampions] = useState([]);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Cargar campeones custom del usuario al montar
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/auth/me');
        setChampions(res.data?.customChampions || []);
      } catch {
        setChampions([]);
      }
    }
    fetchProfile();
  }, []);

  // Eliminar campeón custom
  async function handleDeleteChampion(id) {
    if (!window.confirm(t.profile.confirmDeleteChampion)) return;
    try {
      await api.delete(`/champions/${id}`);
      setChampions(prev => prev.filter(c => c.id !== id));
    } catch {
      setError(t.profile.failedDeleteChampion);
    }
  }

  // Actualizar perfil (nombre/email)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.put('/auth/profile', {
        username,
        email,
        password: currentPassword
      });
      setMessage(t.profile.profileUpdated);
    } catch (err) {
      setError(err.response?.data?.message || t.profile.updateFailed);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError(t.profile.passwordsMismatch);
      return;
    }
    try {
      await api.put('/auth/password', {
        oldPassword: currentPassword,
        newPassword,
        confirmPassword
      });
      setMessage(t.profile.passwordChanged);
    } catch (err) {
      setError(err.response?.data?.message || t.profile.passwordChangeFailed);
    }
  };

  // Eliminar cuenta de usuario
  const handleDeleteAccount = async () => {
    if (!window.confirm(t.profile.confirmDeleteAccount)) return;
    try {
      await api.delete('/auth', { data: { password: currentPassword } });
      logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t.profile.deleteFailed);
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">
        {user.username} {t.profile.profile}
      </h1>

      {/* Info principal */}
      <div className="profile-info">
        <p><strong>{t.profile.username}:</strong> {user.username}</p>
        <p><strong>{t.profile.email}:</strong> {user.email}</p>
      </div>

      {/* Campeones custom */}
      <section className="champions-section">
        <h2>{t.profile.yourCustomChampions}</h2>
        <div className="champions-grid">
          {champions.length > 0 ? champions.map(champ => (
            <div
              key={champ._id || champ.id}
              className="champ-card"
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <img
                src={champ.iconUrl && champ.iconUrl.trim() !== "" ? champ.iconUrl : DEFAULT_ICON}
                alt={champ.name}
                className="champ-icon"
                style={{ objectFit: 'cover', background: '#222', borderRadius: '50%' }}
                onError={e => { e.target.onerror = null; e.target.src = DEFAULT_ICON; }}
                onClick={() => navigate(`/champions/${champ.id}`)}
              />
              <span className="champ-name">{champ.name}</span>
              {/* Editar */}
              <button
                className="champ-edit-btn"
                onClick={() => navigate(`/champions/${champ.id}/edit`)}
                style={{ position: 'absolute', top: 10, right: 40 }}
                title={t.profile.editChampion}
              >✏️</button>
              {/* Eliminar */}
              <button
                className="champ-delete-btn"
                onClick={() => handleDeleteChampion(champ.id)}
                style={{ position: 'absolute', top: 10, right: 10 }}
                title={t.profile.deleteChampion}
              >🗑️</button>
            </div>
          )) : (
            <p>{t.profile.noCustomChampions}</p>
          )}
        </div>
      </section>

      {/* Acciones de cuenta */}
      <section className="profile-actions">
        <h2>{t.profile.accountActions}</h2>
        {error && <div className="error-profile">{error}</div>}
        {message && <div className="success">{message}</div>}

        {/* Actualizar datos */}
        <form onSubmit={handleUpdateProfile} className="action-form">
          <h3>{t.profile.updateProfile}</h3>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder={t.profile.newUsername}
            required
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t.profile.newEmail}
            required
          />
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder={t.profile.currentPassword}
            required
          />
          <button type="submit">{t.profile.saveChanges}</button>
        </form>

        {/* Cambiar contraseña */}
        <form onSubmit={handleChangePassword} className="action-form">
          <h3>{t.profile.changePassword}</h3>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder={t.profile.currentPassword}
            required
          />
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder={t.profile.newPassword}
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder={t.profile.confirmNewPassword}
            required
          />
          <button type="submit">{t.profile.changePassword}</button>
        </form>

        {/* Eliminar cuenta */}
        <div className="delete-section">
          <h3>{t.profile.deleteAccount}</h3>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder={t.profile.currentPassword}
            required
          />
          <button
            type="button"
            className="delete-btn"
            onClick={handleDeleteAccount}
          >
            {t.profile.deleteMyAccount}
          </button>
        </div>
      </section>
    </div>
  );
}
