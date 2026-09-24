const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const config = require('../config/env');
const { logAudit } = require('../middleware/audit');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      avatar: user.avatar,
      title: user.title,
    },
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
exports.signup = async (req, res, next) => {
  try {
    const signupSchema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Please provide a valid email'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      role: z.enum(['organizer', 'volunteer', 'attendee', 'speaker', 'admin']).optional(),
      title: z.string().optional(),
    });

    const parsed = signupSchema.parse(req.body);
    const existingUser = await User.findOne({ email: parsed.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please log in.',
      });
    }

    const passwordHash = await User.hashPassword(parsed.password);
    const roles = parsed.role ? [parsed.role] : ['organizer'];

    const user = await User.create({
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      passwordHash,
      roles,
      title: parsed.title || '',
    });

    await logAudit({
      actorId: user._id,
      action: 'USER_SIGNUP',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email, roles },
    });

    sendTokenResponse(user, 201, res, 'Account created successfully.');
  } catch (err) {
    next(err);
  }
};

// @desc    Login existing user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const loginSchema = z.object({
      email: z.string().email('Please enter a valid email'),
      password: z.string().min(1, 'Please enter your password'),
    });

    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your email and password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your email and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'This account has been deactivated. Please contact support.',
      });
    }

    await logAudit({
      actorId: user._id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email },
    });

    sendTokenResponse(user, 200, res, 'Logged in successfully.');
  } catch (err) {
    next(err);
  }
};

// @desc    One-click Demo Login Switcher
// @route   POST /api/auth/demo
exports.demoLogin = async (req, res, next) => {
  try {
    const { role = 'organizer' } = req.body;
    const demoEmail = `${role.toLowerCase()}@eventforge.demo`;

    let user = await User.findOne({ email: demoEmail });
    if (!user) {
      // Auto-create demo user if not yet seeded
      const passwordHash = await User.hashPassword('DemoPass123!');
      user = await User.create({
        name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        email: demoEmail,
        passwordHash,
        roles: [role.toLowerCase()],
        title: `Demo ${role.toUpperCase()}`,
      });
    }

    sendTokenResponse(user, 200, res, `Switched to Demo ${role.toUpperCase()} account.`);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user session
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      roles: req.user.roles,
      avatar: req.user.avatar,
      title: req.user.title,
      bio: req.user.bio,
      phone: req.user.phone,
    },
  });
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
