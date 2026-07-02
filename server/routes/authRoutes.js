import express from 'express';
import { registerUser, authUser, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for user registration and authentication
router.post('/register', registerUser);
router.post('/login', authUser);

// Protected route for fetching session profile details
router.get('/profile', protect, getUserProfile);

export default router;
