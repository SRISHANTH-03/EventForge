const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const config = require('./config/env');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in local development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', platform: 'EventForge API', time: new Date() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', platform: 'EventForge API', time: new Date() });
});

// Mount Master API
app.use('/api', routes);

// Centralized Error Handling
app.use(errorHandler);

const PORT = config.port || 5001;
const server = app.listen(PORT, () => {
  console.log(`[EventForge API] Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err);
});

module.exports = app;
