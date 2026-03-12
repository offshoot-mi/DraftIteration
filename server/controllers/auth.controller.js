// /server/controllers/auth.controller.js
import asyncHandler from 'express-async-handler';
import { body, param, validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import AppError from '../utils/AppError.js';
import { OAuth2Client } from 'google-auth-library';
import { getGoogleClient } from '../config/google.config.js';

// Initialize Google OAuth2 client with error handling
let googleClient;
try {
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.warn('⚠️  GOOGLE_CLIENT_ID is not set in environment variables. Google login will be disabled.');
  } else {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    console.log('✅ Google OAuth client initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Google OAuth client:', error.message);
  googleClient = null;
}

// --- Helper to check validation errors ---
const checkValidation = (req, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join('. ');
    next(new AppError(errorMessages, 400));
    return false;
  }
  return true;
};

/**
 * REGISTER USER
 * POST /api/auth/signup
 */
const registerUser = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores.'),
  body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),

  asyncHandler(async (req, res, next) => {
    if (!checkValidation(req, next)) return;

    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      if (userExists.email === email) return next(new AppError('An account with this email already exists', 400));
      if (userExists.username === username) return next(new AppError('Username is already taken', 400));
    }

    const user = new User({ 
      username, 
      email, 
      password, // Use 'password' not 'passwordHash' if schema uses pre-save hook
    });
    
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    const verifyURL = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const htmlMessage = `
      <h1>Email Verification</h1>
      <p>Hi ${user.username},</p>
      <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyURL}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
      <p>Or copy this link: ${verifyURL}</p>
      <p>This link will expire in 24 hours.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Rewrite Account - Email Verification',
        html: htmlMessage,
      });
      
      res.status(201).json({ 
        success: true, 
        message: 'Registration successful! Verification email sent.' 
      });
    } catch (err) {
      // Clean up verification token if email fails
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      console.error('Email send error:', err);
      return next(new AppError('Account created but verification email could not be sent. Please try resending verification.', 500));
    }
  }),
];

/**
 * VERIFY EMAIL
 * POST /api/auth/verify-email
 */
const verifyEmail = [
  body('token').notEmpty().withMessage('Verification token is required.'),
  asyncHandler(async (req, res, next) => {
    if (!checkValidation(req, next)) return;

    const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) return next(new AppError('Invalid or expired verification token.', 400));

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Email verified successfully! You can now log in.' 
    });
  }),
];

/**
 * LOGIN
 * POST /api/auth/login
 */
const loginUser = [
  body('username').notEmpty().withMessage('Username or Email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
  asyncHandler(async (req, res, next) => {
    if (!checkValidation(req, next)) return;

    const { username, password } = req.body;
    const user = await User.findOne({
      $or: [{ username: username }, { email: username.toLowerCase() }],
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return next(new AppError('Invalid credentials', 401));
    }

    if (!user.isEmailVerified) {
      return next(new AppError('Please verify your email before logging in.', 401));
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
      token: generateToken(user.id, user.role),
    });
  }),
];

/**
 * FORGOT PASSWORD
 * POST /api/auth/forgot-password
 */
const forgotPassword = [
  body('email').isEmail().withMessage('Please enter a valid email.').normalizeEmail(),
  asyncHandler(async (req, res, next) => {
    if (!checkValidation(req, next)) return;

    const user = await User.findOne({ email: req.body.email });
    
    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      });
    }

    const resetToken = user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const htmlMessage = `
      <h1>Password Reset Request</h1>
      <p>Hi ${user.username},</p>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetURL}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>Or copy this link: ${resetURL}</p>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({ 
        email: user.email, 
        subject: 'Rewrite - Password Reset Request', 
        html: htmlMessage 
      });
      
      res.json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      console.error('Password reset email error:', err);
      return next(new AppError('Error sending reset email. Please try again.', 500));
    }
  }),
];

/**
 * RESET PASSWORD
 * PUT /api/auth/reset-password/:token
 */
const resetPassword = [
  param('token').notEmpty().withMessage('Reset token is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  asyncHandler(async (req, res, next) => {
    if (!checkValidation(req, next)) return;

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return next(new AppError('Invalid or expired reset token.', 400));

    user.password = req.body.password; // Use 'password' not 'passwordHash'
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email
    const htmlMessage = `
      <h1>Password Reset Successful</h1>
      <p>Hi ${user.username},</p>
      <p>Your password has been successfully reset. If you didn't perform this action, please contact support immediately.</p>
      <p><a href="${process.env.CLIENT_URL}/login">Click here to log in</a></p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Rewrite - Password Reset Successful',
        html: htmlMessage,
      });
    } catch (err) {
      console.error('Password reset confirmation email error:', err);
      // Don't block the response if confirmation email fails
    }

    res.json({ 
      success: true, 
      message: 'Password reset successful! You can now log in.' 
    });
  }),
];

/**
 * GET CURRENT USER PROFILE
 * GET /api/auth/me
 */
const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires');
  
  if (!user) return next(new AppError('User not found', 404));

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isPrivate: user.isPrivate,
    isEmailVerified: user.isEmailVerified,
    agreedToTerms: user.agreedToTerms,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

/**
 * GOOGLE OAUTH LOGIN
 * POST /api/auth/google
 */
const googleLogin = asyncHandler(async (req, res, next) => {
  console.log('📱 Google login attempt received');
  
  // Get or initialize Google client
  const googleClient = getGoogleClient();
  
  if (!googleClient) {
    console.error('❌ Google OAuth client not available');
    return next(new AppError(
      'Google authentication is not configured. Please check server configuration.', 
      503
    ));
  }

  const { token } = req.body;
  if (!token) {
    return next(new AppError('Google token missing', 400));
  }

  try {
    console.log('🔍 Verifying Google token...');
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('✅ Token verified for email:', payload.email);
    
    const { email, name, sub, picture } = payload;

    if (!email) {
      return next(new AppError('Email not provided by Google', 400));
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Generate unique username
      let baseUsername = name ? name.replace(/\s+/g, '').toLowerCase() : 'user';
      let username = baseUsername;
      let counter = 0;
      
      while (await User.findOne({ username })) {
        counter++;
        username = `${baseUsername}${counter}`;
      }

      console.log(`📝 Creating new user with username: ${username}`);
      
      user = new User({
        username,
        email,
        googleId: sub,
        isEmailVerified: true,
        password: crypto.randomBytes(20).toString('hex'), // Random password
      });

      if (picture) {
        user.avatar = picture;
      }

      await user.save();
      console.log(`✅ New user created: ${user.username}`);
    } else if (!user.googleId) {
      // Link Google account to existing user
      console.log(`🔗 Linking Google account to existing user: ${user.email}`);
      user.googleId = sub;
      user.isEmailVerified = true;
      await user.save();
    }

    // Generate JWT token
    const authToken = generateToken(user.id, user.role);
    
    console.log(`✅ Login successful for user: ${user.username}`);

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
      token: authToken,
    });

  } catch (err) {
    console.error('❌ Google verification failed:', err);
    
    // More specific error messages
    if (err.message.includes('audience')) {
      return next(new AppError('Invalid Google OAuth configuration. Please check client ID.', 401));
    } else if (err.message.includes('token expired')) {
      return next(new AppError('Google token has expired. Please try again.', 401));
    } else if (err.message.includes('invalid token')) {
      return next(new AppError('Invalid Google token. Please try again.', 401));
    }
    
    return next(new AppError('Google authentication failed. Please try again.', 401));
  }
});

export {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  googleLogin,
};