import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  features: { type: [String] },
  is_featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Package = mongoose.model('Package', packageSchema);