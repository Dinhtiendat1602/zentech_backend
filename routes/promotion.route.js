import express from 'express';
import * as promotionController from '../controllers/promotion.controller.js';
import { requireRole, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/check', promotionController.checkCode);

router.get('/', verifyToken, requireRole('admin'), promotionController.getAll);
router.get('/:id', verifyToken, requireRole('admin'), promotionController.getById);
router.post('/', verifyToken, requireRole('admin'), promotionController.create);
router.put('/:id', verifyToken, requireRole('admin'), promotionController.update);
router.delete('/:id', verifyToken, requireRole('admin'), promotionController.remove);

export default router;
