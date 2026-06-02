import { Notification } from '../models/Notification.js';
import { apiResponse, apiError } from '../utils/helpers.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unread_only } = req.query;

    const query = { user_id: userId };
    if (unread_only === 'true') {
      query.is_read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    // Get unread count
    const unread_count = await Notification.countDocuments({ user_id: userId, is_read: false });

    return apiResponse(res, 200, 'Notifications retrieved', {
      notifications,
      unread_count
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    apiError(res, 500, 'Failed to get notifications');
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({ _id: id, user_id: userId });

    if (!notification) {
      return apiError(res, 404, 'Notification not found');
    }

    notification.is_read = true;
    await notification.save();

    return apiResponse(res, 200, 'Notification marked as read');
  } catch (error) {
    console.error('Mark as read error:', error);
    apiError(res, 500, 'Failed to mark as read');
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany({ user_id: userId, is_read: false }, { is_read: true });

    return apiResponse(res, 200, 'All notifications marked as read');
  } catch (error) {
    console.error('Mark all as read error:', error);
    apiError(res, 500, 'Failed to mark all as read');
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate id format before querying
    if (!id || id === 'undefined' || id === 'null' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return apiError(res, 400, 'Invalid notification ID');
    }

    const notification = await Notification.findOne({ _id: id, user_id: userId });

    if (!notification) {
      return apiError(res, 404, 'Notification not found');
    }

    await Notification.findByIdAndDelete(id);

    return apiResponse(res, 200, 'Notification deleted');
  } catch (error) {
    console.error('Delete notification error:', error);
    apiError(res, 500, 'Failed to delete notification');
  }
};