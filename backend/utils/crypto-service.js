// Funciones para hashing y tokens de sesión
import crypto from 'crypto';

// Hashear contraseña con scrypt usando salt de env
export function hashPassword(password) {
  const salt = process.env.PASSWORD_SALT || 'default_salt';
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

// Verificar contraseña comparando hash
export function verifyPassword(plain, hash) {
  return hashPassword(plain) === hash;
}

// Generar un token de sesión aleatorio
export function makeSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}