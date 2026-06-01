import { Booking } from '../models/Booking.js';
import { Inquiry } from '../models/Inquiry.js';

export const bookingService = {
  async getById(bookingId) {
    const booking = await Booking.findById(bookingId).populate('vendor_id', 'business_name');
    if (!booking) {
      throw { status: 404, message: 'Booking not found' };
    }
    return booking;
  },

  async getByRef(bookingRef) {
    const booking = await Booking.findOne({ booking_ref: bookingRef });
    if (!booking) {
      throw { status: 404, message: 'Booking not found' };
    }
    return booking;
  },

  async getByVendorId(vendorId, filters = {}) {
    const query = { vendor_id: vendorId };

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.payment_status) {
      query.payment_status = filters.payment_status;
    }

    return Booking.find(query).sort({ createdAt: -1 });
  },

  async create(vendorId, data) {
    const { generateBookingRef } = await import('../utils/helpers.js');
    const bookingRef = generateBookingRef();

    const booking = await Booking.create({
      inquiry_id: data.inquiry_id || null,
      vendor_id: vendorId,
      booking_ref: bookingRef,
      start_date: data.start_date,
      end_date: data.end_date,
      total_amount: data.total_amount,
      deposit_paid: data.deposit_paid || 0,
      status: data.status || 'confirmed',
      payment_status: data.payment_status || 'pending'
    });

    return booking;
  },

  async update(bookingId, vendorId, data) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw { status: 404, message: 'Booking not found' };
    }
    if (booking.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    const allowedFields = ['start_date', 'end_date', 'total_amount', 'deposit_paid', 'status', 'payment_status'];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        booking[field] = data[field];
      }
    }

    await booking.save();
    return booking;
  },

  async updateStatus(bookingId, vendorId, status) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw { status: 404, message: 'Booking not found' };
    }
    if (booking.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    booking.status = status;
    await booking.save();
    return booking;
  },

  async updatePaymentStatus(bookingId, vendorId, paymentStatus) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw { status: 404, message: 'Booking not found' };
    }
    if (booking.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    booking.payment_status = paymentStatus;
    await booking.save();
    return booking;
  },

  async cancel(bookingId, vendorId, reason) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw { status: 404, message: 'Booking not found' };
    }
    if (booking.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    booking.status = 'cancelled';
    booking.cancellation_reason = reason;
    await booking.save();
    return booking;
  },

  async delete(bookingId, vendorId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw { status: 404, message: 'Booking not found' };
    }
    if (booking.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    await Booking.findByIdAndDelete(bookingId);
    return { success: true };
  },

  async getStats(vendorId) {
    const [total, confirmed, completed, cancelled, revenueResult, pendingPaymentResult] = await Promise.all([
      Booking.countDocuments({ vendor_id: vendorId }),
      Booking.countDocuments({ vendor_id: vendorId, status: 'confirmed' }),
      Booking.countDocuments({ vendor_id: vendorId, status: 'completed' }),
      Booking.countDocuments({ vendor_id: vendorId, status: 'cancelled' }),
      Booking.aggregate([
        { $match: { vendor_id: vendorId, payment_status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      Booking.aggregate([
        { $match: { vendor_id: vendorId, payment_status: { $in: ['pending', 'partial'] } } },
        { $group: { _id: null, total: { $sum: { $subtract: ['$total_amount', '$deposit_paid'] } } } }
      ])
    ]);

    return {
      total,
      confirmed,
      completed,
      cancelled,
      total_revenue: revenueResult.length > 0 ? revenueResult[0].total : 0,
      pending_payment: pendingPaymentResult.length > 0 ? pendingPaymentResult[0].total : 0
    };
  },

  async getAll(filters = {}) {
    const query = {};

    if (filters.vendor_id) {
      query.vendor_id = filters.vendor_id;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.payment_status) {
      query.payment_status = filters.payment_status;
    }

    return Booking.find(query).populate('vendor_id', 'business_name').sort({ createdAt: -1 });
  },

  async recordPayment(bookingId, vendorId, amount, paymentMethod) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw { status: 404, message: 'Booking not found' };
    }
    if (booking.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    const newDeposit = parseFloat(booking.deposit_paid) + parseFloat(amount);
    const paymentStatus = newDeposit >= booking.total_amount ? 'paid' : 'partial';

    booking.deposit_paid = newDeposit;
    booking.payment_status = paymentStatus;
    await booking.save();

    return booking;
  }
};

export default bookingService;