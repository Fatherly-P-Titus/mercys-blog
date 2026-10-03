const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/admin/login
router.post('/login', authController.login);

// GET /api/admin/me  (protected)
router.get('/me', authenticateToken, authController.me);

module.exports = router;
