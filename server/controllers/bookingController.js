import { Booking } from '../models/Booking.js';
import { Inquiry } from '../models/Inquiry.js';
import { Notification } from '../models/Notification.js';
import { Vendor } from '../models/Vendor.js';
import { apiResponse, apiError, paginate, generateBookingRef } from '../utils/helpers.js';

export const getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const { page = 1, limit = 20, status, payment_status } = req.query;
    const { offset } = paginate(page, limit);

    // Build query
    const query = { vendor_id: vendor._id };

    if (status) {
      query.status = status;
    }

    if (payment_status) {
      query.payment_status = payment_status;
    }

    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate('inquiry_id', 'customer_name event_type event_date')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(parseInt(limit));

    return apiResponse(res, 200, 'Bookings retrieved', {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    apiError(res, 500, 'Failed to get bookings');
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const booking = await Booking.findOne({ _id: id, vendor_id: vendor._id })
      .populate('inquiry_id', 'customer_name customer_email customer_phone event_type event_date event_location guest_count notes');

    if (!booking) {
      return apiError(res, 404, 'Booking not found');
    }

    return apiResponse(res, 200, 'Booking retrieved', booking);
  } catch (error) {
    console.error('Get booking error:', error);
    apiError(res, 500, 'Failed to get booking');
  }
};

export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const {
      inquiry_id,
      start_date,
      end_date,
      total_amount,
      deposit_paid,
      status,
      payment_status
    } = req.body;

    const bookingRef = generateBookingRef();

    const booking = await Booking.create({
      inquiry_id: inquiry_id || null,
      vendor_id: vendor._id,
      booking_ref: bookingRef,
      start_date,
      end_date,
      total_amount,
      deposit_paid: deposit_paid || 0,
      status: status || 'confirmed',
      payment_status: payment_status || 'pending'
    });

    // If booking from inquiry, update inquiry status
    if (inquiry_id) {
      await Inquiry.findByIdAndUpdate(inquiry_id, { status: 'confirmed' });

      // Create notification
      await Notification.create({
        user_id: userId,
        title: 'Booking Confirmed',
        message: `Booking ${bookingRef} has been confirmed`,
        type: 'booking',
        link: `/bookings/${booking._id}`
      });
    }

    return apiResponse(res, 201, 'Booking created', booking);
  } catch (error) {
    console.error('Create booking error:', error);
    apiError(res, 500, 'Failed to create booking');
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const booking = await Booking.findOne({ _id: id, vendor_id: vendor._id });
    if (!booking) {
      return apiError(res, 404, 'Booking not found');
    }

    const {
      start_date,
      end_date,
      total_amount,
      deposit_paid,
      status,
      payment_status
    } = req.body;

    // Update fields if provided
    if (start_date !== undefined) booking.start_date = start_date;
    if (end_date !== undefined) booking.end_date = end_date;
    if (total_amount !== undefined) booking.total_amount = total_amount;
    if (deposit_paid !== undefined) booking.deposit_paid = deposit_paid;
    if (status !== undefined) booking.status = status;
    if (payment_status !== undefined) booking.payment_status = payment_status;

    await booking.save();

    return apiResponse(res, 200, 'Booking updated', booking);
  } catch (error) {
    console.error('Update booking error:', error);
    apiError(res, 500, 'Failed to update booking');
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const validStatuses = ['confirmed', 'cancelled', 'completed', 'in_progress'];
    if (!validStatuses.includes(status)) {
      return apiError(res, 400, 'Invalid status');
    }

    const booking = await Booking.findOne({ _id: id, vendor_id: vendor._id });
    if (!booking) {
      return apiError(res, 404, 'Booking not found');
    }

    booking.status = status;
    await booking.save();

    // Create notification
    await Notification.create({
      user_id: userId,
      title: 'Booking Status Updated',
      message: `Booking ${booking.booking_ref} status changed to ${status}`,
      type: 'booking',
      link: `/bookings/${id}`
    });

    return apiResponse(res, 200, 'Status updated', booking);
  } catch (error) {
    console.error('Update booking status error:', error);
    apiError(res, 500, 'Failed to update status');
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const booking = await Booking.findOne({ _id: id, vendor_id: vendor._id });
    if (!booking) {
      return apiError(res, 404, 'Booking not found');
    }

    booking.status = 'cancelled';
    await booking.save();

    // Create notification
    await Notification.create({
      user_id: userId,
      title: 'Booking Cancelled',
      message: `Booking ${booking.booking_ref} has been cancelled`,
      type: 'booking',
      link: `/bookings/${id}`
    });

    return apiResponse(res, 200, 'Booking cancelled', booking);
  } catch (error) {
    console.error('Cancel booking error:', error);
    apiError(res, 500, 'Failed to cancel booking');
  }
};