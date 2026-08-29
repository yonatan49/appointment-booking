import express from 'express';
import { getWorkersByService, getUserById } from '../controllers/userController.js';

const router = express.Router();
router.get('/workers', getWorkersByService);
router.get('/:id', getUserById);

export default router;