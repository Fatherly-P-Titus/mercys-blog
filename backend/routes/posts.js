const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public
router.get('/', postsController.getPosts);
router.get('/:idOrSlug', postsController.getPost);

// Admin only
router.post('/', authenticateToken, requireAdmin, postsController.createPost);
router.put('/:id', authenticateToken, requireAdmin, postsController.updatePost);
router.delete('/:id', authenticateToken, requireAdmin, postsController.deletePost);

module.exports = router;
