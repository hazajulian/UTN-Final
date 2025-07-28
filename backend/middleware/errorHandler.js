// Captura errores y responde con JSON
import { error } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  error('Unhandled error', { err });
  const status  = err.statusCode || 500;
  const message = err.message    || 'Error interno del servidor';
  res.status(status).json({ status: 'error', message });
}