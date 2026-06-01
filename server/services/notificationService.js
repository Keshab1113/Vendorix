import { Notification } from '../models/Notification.js';

export const notificationService = {
  async getById(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw { status: 404, message: 'Notification not found' };
    }
    return notification;
  },

  async getByUserId(userId, filters = {}) {
    const query = { user_id: userId };

    if (filters.is_read !== undefined) {
      query.is_read = filters.is_read;
    }

    return Notification.find(query).sort({ createdAt: -1 });
  },

  async create(userId, data) {
    const notification = await Notification.create({
      user_id: userId,
      title: data.title,
      message: data.message,
      type: data.type || 'general',
      link: data.link || null
    });
    return notification;
  },

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({ _id: notificationId, user_id: userId });
    if (!notification) {
      throw { status: 404, message: 'Notification not found' };
    }

    notification.is_read = true;
    await notification.save();
    return notification;
  },

  async markAllAsRead(userId) {
    await Notification.updateMany({ user_id: userId, is_read: false }, { is_read: true });
    return { success: true };
  },

  async delete(notificationId, userId) {
    const notification = await Notification.findOne({ _id: notificationId, user_id: userId });
    if (!notification) {
      throw { status: 404, message: 'Notification not found' };
    }

    await Notification.findByIdAndDelete(notificationId);
    return { success: true };
  },

  async deleteAll(userId) {
    await Notification.deleteMany({ user_id: userId });
    return { success: true };
  },

  async getUnreadCount(userId) {
    return Notification.countDocuments({ user_id: userId, is_read: false });
  },

  async getAll(filters = {}) {
    const query = {};

    if (filters.user_id) {
      query.user_id = filters.user_id;
    }
    if (filters.is_read !== undefined) {
      query.is_read = filters.is_read;
    }
    if (filters.type) {
      query.type = filters.type;
    }

    return Notification.find(query)
      .populate('user_id', 'email')
      .sort({ createdAt: -1 });
  },

  // Predefined notification creators for common events
  async notifyNewInquiry(vendorUserId, inquiry) {
    return this.create(vendorUserId, {
      title: 'New Inquiry Received',
      message: `${inquiry.customer_name} sent a new inquiry for ${inquiry.event_type} event on ${inquiry.event_date}`,
      type: 'inquiry',
      link: `/inquiries/${inquiry._id}`
    });
  },

  async notifyBookingConfirmed(vendorUserId, booking, customerName) {
    return this.create(vendorUserId, {
      title: 'Booking Confirmed',
      message: `${customerName} confirmed the booking ${booking.booking_ref}`,
      type: 'booking',
      link: `/bookings/${booking._id}`
    });
  },

  async notifyPaymentReceived(vendorUserId, booking, amount) {
    return this.create(vendorUserId, {
      title: 'Payment Received',
      message: `Payment of $${amount} received for booking ${booking.booking_ref}`,
      type: 'payment',
      link: `/bookings/${booking._id}`
    });
  },

  async notifyNewReview(vendorUserId, review, customerName) {
    return this.create(vendorUserId, {
      title: 'New Review Submitted',
      message: `${customerName} left a ${review.rating}-star review`,
      type: 'review',
      link: '/reviews'
    });
  },

  async notifyEventReminder(vendorUserId, inquiry, daysUntil) {
    return this.create(vendorUserId, {
      title: 'Event Reminder',
      message: `${inquiry.event_type} event in ${daysUntil} days - contact ${inquiry.customer_name} to confirm details`,
      type: 'reminder',
      link: `/inquiries/${inquiry._id}`
    });
  }
};

export default notificationService;