import express from 'express';
import { getInventory, addOrUpdateInventory } from '../controllers/inventoryController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getInventory);
router.post('/', authMiddleware, addOrUpdateInventory);

export default router;
