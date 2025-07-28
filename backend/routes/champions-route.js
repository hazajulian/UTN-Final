// Rutas para gestionar campeones oficiales y custom
import { Router } from 'express';
import * as ctrl from '../controllers/champions-controllers.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Seed champions (público)
router.get('/',      asyncHandler(ctrl.listSeedChampions));

// Custom champions del usuario (requiere auth)
router.get('/user',    authMiddleware, asyncHandler(ctrl.listMyChampions));
router.post('/',       authMiddleware, asyncHandler(ctrl.createCustomChampion));
router.patch('/:id',   authMiddleware, asyncHandler(ctrl.updateChampion));
router.delete('/:id',  authMiddleware, asyncHandler(ctrl.deleteChampion));

// Get champion details (seed o custom)
router.get('/:id',   asyncHandler(ctrl.getChampionById));

export default router;