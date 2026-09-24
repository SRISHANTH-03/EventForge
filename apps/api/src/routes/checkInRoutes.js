const express = require('express');
const router = express.Router({ mergeParams: true });
const checkInController = require('../controllers/checkInController');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/', authenticate, requireRole('organizer', 'admin', 'volunteer'), checkInController.processCheckIn);
router.get('/stats', authenticate, requireRole('organizer', 'admin', 'volunteer'), checkInController.getCheckInStats);

module.exports = router;
