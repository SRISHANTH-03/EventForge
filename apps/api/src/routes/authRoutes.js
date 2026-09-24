const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/demo', authController.demoLogin);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
