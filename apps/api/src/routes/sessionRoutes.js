const express = require('express');
const router = express.Router({ mergeParams: true });
const sessionController = require('../controllers/sessionController');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');

// Sessions
router.get('/', optionalAuth, sessionController.getSessions);
router.post('/', authenticate, requireRole('organizer', 'admin'), sessionController.createSession);
router.patch('/item/:id', authenticate, requireRole('organizer', 'admin'), sessionController.updateSession);
router.delete('/item/:id', authenticate, requireRole('organizer', 'admin'), sessionController.deleteSession);

// Rooms
router.get('/rooms', optionalAuth, sessionController.getRooms);
router.post('/rooms', authenticate, requireRole('organizer', 'admin'), sessionController.createRoom);
router.patch('/rooms/:id', authenticate, requireRole('organizer', 'admin'), sessionController.updateRoom);
router.delete('/rooms/:id', authenticate, requireRole('organizer', 'admin'), sessionController.deleteRoom);

// Speakers
router.get('/speakers', optionalAuth, sessionController.getSpeakers);
router.post('/speakers', authenticate, requireRole('organizer', 'admin'), sessionController.createSpeaker);
router.patch('/speakers/:id', authenticate, requireRole('organizer', 'admin'), sessionController.updateSpeaker);
router.delete('/speakers/:id', authenticate, requireRole('organizer', 'admin'), sessionController.deleteSpeaker);

module.exports = router;
