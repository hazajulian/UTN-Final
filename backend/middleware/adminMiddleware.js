// Permite acceso solo a usuarios con isAdmin=true
export function adminMiddleware(req, res, next) {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Forbidden: admin only' });
  }
  next();
}