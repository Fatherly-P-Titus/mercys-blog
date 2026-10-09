const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const commentsController = require('../controllers/commentsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

/** Run multer only when the request is multipart (JSON PUTs skip it) */
function optionalImage(req, res, next) {
  const ct = req.headers['content-type'] || '';
  if (ct.indexOf('multipart/form-data') === 0) {
    return upload.single('image')(req, res, next);
  }
  return next();
}

// Public list
router.get('/', postsController.getPosts);

// Comments
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

// Admin CRUD
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  optionalImage,
  postsController.createPost
);
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  optionalImage,
  postsController.updatePost
);
router.delete('/:id', authenticateToken, requireAdmin, postsController.deletePost);

module.exports = router;
