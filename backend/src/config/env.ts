import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vjn-billing',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  nodeEnv: process.env.NODE_ENV || 'development',
};
