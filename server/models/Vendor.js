import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  business_name: { type: String, required: true },
  category: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zip_code: { type: String },
  country: { type: String, default: 'USA' },
  description: { type: String },
  profile_image: { type: String },
  social_links: { type: Map, of: String },
  is_verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  total_reviews: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Vendor = mongoose.model('Vendor', vendorSchema);