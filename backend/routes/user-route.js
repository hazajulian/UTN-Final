// routes/user-route.js
import { Router } from 'express';
import * as ctrl from '../controllers/user-controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

// Importamos los limitadores desde nuestro middleware
import { loginLimiter, forgotLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Health check (público)
router.get('/', (req, res) => res.json({ message: 'Auth service is running' }));

// Registro y login (públicos)
router.post('/register', asyncHandler(ctrl.register));
// Aplicamos loginLimiter 
router.post('/login',    loginLimiter, asyncHandler(ctrl.login));
// Aplicamos forgotLimiter
router.post('/forgot-password', forgotLimiter, asyncHandler(ctrl.forgotPassword));
// Reset password (sin rate limit)
router.post('/reset-password',  asyncHandler(ctrl.resetPassword));

// Perfil del usuario autenticado
router.get('/me',    authMiddleware, asyncHandler(ctrl.getProfile));

// Operaciones de usuario (requieren auth)
router.post('/logout',  authMiddleware, asyncHandler(ctrl.logout));
router.put('/profile',  authMiddleware, asyncHandler(ctrl.updateProfile));
router.put('/password', authMiddleware, asyncHandler(ctrl.changePassword));
router.delete('/',      authMiddleware, asyncHandler(ctrl.deleteAccount));

// Rutas administrativas (solo admin)
router.get('/all',               authMiddleware, adminMiddleware, asyncHandler(ctrl.listUsers));
router.get('/id/:id',            authMiddleware, adminMiddleware, asyncHandler(ctrl.getUserById));
router.get('/username/:username',authMiddleware, adminMiddleware, asyncHandler(ctrl.getUserByUsername));

export default router;