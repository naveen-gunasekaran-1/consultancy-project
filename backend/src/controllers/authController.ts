import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userRepository from '../repositories/userRepository';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const generateToken = (user: { id: number; email: string; role: string; tokenVersion: number }): string =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      logger.warn('auth.login.validation_failed', {
        requestId: req.requestId,
        reason: 'missing_email_or_password',
      });
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn('auth.login.validation_failed', {
        requestId: req.requestId,
        reason: 'invalid_email_format',
        email,
      });
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    const normalizedEmail = email.toLowerCase();
    if (normalizedEmail !== config.singleUserEmail.toLowerCase()) {
      logger.warn('auth.login.failed', {
        requestId: req.requestId,
        reason: 'non_single_user_login_attempt',
        email: normalizedEmail,
      });
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Find user in database
    const user = userRepository.findByEmail(normalizedEmail);
    
    if (!user) {
      logger.warn('auth.login.failed', {
        requestId: req.requestId,
        reason: 'user_not_found',
        email: normalizedEmail,
      });
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      logger.warn('auth.login.failed', {
        requestId: req.requestId,
        reason: 'invalid_password',
        userId: user.id,
      });
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn('auth.login.failed', {
        requestId: req.requestId,
        reason: 'inactive_user',
        userId: user.id,
      });
      res.status(403).json({ message: 'Account is deactivated. Please contact administrator.' });
      return;
    }

    // Increment token version for security
    userRepository.incrementTokenVersion(user.id);
    const updatedUser = userRepository.findById(user.id);

    if (!updatedUser) {
      logger.error('auth.login.error', {
        requestId: req.requestId,
        reason: 'user_disappeared_during_update',
        userId: user.id,
      });
      res.status(500).json({ message: 'Unable to complete login' });
      return;
    }

    const token = generateToken(updatedUser);

    logger.info('auth.login.success', {
      requestId: req.requestId,
      userId: updatedUser.id,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    logger.error('auth.login.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const existingUsersCount = userRepository.count();
    if (existingUsersCount > 0) {
      logger.warn('auth.register.blocked_single_user_mode', {
        requestId: req.requestId,
        attemptedEmail: email,
      });
      res.status(403).json({ message: 'Registration disabled: application is in single-user mode' });
      return;
    }

    // Validation
    if (!email || !password) {
      logger.warn('auth.register.validation_failed', {
        requestId: req.requestId,
        reason: 'missing_email_or_password',
      });
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn('auth.register.validation_failed', {
        requestId: req.requestId,
        reason: 'invalid_email_format',
      });
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    // Password strength validation
    if (password.length < 6) {
      logger.warn('auth.register.validation_failed', {
        requestId: req.requestId,
        reason: 'password_too_short',
      });
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    // Check if user already exists
    const existingUser = userRepository.findByEmail(email.toLowerCase());
    if (existingUser) {
      logger.warn('auth.register.failed', {
        requestId: req.requestId,
        reason: 'email_exists',
        email: email.toLowerCase(),
      });
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = userRepository.create({
      name: name || 'Administrator',
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
    });

    const token = generateToken(user);

    logger.info('auth.register.success', {
      requestId: req.requestId,
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('auth.register.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    userRepository.incrementTokenVersion(userId);

    logger.info('auth.logout.success', {
      requestId: req.requestId,
      userId,
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error('auth.logout.error', {
      requestId: req.requestId,
      userId: req.user?.id,
      error,
    });
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Token is already verified by authMiddleware
    // req.user is populated by the middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    const user = userRepository.findById(userId);
    
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Account is deactivated' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('auth.verify.error', {
      requestId: req.requestId,
      userId: req.user?.id,
      error,
    });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
