import express from 'express';
import { registerUser, loginUser, getUserProfile, updateAvatar, getUserById, updateUserProfile } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Register User
router.post('/register', registerUser);

// Login User
router.post('/login', loginUser);

// Get User Profile
router.get('/me', authMiddleware, getUserProfile);

// Update User Profile
router.put('/me', authMiddleware, updateUserProfile);

// Get Public User Profile by ID
router.get('/user/:id', getUserById);

// Update Avatar
router.put('/me/avatar', authMiddleware, updateAvatar);

export default router;
