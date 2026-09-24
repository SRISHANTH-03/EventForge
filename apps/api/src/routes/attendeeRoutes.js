const express = require('express');
const router = express.Router({ mergeParams: true });
const attendeeController = require('../controllers/attendeeController');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');

router.post('/register', optionalAuth, attendeeController.register);
router.get('/', authenticate, requireRole('organizer', 'admin', 'volunteer'), attendeeController.getAttendees);
router.patch('/:id/cancel', authenticate, attendeeController.cancelRegistration);

module.exports = router;
