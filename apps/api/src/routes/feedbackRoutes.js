const express = require('express');
const router = express.Router({ mergeParams: true });
const feedbackController = require('../controllers/feedbackController');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');

router.post('/', optionalAuth, feedbackController.submitFeedback);
router.get('/', authenticate, requireRole('organizer', 'admin'), feedbackController.getEventFeedback);

module.exports = router;
