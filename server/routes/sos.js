import express from 'express';
import { getActiveSOS, createSOSAlert, resolveSOSAlert, acceptSOSAlert, withdrawSOSAlert } from '../controllers/sosController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getActiveSOS);
router.post('/', createSOSAlert);
router.patch('/:id/resolve', resolveSOSAlert);
router.patch('/:id/accept', authMiddleware, acceptSOSAlert);
router.patch('/:id/withdraw', authMiddleware, withdrawSOSAlert);
export default router;
