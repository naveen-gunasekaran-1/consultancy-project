import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vjn-billing',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  singleUserEmail: process.env.SINGLE_USER_EMAIL || 'admin@vjn.com',
  singleUserPassword: process.env.SINGLE_USER_PASSWORD || 'admin123',
  singleUserFullName: process.env.SINGLE_USER_FULL_NAME || 'Administrator',
};
