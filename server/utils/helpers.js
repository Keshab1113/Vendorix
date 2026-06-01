import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, role, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const generateBookingRef = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BK-${year}-${random}`;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const paginate = (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset: parseInt(offset) };
};

export const apiResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data
  });
};

export const apiError = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};