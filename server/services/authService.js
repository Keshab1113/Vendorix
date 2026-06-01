import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';
import { generateTokens, verifyToken } from '../utils/helpers.js';

export const authService = {
  async register(email, password, role = 'vendor') {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw { status: 400, message: 'Email already registered' };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      password_hash: passwordHash,
      role
    });

    return {
      userId: user._id.toString(),
      email,
      role
    };
  },

  async login(email, password) {
    // Find user
    const user = await User.findOne({ email, deleted_at: null });

    if (!user) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    if (!user.is_active) {
      throw { status: 403, message: 'Account is deactivated' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    // Generate tokens
    const tokens = generateTokens(user._id.toString(), user.role);

    return {
      user: { id: user._id, email: user.email, role: user.role },
      tokens
    };
  },

  async getUserById(userId) {
    const user = await User.findById(userId);

    if (!user || user.deleted_at) {
      throw { status: 404, message: 'User not found' };
    }

    return {
      id: user._id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      createdAt: user.createdAt
    };
  },

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw { status: 401, message: 'Refresh token required' };
    }

    const decoded = verifyToken(refreshToken);

    if (!decoded || decoded.type !== 'refresh') {
      throw { status: 401, message: 'Invalid refresh token' };
    }

    // Generate new tokens
    const tokens = generateTokens(decoded.userId, decoded.role);

    return tokens;
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw { status: 400, message: 'Current password is incorrect' };
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    user.password_hash = passwordHash;
    await user.save();

    return { success: true };
  },

  async generateResetToken(email) {
    const user = await User.findOne({ email, deleted_at: null });

    if (!user) {
      // Don't reveal if email exists
      return { success: true, message: 'If email exists, reset instructions sent' };
    }

    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.reset_token = resetToken;
    user.reset_token_expires = expires;
    await user.save();

    return { success: true, resetToken }; // In production, send email instead
  },

  async resetPassword(token, password) {
    const user = await User.findOne({
      reset_token: token,
      reset_token_expires: { $gt: new Date() },
      deleted_at: null
    });

    if (!user) {
      throw { status: 400, message: 'Invalid or expired reset token' };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    user.password_hash = passwordHash;
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    return { success: true };
  },

  async deactivateAccount(userId) {
    await User.findByIdAndUpdate(userId, { is_active: false });
    return { success: true };
  },

  async deleteAccount(userId) {
    await User.findByIdAndUpdate(userId, { deleted_at: new Date() });
    return { success: true };
  }
};

export default authService;