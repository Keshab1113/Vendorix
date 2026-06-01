import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  day_of_week: { type: Number, min: 0, max: 6 },
  start_time: { type: String },
  end_time: { type: String },
  is_available: { type: Boolean, default: true }
});

export const Availability = mongoose.model('Availability', availabilitySchema);