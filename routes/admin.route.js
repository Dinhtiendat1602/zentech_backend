import express from 'express';
import { getDashboard } from '../controllers/admin.controller.js';
import { requireRole, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken, requireRole('admin'));
router.get('/dashboard', getDashboard);

export default router;