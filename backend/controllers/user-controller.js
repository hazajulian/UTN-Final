// src/controllers/user-controller.js
import 'dotenv/config';
import crypto from 'crypto';
import { User } from '../models/mongodb/user-modeldb.js';
import { Champion } from '../models/mongodb/champion-modeldb.js';
import { sendMail } from '../utils/mail-service.js';
import nodemailer from 'nodemailer';

// Registrar un nuevo usuario y devolver token
export async function register(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }
  if (password.length < 4 || password.length > 16) {
    return res.status(400).json({ message: 'La contraseña debe tener entre 4 y 16 caracteres' });
  }
  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) {
    return res.status(409).json({ message: 'Email o username ya en uso' });
  }
  const user = new User({ username, email, password });
  await user.save();
  const token = user.generateSessionToken();
  await user.save();
  return res.status(201).json({
    message: 'Usuario registrado correctamente',
    user: { id: user._id, username: user.username, email: user.email },
    token
  });
}

// Login: verificar credenciales y devolver token
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y password son obligatorios' });
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !await user.verifyPassword(password)) {
    return res.status(401).json({ message: 'Email o contraseña incorrectos' });
  }
  const token = user.generateSessionToken();
  await user.save();
  return res.json({
    message: 'Login exitoso',
    user: { id: user._id, username: user.username, email: user.email },
    token
  });
}

// Obtener perfil del usuario autenticado (con campeones custom populados)
export async function getProfile(req, res) {
  const user = await User.findById(req.user._id)
    .select('username email customChampions')
    .populate('customChampions');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  return res.json({
    username: user.username,
    email: user.email,
    customChampions: user.customChampions
  });
}

// Logout: invalidar token actual
export async function logout(req, res) {
  req.user.sessionToken = null;
  await req.user.save();
  return res.json({ message: 'Logout exitoso' });
}

// Actualizar perfil
export async function updateProfile(req, res) {
  const user = req.user;
  const { username, email, password } = req.body;
  if (!password || !await user.verifyPassword(password)) {
    return res.status(401).json({ message: 'Contraseña incorrecta' });
  }
  if (username && username !== user.username) user.username = username;
  if (email && email !== user.email)       user.email    = email;
  await user.save();
  return res.json({
    message: 'Perfil actualizado',
    user: { id: user._id, username: user.username, email: user.email }
  });
}

// Cambiar contraseña
export async function changePassword(req, res) {
  const user = req.user;
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword || newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Campos de contraseña inválidos' });
  }
  if (!await user.verifyPassword(oldPassword)) {
    return res.status(401).json({ message: 'Contraseña antigua incorrecta' });
  }
  if (newPassword.length < 4 || newPassword.length > 16) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener entre 4 y 16 caracteres' });
  }
  user.password = newPassword;
  await user.save();
  return res.json({ message: 'Contraseña cambiada exitosamente' });
}

// Eliminar cuenta
export async function deleteAccount(req, res) {
  const user = req.user;
  const { password } = req.body;
  if (!password || !await user.verifyPassword(password)) {
    return res.status(401).json({ message: 'Contraseña incorrecta' });
  }
  await User.deleteOne({ _id: user._id });
  return res.json({ message: 'Cuenta eliminada correctamente' });
}

// Listar todos los usuarios (admin)
export async function listUsers(req, res) {
  const users = await User.find().select('username email createdAt updatedAt');
  return res.json(users);
}

// Obtener usuario por ID (admin)
export async function getUserById(req, res) {
  const user = await User.findById(req.params.id).select('username email createdAt updatedAt');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  return res.json(user);
}

// Obtener usuario por username (admin)
export async function getUserByUsername(req, res) {
  const user = await User.findOne({ username: req.params.username })
    .select('username email createdAt updatedAt');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  return res.json(user);
}

// Solicitar reset de contraseña
export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    // Genera un token y fecha de expiración (1h)
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Construir enlace de reset usando FRONTEND_URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    try {
      // Intentamos enviar el mail, pero no interrumpimos si falla
      await sendMail({
        to: email,
        subject: 'Restablece tu contraseña',
        text: `Haz clic aquí para restablecer tu contraseña: ${resetUrl}`
      });
    } catch (err) {
      console.error('🔔 Error enviando email de reseteo:', err);
    }
  }
  // Siempre respondemos igual, sin filtrar si existe el email
  return res.json({ message: 'Si existe, te hemos enviado un email con instrucciones' });
}

// Ejecutar reset de contraseña
export async function resetPassword(req, res) {
  const { token, newPassword, confirmPassword } = req.body;
  if (!token || newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Datos inválidos o contraseñas no coinciden' });
  }
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+password');
  if (!user) {
    return res.status(400).json({ message: 'Token inválido o expirado' });
  }
  user.password               = newPassword;
  user.resetPasswordToken     = undefined;
  user.resetPasswordExpires   = undefined;
  await user.save();
  return res.json({ message: 'Contraseña restablecida correctamente' });
}