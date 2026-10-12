import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { requireRole, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', productController.getAll);
router.get('/admin/list', verifyToken, requireRole('admin'), productController.getAdminProducts);
router.get('/admin/categories', verifyToken, requireRole('admin'), productController.getCategories);
router.get('/:id/specs', productController.getSpecs);
router.get('/:id', productController.getById);
router.post('/', verifyToken, requireRole('admin'), productController.create);
router.put('/:id', verifyToken, requireRole('admin'), productController.update);
router.delete('/:id', verifyToken, requireRole('admin'), productController.remove);

export default router;
