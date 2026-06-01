import { Booking } from '../models/Booking.js';
import { Inquiry } from '../models/Inquiry.js';
import { Review } from '../models/Review.js';
import { Vendor } from '../models/Vendor.js';
import { apiResponse, apiError } from '../utils/helpers.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    // Total bookings
    const total_bookings = await Booking.countDocuments({ vendor_id: vendor._id });

    // Total inquiries
    const total_inquiries = await Inquiry.countDocuments({ vendor_id: vendor._id });

    // Pending inquiries
    const pending_inquiries = await Inquiry.countDocuments({ vendor_id: vendor._id, status: 'pending' });

    // Total revenue (paid bookings)
    const revenueResult = await Booking.aggregate([
      { $match: { vendor_id: vendor._id, payment_status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const total_revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // This month's revenue
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthRevenueResult = await Booking.aggregate([
      {
        $match: {
          vendor_id: vendor._id,
          payment_status: 'paid',
          start_date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const monthly_revenue = monthRevenueResult.length > 0 ? monthRevenueResult[0].total : 0;

    // Confirmed upcoming bookings
    const upcoming_bookings = await Booking.countDocuments({
      vendor_id: vendor._id,
      status: 'confirmed',
      start_date: { $gte: new Date() }
    });

    // Average rating
    const ratingResult = await Review.aggregate([
      { $match: { vendor_id: vendor._id, is_approved: true } },
      { $group: { _id: null, avg_rating: { $avg: '$rating' } } }
    ]);
    const average_rating = ratingResult.length > 0 ? parseFloat(ratingResult[0].avg_rating).toFixed(2) : '0.00';

    const stats = {
      total_bookings,
      total_inquiries,
      pending_inquiries,
      total_revenue,
      monthly_revenue,
      upcoming_bookings,
      average_rating
    };

    return apiResponse(res, 200, 'Stats retrieved', stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    apiError(res, 500, 'Failed to get stats');
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    // Monthly inquiry data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyInquiries = await Inquiry.aggregate([
      {
        $match: {
          vendor_id: vendor._id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Monthly revenue data (last 6 months)
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          vendor_id: vendor._id,
          payment_status: 'paid',
          start_date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$start_date' },
            year: { $year: '$start_date' }
          },
          revenue: { $sum: '$total_amount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Inquiry by status
    const inquiryByStatus = await Inquiry.aggregate([
      { $match: { vendor_id: vendor._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Inquiry by event type
    const inquiryByEventType = await Inquiry.aggregate([
      { $match: { vendor_id: vendor._id } },
      { $group: { _id: '$event_type', count: { $sum: 1 } } }
    ]);

    // Booking by status
    const bookingByStatus = await Booking.aggregate([
      { $match: { vendor_id: vendor._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Revenue by service (based on bookings with inquiry)
    const revenueByService = await Booking.aggregate([
      {
        $match: { vendor_id: vendor._id, payment_status: 'paid' }
      },
      {
        $lookup: {
          from: 'inquiries',
          localField: 'inquiry_id',
          foreignField: '_id',
          as: 'inquiry'
        }
      },
      { $unwind: { path: '$inquiry', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$inquiry.event_type',
          bookings: { $sum: 1 },
          revenue: { $sum: '$total_amount' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const analytics = {
      monthly_inquiries: monthlyInquiries.map(m => ({
        month: m._id.month,
        year: m._id.year,
        count: m.count
      })),
      monthly_revenue: monthlyRevenue.map(m => ({
        month: m._id.month,
        year: m._id.year,
        revenue: m.revenue,
        bookings: m.bookings
      })),
      inquiry_by_status: inquiryByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      inquiry_by_event_type: inquiryByEventType,
      booking_by_status: bookingByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      revenue_by_service: revenueByService
    };

    return apiResponse(res, 200, 'Analytics retrieved', analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    apiError(res, 500, 'Failed to get analytics');
  }
};

export const getRevenueData = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    // Daily revenue for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue = await Booking.aggregate([
      {
        $match: {
          vendor_id: vendor._id,
          payment_status: 'paid',
          start_date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$start_date' } },
          revenue: { $sum: '$total_amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Monthly comparison
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthRevenue = await Booking.aggregate([
      {
        $match: {
          vendor_id: vendor._id,
          payment_status: 'paid',
          start_date: { $gte: thisMonthStart }
        }
      },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);

    const lastMonthRevenue = await Booking.aggregate([
      {
        $match: {
          vendor_id: vendor._id,
          payment_status: 'paid',
          start_date: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);

    const thisMonth = thisMonthRevenue.length > 0 ? thisMonthRevenue[0].total : 0;
    const lastMonth = lastMonthRevenue.length > 0 ? lastMonthRevenue[0].total : 0;

    // Top services by revenue
    const topServices = await Booking.aggregate([
      {
        $match: { vendor_id: vendor._id, payment_status: 'paid' }
      },
      {
        $lookup: {
          from: 'inquiries',
          localField: 'inquiry_id',
          foreignField: '_id',
          as: 'inquiry'
        }
      },
      { $unwind: { path: '$inquiry', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$inquiry.event_type',
          revenue: { $sum: '$total_amount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    const revenueData = {
      daily_revenue: dailyRevenue.map(d => ({ date: d._id, revenue: d.revenue })),
      this_month: thisMonth,
      last_month: lastMonth,
      growth_percent: lastMonth > 0
        ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
        : thisMonth > 0 ? 100 : 0,
      top_services: topServices.map(s => ({ service: s._id, revenue: s.revenue, bookings: s.bookings }))
    };

    return apiResponse(res, 200, 'Revenue data retrieved', revenueData);
  } catch (error) {
    console.error('Get revenue data error:', error);
    apiError(res, 500, 'Failed to get revenue data');
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    // Recent inquiries
    const recentInquiries = await Inquiry.find({ vendor_id: vendor._id })
      .select('id customer_name event_type status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Recent bookings
    const recentBookings = await Booking.find({ vendor_id: vendor._id })
      .select('id booking_ref status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Recent reviews
    const recentReviews = await Review.find({ vendor_id: vendor._id, is_approved: true })
      .select('id customer_name rating createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Combine and sort
    const activity = [
      ...recentInquiries.map(i => ({ id: i._id, type: 'inquiry', customer_name: i.customer_name, event_type: i.event_type, status: i.status, created_at: i.createdAt, icon: 'inbox' })),
      ...recentBookings.map(b => ({ id: b._id, type: 'booking', title: b.booking_ref, status: b.status, created_at: b.createdAt, icon: 'calendar' })),
      ...recentReviews.map(r => ({ id: r._id, type: 'review', customer_name: r.customer_name, rating: r.rating, created_at: r.createdAt, icon: 'star' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);

    return apiResponse(res, 200, 'Activity retrieved', activity);
  } catch (error) {
    console.error('Get recent activity error:', error);
    apiError(res, 500, 'Failed to get activity');
  }
};