import express from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { verifyToken, optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, reviewController.getAll);
router.get('/:id', reviewController.getById);
router.post('/', verifyToken, reviewController.create);
router.put('/:id', verifyToken, reviewController.update);
router.delete('/:id', verifyToken, reviewController.remove);

export default router;
