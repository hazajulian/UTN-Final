// Logger JSON con timestamp y nivel
const LEVELS = { INFO: 'info', WARN: 'warn', ERROR: 'error' };

function formatLog(level, message, meta = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  });
}

// Log de información
export function info(message, meta) {
  console.log(formatLog(LEVELS.INFO, message, meta));
}

// Log de advertencias
export function warn(message, meta) {
  console.warn(formatLog(LEVELS.WARN, message, meta));
}

// Log de errores
export function error(message, meta) {
  console.error(formatLog(LEVELS.ERROR, message, meta));
}