const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const postsController = require('../controllers/postsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * Public:
 *   GET /api/admin/site-content/:section
 * Protected:
 *   GET  /api/admin/stats
 *   GET  /api/admin/posts
 *   PUT  /api/admin/site-content/:section
 */

// Public read — homepage & profile content for the live site
router.get('/site-content/:section', adminController.getSiteContent);

// Admin-only
router.get('/stats', authenticateToken, requireAdmin, adminController.getStats);
router.get('/posts', authenticateToken, requireAdmin, postsController.getAllPosts);
router.put(
  '/site-content/:section',
  authenticateToken,
  requireAdmin,
  adminController.updateSiteContent
);

module.exports = router;
