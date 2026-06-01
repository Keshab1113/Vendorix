import { verifyToken } from '../utils/helpers.js';
import { User } from '../models/User.js';
import { apiError } from '../utils/helpers.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiError(res, 401, 'Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return apiError(res, 401, 'Invalid or expired token');
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user || !user.is_active || user.deleted_at) {
      return apiError(res, 401, 'User not found or inactive');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      is_active: user.is_active
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    apiError(res, 500, 'Authentication failed');
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiError(res, 401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return apiError(res, 403, 'Insufficient permissions');
    }

    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      if (decoded) {
        const user = await User.findById(decoded.userId);

        if (user && user.is_active && !user.deleted_at) {
          req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            is_active: user.is_active
          };
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};