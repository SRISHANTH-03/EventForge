const express = require('express');
const router = express.Router({ mergeParams: true });
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.post('/assistant', authenticate, aiController.askQuestion);
router.post('/summarize', authenticate, aiController.generateBriefing);

module.exports = router;
