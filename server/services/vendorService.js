import { Vendor } from '../models/Vendor.js';
import { Service } from '../models/Service.js';
import { Package } from '../models/Package.js';
import { GalleryImage } from '../models/GalleryImage.js';
import { Availability } from '../models/Availability.js';
import { Review } from '../models/Review.js';

export const vendorService = {
  async getProfileByUserId(userId) {
    const vendor = await Vendor.findOne({ user_id: userId }).populate('user_id', 'email');

    if (!vendor) {
      throw { status: 404, message: 'Vendor profile not found' };
    }

    const vendorObj = vendor.toObject();

    // Get counts
    vendorObj.services_count = await Service.countDocuments({ vendor_id: vendor._id });
    vendorObj.packages_count = await Package.countDocuments({ vendor_id: vendor._id });
    vendorObj.gallery_count = await GalleryImage.countDocuments({ vendor_id: vendor._id, is_active: true });

    return vendorObj;
  },

  async getProfileById(vendorId) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw { status: 404, message: 'Vendor not found' };
    }
    return vendor;
  },

  async createProfile(userId, data) {
    const vendor = await Vendor.create({
      user_id: userId,
      business_name: data.business_name,
      category: data.category,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
      country: data.country || 'USA',
      description: data.description
    });

    return vendor;
  },

  async updateProfile(userId, data) {
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      throw { status: 404, message: 'Vendor profile not found' };
    }

    const allowedFields = [
      'business_name', 'category', 'email', 'phone', 'address',
      'city', 'state', 'zip_code', 'country', 'description', 'social_links'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        vendor[field] = data[field];
      }
    }

    await vendor.save();
    return vendor;
  },

  async updateProfileImage(userId, imageUrl) {
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      throw { status: 404, message: 'Vendor profile not found' };
    }

    vendor.profile_image = imageUrl;
    await vendor.save();

    return { profile_image: imageUrl };
  },

  async getServices(vendorId) {
    return Service.find({ vendor_id: vendorId, is_active: true }).sort({ createdAt: -1 });
  },

  async getServiceById(serviceId) {
    const service = await Service.findById(serviceId);
    if (!service || !service.is_active) {
      throw { status: 404, message: 'Service not found' };
    }
    return service;
  },

  async createService(vendorId, data) {
    const service = await Service.create({
      vendor_id: vendorId,
      name: data.name,
      description: data.description,
      duration_minutes: data.duration_minutes || 60,
      price: data.price,
      is_active: data.is_active !== false
    });
    return service;
  },

  async updateService(serviceId, vendorId, data) {
    const service = await Service.findById(serviceId);
    if (!service) {
      throw { status: 404, message: 'Service not found' };
    }
    if (service.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    const allowedFields = ['name', 'description', 'duration_minutes', 'price', 'is_active'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        service[field] = data[field];
      }
    }

    await service.save();
    return service;
  },

  async deleteService(serviceId, vendorId) {
    const service = await Service.findById(serviceId);
    if (!service) {
      throw { status: 404, message: 'Service not found' };
    }
    if (service.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    service.is_active = false;
    await service.save();
    return { success: true };
  },

  async getPackages(vendorId) {
    return Package.find({ vendor_id: vendorId }).sort({ is_featured: -1, createdAt: -1 });
  },

  async getPackageById(packageId) {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      throw { status: 404, message: 'Package not found' };
    }
    return pkg;
  },

  async createPackage(vendorId, data) {
    const pkg = await Package.create({
      vendor_id: vendorId,
      name: data.name,
      description: data.description,
      price: data.price,
      features: data.features || [],
      is_featured: data.is_featured || false
    });
    return pkg;
  },

  async updatePackage(packageId, vendorId, data) {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      throw { status: 404, message: 'Package not found' };
    }
    if (pkg.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    const allowedFields = ['name', 'description', 'price', 'is_featured', 'features'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        pkg[field] = data[field];
      }
    }

    await pkg.save();
    return pkg;
  },

  async deletePackage(packageId, vendorId) {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      throw { status: 404, message: 'Package not found' };
    }
    if (pkg.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    await Package.findByIdAndDelete(packageId);
    return { success: true };
  },

  async getGallery(vendorId) {
    return GalleryImage.find({ vendor_id: vendorId, is_active: true }).sort({ createdAt: -1 });
  },

  async addGalleryImage(vendorId, imageUrl, caption, category) {
    const image = await GalleryImage.create({
      vendor_id: vendorId,
      image_url: imageUrl,
      caption,
      category
    });
    return image;
  },

  async deleteGalleryImage(imageId, vendorId) {
    const image = await GalleryImage.findById(imageId);
    if (!image) {
      throw { status: 404, message: 'Image not found' };
    }
    if (image.vendor_id.toString() !== vendorId) {
      throw { status: 403, message: 'Not authorized' };
    }

    image.is_active = false;
    await image.save();
    return { success: true };
  },

  async getAvailability(vendorId) {
    return Availability.find({ vendor_id: vendorId }).sort({ day_of_week: 1 });
  },

  async updateAvailability(vendorId, schedule) {
    // Delete existing schedule
    await Availability.deleteMany({ vendor_id: vendorId });

    // Insert new schedule
    if (schedule && schedule.length > 0) {
      const availabilityDocs = schedule.map(item => ({
        vendor_id: vendorId,
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
        is_available: item.is_available !== false
      }));
      await Availability.insertMany(availabilityDocs);
    }

    return Availability.find({ vendor_id: vendorId }).sort({ day_of_week: 1 });
  },

  async updateRating(vendorId) {
    const stats = await Review.aggregate([
      { $match: { vendor_id: vendorId, is_approved: true } },
      { $group: { _id: null, avg_rating: { $avg: '$rating' }, total_reviews: { $sum: 1 } } }
    ]);

    const rating = stats.length > 0 ? stats[0].avg_rating : 0;
    const totalReviews = stats.length > 0 ? stats[0].total_reviews : 0;

    await Vendor.findByIdAndUpdate(vendorId, { rating, total_reviews: totalReviews });

    return { rating, total_reviews: totalReviews };
  },

  async getAllVendors(filters = {}) {
    const query = {};

    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.is_verified !== undefined) {
      query.is_verified = filters.is_verified;
    }
    if (filters.search) {
      query.$or = [
        { business_name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    return Vendor.find(query).populate('user_id', 'email').sort({ createdAt: -1 });
  }
};

export default vendorService;