const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to root .env

const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://srishanthpagidimarry333_db_user:srishanth123@employeemanagement.6vhbxkl.mongodb.net/?appName=EmployeeManagement',
  jwtSecret: process.env.JWT_SECRET || 'eventforge_jwt_super_secret_production_key_2026!',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openAiApiKey: process.env.OPENAI_API_KEY || ''
};

module.exports = config;


