import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  customer_phone: { type: String },
  event_type: { type: String },
  event_date: { type: Date },
  event_location: { type: String },
  guest_count: { type: Number },
  budget: { type: Number },
  notes: { type: String },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'confirmed', 'rejected', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

export const Inquiry = mongoose.model('Inquiry', inquirySchema);