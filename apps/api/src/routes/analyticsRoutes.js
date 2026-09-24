const express = require('express');
const router = express.Router({ mergeParams: true });
const analyticsController = require('../controllers/analyticsController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, requireRole('organizer', 'admin'), analyticsController.getEventAnalytics);

module.exports = router;
