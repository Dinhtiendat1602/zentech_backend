import express from 'express';
import authRoutes from './auth.route.js';
import productRoutes from './product.route.js';
import orderRoutes from './order.route.js';
import userRoutes from './user.route.js';
import adminRoutes from './admin.route.js';
import promotionRoutes from './promotion.route.js';
import categoryRoutes from './category.route.js';
import uploadRoutes from './upload.route.js';
import reviewRoutes from './review.route.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/promotions', promotionRoutes);
router.use('/categories', categoryRoutes);
router.use('/upload', uploadRoutes);
router.use('/reviews', reviewRoutes);

export default router;
