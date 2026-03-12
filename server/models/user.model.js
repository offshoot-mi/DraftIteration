import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Sub-schema for saved articles
const savedArticleSchema = new mongoose.Schema({
  rootArticle: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true,
  },
  lineagePathIds: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
  }],
  customName: { 
    type: String,
    trim: true,
    maxlength: 100,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
}, {_id: true});

// Main User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores']
    },
    originalUsername: { type: String, trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    passwordHash: { type: String }, // Can be empty for Google accounts
    agreedToTerms: { type: Boolean, required: [true, 'You must agree to the terms and conditions'], default: false },
    role: { type: String, enum: ['user', 'admin', 'deleted'], default: 'user' },
    profilePicture: { type: String, default: '' },
    bio: { type: String, maxlength: [160, 'Bio cannot exceed 160 characters'], default: '' },
    isPrivate: { type: Boolean, default: false },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingFollowRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isVerified: { type: Boolean, default: false },
    verificationRequestedAt: { type: Date },
    status: { type: String, enum: ['active', 'deleted'], default: 'active' },

    // --- Google OAuth Fields ---
    googleId: { type: String, unique: true, sparse: true }, // Optional unique Google ID
    googleEmail: { type: String, lowercase: true, trim: true }, // Optional Google email
    isGoogleAccount: { type: Boolean, default: false }, // Flag for Google login

    // --- Email Verification ---
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    isEmailVerified: { type: Boolean, default: false },

    // --- Password Reset ---
    passwordResetToken: String,
    passwordResetExpires: Date,

    savedArticles: [savedArticleSchema],
  },
  {
    timestamps: true,
  }
);

// --- Pre-save middleware to hash password (skip Google accounts) ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || this.isGoogleAccount) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// --- Methods ---
// Match entered password with hashed password (skip Google accounts)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.status === 'deleted' || this.isGoogleAccount) return false;
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Generate Email Verification Token
userSchema.methods.getEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

// Generate Password Reset Token
userSchema.methods.getPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

// Virtual ID field
userSchema.virtual('id').get(function () { return this._id.toHexString(); });

// Transform output JSON
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.passwordHash;
  },
});

const User = mongoose.model('User', userSchema);
export default User;