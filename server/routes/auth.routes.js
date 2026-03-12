import express from 'express';
import {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
  verifyEmail,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- Public Routes ---
router.post('/signup', registerUser);
router.post('/login', loginUser);
//router.post('/google', googleLogin);

router.post('/google', googleLogin);
// Email Verification & Password Reset
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// --- Protected Routes ---
router.get('/me', protect, getUserProfile);

export default router;