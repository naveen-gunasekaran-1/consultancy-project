import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import User from '../models/User';
import { logger } from '../utils/logger';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  tokenVersion: number;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      logger.warn('auth.missing_token', {
        requestId: req.requestId,
        path: req.originalUrl,
      });
      res.status(401).json({ message: 'No token, authorization denied' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    const user = await User.findById(decoded.id).select('email role isActive tokenVersion');
    if (!user || !user.isActive) {
      logger.warn('auth.user_not_active_or_missing', {
        requestId: req.requestId,
        userId: decoded.id,
      });
      res.status(401).json({ message: 'User not found or inactive' });
      return;
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      logger.warn('auth.session_expired', {
        requestId: req.requestId,
        userId: decoded.id,
        tokenVersion: decoded.tokenVersion,
        currentTokenVersion: user.tokenVersion,
      });
      res.status(401).json({ message: 'Session expired. Please login again.' });
      return;
    }

    req.user = {
      id: decoded.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };
    
    next();
  } catch (error) {
    logger.warn('auth.invalid_token', {
      requestId: req.requestId,
      error,
    });
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check if user exists and is admin
    if (!req.user || req.user.role !== 'admin') {
      logger.warn('auth.admin_access_denied', {
        requestId: req.requestId,
        userId: req.user?.id,
      });
      res.status(403).json({ message: 'Access denied. Admin only.' });
      return;
    }
    
    next();
  } catch (error) {
    logger.error('auth.admin_middleware_error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Server error in admin middleware' });
  }
};
