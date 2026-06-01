import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: { type: String, required: true },
  description: { type: String },
  duration_minutes: { type: Number, default: 60 },
  price: { type: Number },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Service = mongoose.model('Service', serviceSchema);