// Configuración de limitadores de velocidad para endpoints críticos
import rateLimit from 'express-rate-limit';

// Máximo 10 intentos de login por IP en 15 minutos
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: 'Demasiados intentos de login. Vuelve a intentarlo en 15 minutos.'
});

// Máximo 5 solicitudes de forgot-password por IP en 15 minutos
export const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: 'Demasiadas solicitudes de restablecimiento. Vuelve a intentarlo en 15 minutos.'
});