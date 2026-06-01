import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  customer_name: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
  is_approved: { type: Boolean, default: false }
}, { timestamps: true });

export const Review = mongoose.model('Review', reviewSchema);