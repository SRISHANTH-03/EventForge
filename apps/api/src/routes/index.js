const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const sessionRoutes = require('./sessionRoutes');
const attendeeRoutes = require('./attendeeRoutes');
const checkInRoutes = require('./checkInRoutes');
const volunteerRoutes = require('./volunteerRoutes');
const taskRoutes = require('./taskRoutes');
const announcementRoutes = require('./announcementRoutes');
const twinRoutes = require('./twinRoutes');
const aiRoutes = require('./aiRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const feedbackRoutes = require('./feedbackRoutes');

const attendeeController = require('../controllers/attendeeController');
const volunteerController = require('../controllers/volunteerController');
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

// Auth routes
router.use('/auth', authRoutes);

// Base Event routes
router.use('/events', eventRoutes);

// Nested Event sub-routes
router.use('/events/:eventId/sessions', sessionRoutes);
router.use('/events/:eventId/attendees', attendeeRoutes);
router.use('/events/:eventId/checkin', checkInRoutes);
router.use('/events/:eventId/volunteers', volunteerRoutes);
router.use('/events/:eventId/tasks', taskRoutes);
router.use('/events/:eventId/announcements', announcementRoutes);
router.use('/events/:eventId/twin', twinRoutes);
router.use('/events/:eventId/ai', aiRoutes);
router.use('/events/:eventId/analytics', analyticsRoutes);
router.use('/events/:eventId/feedback', feedbackRoutes);

// Convenience Top-Level Routes
router.get('/tickets/:ticketCode', attendeeController.getMyTicket);
router.get('/volunteers/me', authenticate, volunteerController.getMyVolunteerPortal);
router.patch('/tasks/:id', authenticate, taskController.updateTask);
router.delete('/tasks/:id', authenticate, taskController.deleteTask);

module.exports = router;
