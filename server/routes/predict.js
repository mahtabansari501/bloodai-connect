import express from 'express';
import { getInventoryPrediction, matchSOSWithInventory } from '../controllers/predictController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/inventory', authMiddleware, getInventoryPrediction);
router.post('/match-sos', matchSOSWithInventory);

export default router;
