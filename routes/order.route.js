import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { optionalAuth, requireRole, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/checkout', optionalAuth, orderController.checkout);
router.put('/:id/cancel', verifyToken, orderController.cancelMyOrder);
router.post('/:id/cancel', verifyToken, orderController.cancelMyOrder);
router.get('/', verifyToken, requireRole('admin'), orderController.getAll);
router.get('/:id', verifyToken, requireRole('admin'), orderController.getById);
router.post('/', verifyToken, requireRole('admin'), orderController.create);
router.put('/:id', verifyToken, requireRole('admin'), orderController.update);
router.delete('/:id', verifyToken, requireRole('admin'), orderController.remove);

export default router;

