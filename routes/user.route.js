import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { requireRole, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me', verifyToken, userController.getMyDashboard);
router.put('/me', verifyToken, userController.updateMyProfile);
router.post('/me/wishlist', verifyToken, userController.addMyWishlistItem);
router.delete('/me/wishlist/:slug', verifyToken, userController.removeMyWishlistItem);

router.get('/', verifyToken, requireRole('admin'), userController.getAll);
router.get('/:id', verifyToken, requireRole('admin'), userController.getById);
router.post('/', verifyToken, requireRole('admin'), userController.create);
router.put('/:id', verifyToken, requireRole('admin'), userController.update);
router.delete('/:id', verifyToken, requireRole('admin'), userController.remove);

export default router;
