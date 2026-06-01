import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String },
  type: { type: String },
  is_read: { type: Boolean, default: false },
  link: { type: String }
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', notificationSchema);