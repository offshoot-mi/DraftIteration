// Rewrite/server/routes/user.routes.js
import express from 'express';
import {
    // ... (existing imports)
    searchUsers,
    saveArticleForUser,      // <-- IMPORT NEW
    unsaveArticleForUser,    // <-- IMPORT NEW
    getSavedArticlesForUser, // <-- IMPORT NEW
    // ... (rest of existing imports)
    getUserProfileByUsername,
    followUser,
    unfollowUser,
    getMyFollowers,
    getMyFollowing,
    getMyPendingFollowRequests,
    respondToFollowRequest,
    removeFollower,
    updateUserProfile,
    toggleAccountPrivacy,
    changeUsername,
    changePassword,
    deleteAccount,
    requestVerification,
    getVerificationRequests,
    approveVerification,
} from '../controllers/user.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/profile/:username', protect, getUserProfileByUsername);
router.post('/:userIdToFollow/follow', protect, followUser);
router.post('/:userIdToUnfollow/unfollow', protect, unfollowUser);

// --- Routes for "Me" (current authenticated user) ---
router.get('/me/followers', protect, getMyFollowers);
router.get('/me/following', protect, getMyFollowing);
router.get('/me/pending-requests', protect, getMyPendingFollowRequests);
router.post('/me/pending-requests/:requesterId/respond', protect, respondToFollowRequest);
router.delete('/me/followers/:followerIdToRemove', protect, removeFollower);

router.put('/me/profile', protect, updateUserProfile);
router.put('/me/privacy', protect, toggleAccountPrivacy);
router.put('/me/change-username', protect, changeUsername);
router.put('/me/change-password', protect, changePassword);
router.delete('/me/account', protect, deleteAccount);
router.post('/me/request-verification', protect, requestVerification);

// --- NEW Saved Article Routes for "Me" ---
router.post('/me/saved-articles', protect, saveArticleForUser);
router.get('/me/saved-articles', protect, getSavedArticlesForUser);
router.delete('/me/saved-articles/:savedItemId', protect, unsaveArticleForUser);


// --- Admin Routes for User Management ---
router.get('/admin/verification-requests', protect, admin, getVerificationRequests);
router.post('/admin/verification-requests/:userId/approve', protect, admin, approveVerification);

export default router;