import express from 'express';
import { getCamps, createCamp } from '../controllers/campController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getCamps);
router.post('/', authMiddleware, createCamp);

export default router;
