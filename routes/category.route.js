import express from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { requireRole, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', verifyToken, requireRole('admin'), categoryController.create);
router.put('/:id', verifyToken, requireRole('admin'), categoryController.update);
router.delete('/:id', verifyToken, requireRole('admin'), categoryController.remove);

export default router;
