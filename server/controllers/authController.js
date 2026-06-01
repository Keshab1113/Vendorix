import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';
import { generateTokens, apiResponse, apiError, verifyToken } from '../utils/helpers.js';

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return apiError(res, 400, 'Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      password_hash: passwordHash,
      role: 'vendor'
    });

    // Create vendor profile
    await Vendor.create({
      user_id: user._id,
      business_name: email.split('@')[0],
      email
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), 'vendor');

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return apiResponse(res, 201, 'Registration successful', {
      user: { id: user._id, email, role: 'vendor' },
      accessToken
    });
  } catch (error) {
    console.error('Register error:', error);
    apiError(res, 500, 'Registration failed');
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    // Find user
    const user = await User.findOne({ email, deleted_at: null });

    if (!user) {
      return apiError(res, 401, 'Invalid email or password');
    }

    if (!user.is_active) {
      return apiError(res, 403, 'Account is deactivated');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return apiError(res, 401, 'Invalid email or password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
    });

    // Get vendor profile
    const vendor = await Vendor.findOne({ user_id: user._id }) || null;

    return apiResponse(res, 200, 'Login successful', {
      user: { id: user._id, email: user.email, role: user.role, vendor },
      accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    apiError(res, 500, 'Login failed');
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return apiResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    apiError(res, 500, 'Logout failed');
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;

    // Get vendor profile
    const vendor = await Vendor.findOne({ user_id: user.id }) || null;

    return apiResponse(res, 200, 'User retrieved', {
      user: { id: user.id, email: user.email, role: user.role },
      vendor
    });
  } catch (error) {
    console.error('GetMe error:', error);
    apiError(res, 500, 'Failed to get user');
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return apiError(res, 401, 'Refresh token required');
    }

    const decoded = verifyToken(refreshToken);

    if (!decoded || decoded.type !== 'refresh') {
      return apiError(res, 401, 'Invalid refresh token');
    }

    // Generate new access token
    const { accessToken } = generateTokens(decoded.userId, decoded.role);

    return apiResponse(res, 200, 'Token refreshed', { accessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    apiError(res, 500, 'Token refresh failed');
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, deleted_at: null });

    if (!user) {
      // Don't reveal if email exists
      return apiResponse(res, 200, 'If email exists, reset instructions sent');
    }

    // Generate reset token
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.reset_token = resetToken;
    user.reset_token_expires = expires;
    await user.save();

    // In production: send email with reset link
    // For demo: return token (remove in production)
    return apiResponse(res, 200, 'If email exists, reset instructions sent', {
      resetToken // Remove this in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    apiError(res, 500, 'Failed to process request');
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      reset_token: token,
      reset_token_expires: { $gt: new Date() },
      deleted_at: null
    });

    if (!user) {
      return apiError(res, 400, 'Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    user.password_hash = passwordHash;
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    return apiResponse(res, 200, 'Password reset successful');
  } catch (error) {
    console.error('Reset password error:', error);
    apiError(res, 500, 'Failed to reset password');
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return apiError(res, 404, 'User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return apiError(res, 400, 'Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    user.password_hash = passwordHash;
    await user.save();

    return apiResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    apiError(res, 500, 'Failed to change password');
  }
};