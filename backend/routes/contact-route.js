// src/routes/contact-route.js (o en user-route.js)
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { contactController } from '../controllers/contact-controller.js';

const router = Router();
router.post('/contact', authMiddleware, asyncHandler(contactController));
export default router;