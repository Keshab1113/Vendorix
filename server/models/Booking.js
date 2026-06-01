import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  inquiry_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry' },
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  booking_ref: { type: String, unique: true },
  start_date: { type: Date },
  end_date: { type: Date },
  total_amount: { type: Number },
  deposit_paid: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'in_progress'],
    default: 'confirmed'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export const Booking = mongoose.model('Booking', bookingSchema);