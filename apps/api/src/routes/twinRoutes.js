const express = require('express');
const router = express.Router({ mergeParams: true });
const twinController = require('../controllers/twinController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/scenarios', authenticate, requireRole('organizer', 'admin'), twinController.getScenarios);
router.post('/simulate', authenticate, requireRole('organizer', 'admin'), twinController.runSimulation);
router.post('/apply-action', authenticate, requireRole('organizer', 'admin'), twinController.applyAction);

module.exports = router;
