import express from 'express';
import * as cartController from '../controllers/cart.controller.js';

const router = express.Router();

router.get('/', cartController.getAll);
router.get('/:id', cartController.getById);
router.post('/', cartController.create);
router.put('/:id', cartController.update);
router.delete('/:id', cartController.remove);

export default router;
