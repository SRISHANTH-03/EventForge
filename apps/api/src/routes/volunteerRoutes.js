const express = require('express');
const router = express.Router({ mergeParams: true });
const volunteerController = require('../controllers/volunteerController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, volunteerController.getVolunteers);
router.post('/', authenticate, requireRole('organizer', 'admin'), volunteerController.addVolunteer);
router.patch('/:id', authenticate, volunteerController.updateVolunteer);
router.delete('/:id', authenticate, requireRole('organizer', 'admin'), volunteerController.deleteVolunteer);

module.exports = router;
