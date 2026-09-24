const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');

router.get('/', optionalAuth, eventController.getEvents);
router.post('/', authenticate, requireRole('organizer', 'admin'), eventController.createEvent);
router.get('/:id', optionalAuth, eventController.getEventById);
router.patch('/:id', authenticate, requireRole('organizer', 'admin'), eventController.updateEvent);
router.delete('/:id', authenticate, requireRole('organizer', 'admin'), eventController.deleteEvent);
router.patch('/:id/publish', authenticate, requireRole('organizer', 'admin'), eventController.publishEvent);
router.get('/:id/readiness', authenticate, eventController.getEventReadiness);

module.exports = router;
