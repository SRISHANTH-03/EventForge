const express = require('express');
const router = express.Router({ mergeParams: true });
const announcementController = require('../controllers/announcementController');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');

router.get('/', optionalAuth, announcementController.getAnnouncements);
router.post('/', authenticate, requireRole('organizer', 'admin'), announcementController.createAnnouncement);
router.delete('/:id', authenticate, requireRole('organizer', 'admin'), announcementController.deleteAnnouncement);

module.exports = router;
