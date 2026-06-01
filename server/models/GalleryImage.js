import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  image_url: { type: String, required: true },
  caption: { type: String },
  category: { type: String },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);