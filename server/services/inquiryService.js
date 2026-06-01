import { Inquiry } from '../models/Inquiry.js';
import { Booking } from '../models/Booking.js';
import { Notification } from '../models/Notification.js';

export const inquiryService = {
  async getById(inquiryId) {
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      throw { status: 404, message: 'Inquiry not found' };
    }
    return inquiry;
  },

  async getByVendorId(vendorId, filters = {}) {
    const query = { vendor_id: vendorId };

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }

    return Inquiry.find(query).sort({ createdAt: -1 });
  },

  async create(vendorId, data) {
    const inquiry = await Inquiry.create({
      vendor_id: vendorId,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      event_type: data.event_type,
      event_date: data.event_date,
      event_location: data.event_location,
      guest_count: data.guest_count,
      budget: data.budget,
      notes: data.notes,
      status: data.status || 'pending',
      priority: data.priority || 'medium'
    });
    return inquiry;
  },

  async update(inquiryId, vendorId, data) {
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      throw { status: 404, message: 'Inquiry not found' };
    }
    if (inquiry.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    const allowedFields = [
      'customer_name', 'customer_email', 'customer_phone', 'event_type', 'event_date',
      'event_location', 'guest_count', 'budget', 'notes', 'status', 'priority'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        inquiry[field] = data[field];
      }
    }

    await inquiry.save();
    return inquiry;
  },

  async updateStatus(inquiryId, vendorId, status) {
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      throw { status: 404, message: 'Inquiry not found' };
    }
    if (inquiry.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    inquiry.status = status;
    await inquiry.save();
    return inquiry;
  },

  async delete(inquiryId, vendorId) {
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      throw { status: 404, message: 'Inquiry not found' };
    }
    if (inquiry.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    await Inquiry.findByIdAndDelete(inquiryId);
    return { success: true };
  },

  async getStats(vendorId) {
    const [total, pending, confirmed, completed] = await Promise.all([
      Inquiry.countDocuments({ vendor_id: vendorId }),
      Inquiry.countDocuments({ vendor_id: vendorId, status: 'pending' }),
      Inquiry.countDocuments({ vendor_id: vendorId, status: 'confirmed' }),
      Inquiry.countDocuments({ vendor_id: vendorId, status: 'completed' })
    ]);

    return { total, pending, confirmed, completed };
  },

  async getAll(filters = {}) {
    const query = {};

    if (filters.vendor_id) {
      query.vendor_id = filters.vendor_id;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.event_type) {
      query.event_type = filters.event_type;
    }

    return Inquiry.find(query).populate('vendor_id', 'business_name').sort({ createdAt: -1 });
  },

  async convertToBooking(inquiryId, vendorId, bookingData) {
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry || inquiry.vendor_id.toString() !== vendorId) {
      throw { status: 404, message: 'Inquiry not found' };
    }

    const { generateBookingRef } = await import('../utils/helpers.js');
    const bookingRef = generateBookingRef();

    const booking = await Booking.create({
      inquiry_id: inquiryId,
      vendor_id: vendorId,
      booking_ref: bookingRef,
      start_date: bookingData.start_date || inquiry.event_date,
      end_date: bookingData.end_date,
      total_amount: bookingData.total_amount || inquiry.budget,
      deposit_paid: bookingData.deposit_paid || 0,
      status: 'confirmed',
      payment_status: 'pending'
    });

    // Update inquiry status to confirmed
    inquiry.status = 'confirmed';
    await inquiry.save();

    return booking;
  }
};

export default inquiryService;