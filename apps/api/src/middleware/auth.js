const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const Event = require('../models/Event');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in to continue.',
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User session has expired or account is disabled.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token. Please log in again.',
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore error for optional auth
  }
  next();
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
};

const requireEventOrganizer = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.params.id;
    if (!eventId) {
      return res.status(400).json({ success: false, error: 'Event ID required.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    const isOrganizer = event.organizerId.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('admin');

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access restricted to event organizers.',
      });
    }

    req.event = event;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requireEventOrganizer,
};
