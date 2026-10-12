import express from 'express';
import * as chatController from '../controllers/chat.controller.js';

const router = express.Router();

router.get('/', chatController.getAll);
router.get('/:id', chatController.getById);
router.post('/', chatController.create);
router.put('/:id', chatController.update);
router.delete('/:id', chatController.remove);

export default router;
