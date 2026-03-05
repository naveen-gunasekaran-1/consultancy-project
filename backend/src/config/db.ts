import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const ensureSingleUser = async (): Promise<void> => {
  const userCount = await User.countDocuments();

  if (userCount === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(config.singleUserPassword, salt);

    const user = await User.create({
      email: config.singleUserEmail.toLowerCase(),
      fullName: config.singleUserFullName,
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      tokenVersion: 1,
      lastLoginAt: new Date(),
    });

    logger.warn('auth.single_user_bootstrapped', {
      userId: user._id,
      email: user.email,
      message: 'Default single user created. Change SINGLE_USER_PASSWORD in production.',
    });
    return;
  }

  if (userCount > 1) {
    logger.warn('auth.single_user_mode_violation', {
      userCount,
      message: 'More than one user exists in single-user mode.',
    });
  }
};

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('db.connected', { mongoUri: config.mongoUri });
    await ensureSingleUser();
  } catch (error) {
    logger.error('db.connection_error', { error });
    process.exit(1);
  }
};
