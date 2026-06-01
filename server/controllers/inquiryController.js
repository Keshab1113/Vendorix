import { Inquiry } from '../models/Inquiry.js';
import { Booking } from '../models/Booking.js';
import { Notification } from '../models/Notification.js';
import { Vendor } from '../models/Vendor.js';
import { apiResponse, apiError, paginate } from '../utils/helpers.js';

export const getInquiries = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const { page = 1, limit = 20, status, search, priority, date_from, date_to } = req.query;
    const { offset } = paginate(page, limit);

    // Build query
    const query = { vendor_id: vendor._id };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { customer_name: { $regex: search, $options: 'i' } },
        { customer_email: { $regex: search, $options: 'i' } },
        { event_type: { $regex: search, $options: 'i' } }
      ];
    }

    if (date_from || date_to) {
      query.event_date = {};
      if (date_from) query.event_date.$gte = new Date(date_from);
      if (date_to) query.event_date.$lte = new Date(date_to);
    }

    const total = await Inquiry.countDocuments(query);

    const inquiries = await Inquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(parseInt(limit));

    return apiResponse(res, 200, 'Inquiries retrieved', {
      inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    apiError(res, 500, 'Failed to get inquiries');
  }
};

export const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const inquiry = await Inquiry.findOne({ _id: id, vendor_id: vendor._id });

    if (!inquiry) {
      return apiError(res, 404, 'Inquiry not found');
    }

    // Get related booking if exists
    const booking = await Booking.findOne({ inquiry_id: id });

    const inquiryObj = inquiry.toObject();
    inquiryObj.booking = booking;

    return apiResponse(res, 200, 'Inquiry retrieved', inquiryObj);
  } catch (error) {
    console.error('Get inquiry error:', error);
    apiError(res, 500, 'Failed to get inquiry');
  }
};

export const createInquiry = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      event_type,
      event_date,
      event_location,
      guest_count,
      budget,
      notes,
      priority
    } = req.body;

    const inquiry = await Inquiry.create({
      vendor_id: vendor._id,
      customer_name,
      customer_email,
      customer_phone,
      event_type,
      event_date,
      event_location,
      guest_count,
      budget,
      notes,
      priority: priority || 'medium'
    });

    // Create notification
    await Notification.create({
      user_id: userId,
      title: 'New Inquiry Received',
      message: `${customer_name} sent a new inquiry for ${event_type}`,
      type: 'inquiry',
      link: `/inquiries/${inquiry._id}`
    });

    return apiResponse(res, 201, 'Inquiry created', inquiry);
  } catch (error) {
    console.error('Create inquiry error:', error);
    apiError(res, 500, 'Failed to create inquiry');
  }
};

export const updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const inquiry = await Inquiry.findOne({ _id: id, vendor_id: vendor._id });
    if (!inquiry) {
      return apiError(res, 404, 'Inquiry not found');
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      event_type,
      event_date,
      event_location,
      guest_count,
      budget,
      notes,
      priority
    } = req.body;

    // Update fields if provided
    if (customer_name !== undefined) inquiry.customer_name = customer_name;
    if (customer_email !== undefined) inquiry.customer_email = customer_email;
    if (customer_phone !== undefined) inquiry.customer_phone = customer_phone;
    if (event_type !== undefined) inquiry.event_type = event_type;
    if (event_date !== undefined) inquiry.event_date = event_date;
    if (event_location !== undefined) inquiry.event_location = event_location;
    if (guest_count !== undefined) inquiry.guest_count = guest_count;
    if (budget !== undefined) inquiry.budget = budget;
    if (notes !== undefined) inquiry.notes = notes;
    if (priority !== undefined) inquiry.priority = priority;

    await inquiry.save();

    return apiResponse(res, 200, 'Inquiry updated', inquiry);
  } catch (error) {
    console.error('Update inquiry error:', error);
    apiError(res, 500, 'Failed to update inquiry');
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const validStatuses = ['pending', 'contacted', 'confirmed', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return apiError(res, 400, 'Invalid status');
    }

    const inquiry = await Inquiry.findOne({ _id: id, vendor_id: vendor._id });
    if (!inquiry) {
      return apiError(res, 404, 'Inquiry not found');
    }

    inquiry.status = status;
    await inquiry.save();

    // Create notification for status change
    await Notification.create({
      user_id: userId,
      title: 'Inquiry Status Updated',
      message: `Inquiry #${id} status changed to ${status}`,
      type: 'inquiry',
      link: `/inquiries/${id}`
    });

    return apiResponse(res, 200, 'Status updated', inquiry);
  } catch (error) {
    console.error('Update status error:', error);
    apiError(res, 500, 'Failed to update status');
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const inquiry = await Inquiry.findOne({ _id: id, vendor_id: vendor._id });
    if (!inquiry) {
      return apiError(res, 404, 'Inquiry not found');
    }

    await Inquiry.findByIdAndDelete(id);
    return apiResponse(res, 200, 'Inquiry deleted');
  } catch (error) {
    console.error('Delete inquiry error:', error);
    apiError(res, 500, 'Failed to delete inquiry');
  }
};

export const getInquiryStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    // Total inquiries
    const total = await Inquiry.countDocuments({ vendor_id: vendor._id });

    // Status counts
    const statusDocs = await Inquiry.aggregate([
      { $match: { vendor_id: vendor._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const status_breakdown = statusDocs.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Priority counts
    const priorityDocs = await Inquiry.aggregate([
      { $match: { vendor_id: vendor._id } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    const priority_breakdown = priorityDocs.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // This month vs last month
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonth = await Inquiry.countDocuments({
      vendor_id: vendor._id,
      createdAt: { $gte: thisMonthStart }
    });

    const lastMonth = await Inquiry.countDocuments({
      vendor_id: vendor._id,
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });

    // Average budget
    const avgBudgetResult = await Inquiry.aggregate([
      { $match: { vendor_id: vendor._id, budget: { $ne: null } } },
      { $group: { _id: null, avg_budget: { $avg: '$budget' } } }
    ]);
    const average_budget = avgBudgetResult.length > 0 ? avgBudgetResult[0].avg_budget : 0;

    const stats = {
      total,
      status_breakdown,
      priority_breakdown,
      monthly_comparison: {
        this_month: thisMonth,
        last_month: lastMonth,
        change_percent: lastMonth > 0
          ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
          : thisMonth > 0 ? 100 : 0
      },
      average_budget
    };

    return apiResponse(res, 200, 'Stats retrieved', stats);
  } catch (error) {
    console.error('Get inquiry stats error:', error);
    apiError(res, 500, 'Failed to get stats');
  }
};