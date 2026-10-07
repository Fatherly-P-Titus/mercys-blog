const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const commentsController = require('../controllers/commentsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public list
router.get('/', postsController.getPosts);

// Comments (must be before /:idOrSlug for clarity; multi-segment paths are distinct)
router.get('/:id/comments', commentsController.getComments);
router.post('/:id/comments', commentsController.createComment);
router.delete(
  '/:id/comments/:commentId',
  authenticateToken,
  requireAdmin,
  commentsController.deleteComment
);

// Engagement
router.post('/:id/like', postsController.likePost);

// Single post
router.get('/:idOrSlug', postsController.getPost);

// Admin CRUD — optional image via multipart field "image"
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  postsController.createPost
);
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  postsController.updatePost
);
router.delete('/:id', authenticateToken, requireAdmin, postsController.deletePost);

module.exports = router;
