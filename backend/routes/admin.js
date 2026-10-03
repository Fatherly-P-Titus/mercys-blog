const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require auth
router.use(authenticateToken, requireAdmin);

// Stats
router.get('/stats', adminController.getStats);

// Site content
router.get('/site-content/:section', adminController.getSiteContent);
router.put('/site-content/:section', adminController.updateSiteContent);

module.exports = router;
