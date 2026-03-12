// Rewrite/server/routes/content.routes.js
import express from 'express';
import {
  getFilteredContent,
  // searchArticles,
  getMyPageFeed,
  getExploreFeed,
  getContentById,
  getContentLineage,
  getContentVersions,
  createContent,
  updateContent,
  toggleLikeContent,
  reportContent,
  getArticlesByUser,
  toggleArticlePrivacy,
  getAllContentForAdmin,
  deleteContentForAdmin,
} from '../controllers/content.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- Feed Routes ---
router.get('/feed/my-page', protect, getMyPageFeed); // This route should exist
router.get('/feed/explore', protect, getExploreFeed);
//router.get('/search', protect, searchArticles);

// --- General Content Routes ---
router.get('/', getFilteredContent);
router.get('/user/:userId', protect, getArticlesByUser); // 'protect' makes req.user available for privacy checks
router.get('/:id', getContentById);
router.get('/:id/lineage', getContentLineage);
router.get('/:id/versions', getContentVersions);

// --- Protected Content Actions ---
router.post('/', protect, createContent);
router.put('/:id', protect, updateContent);
router.put('/:articleId/privacy', protect, toggleArticlePrivacy);
router.post('/:id/like', protect, toggleLikeContent);
router.post('/:id/report', protect, reportContent);

// --- Admin Routes ---
router.get('/admin/all', protect, admin, getAllContentForAdmin);
router.delete('/admin/:id', protect, admin, deleteContentForAdmin);

export default router;