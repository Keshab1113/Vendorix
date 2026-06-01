import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'vendor'],
    default: 'vendor'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  remember_token: String,
  reset_token: String,
  reset_token_expires: Date,
  deleted_at: Date
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);