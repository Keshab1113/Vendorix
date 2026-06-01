import { Vendor } from '../models/Vendor.js';
import { Service } from '../models/Service.js';
import { Package } from '../models/Package.js';
import { GalleryImage } from '../models/GalleryImage.js';
import { Availability } from '../models/Availability.js';
import { apiResponse, apiError } from '../utils/helpers.js';

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const vendor = await Vendor.findOne({ user_id: userId }).populate('user_id', 'email');

    if (!vendor) {
      return apiError(res, 404, 'Vendor profile not found');
    }

    // Get counts
    const services_count = await Service.countDocuments({ vendor_id: vendor._id });
    const packages_count = await Package.countDocuments({ vendor_id: vendor._id });
    const gallery_count = await GalleryImage.countDocuments({ vendor_id: vendor._id, is_active: true });

    const vendorObj = vendor.toObject();
    vendorObj.services_count = services_count;
    vendorObj.packages_count = packages_count;
    vendorObj.gallery_count = gallery_count;

    return apiResponse(res, 200, 'Profile retrieved', vendorObj);
  } catch (error) {
    console.error('Get profile error:', error);
    apiError(res, 500, 'Failed to get profile');
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      business_name,
      category,
      email,
      phone,
      address,
      city,
      state,
      zip_code,
      country,
      description,
      social_links
    } = req.body;

    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor profile not found');
    }

    // Update fields if provided
    if (business_name !== undefined) vendor.business_name = business_name;
    if (category !== undefined) vendor.category = category;
    if (email !== undefined) vendor.email = email;
    if (phone !== undefined) vendor.phone = phone;
    if (address !== undefined) vendor.address = address;
    if (city !== undefined) vendor.city = city;
    if (state !== undefined) vendor.state = state;
    if (zip_code !== undefined) vendor.zip_code = zip_code;
    if (country !== undefined) vendor.country = country;
    if (description !== undefined) vendor.description = description;
    if (social_links !== undefined) vendor.social_links = social_links;

    await vendor.save();

    return apiResponse(res, 200, 'Profile updated', vendor);
  } catch (error) {
    console.error('Update profile error:', error);
    apiError(res, 500, 'Failed to update profile');
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return apiError(res, 400, 'No image file provided');
    }

    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor profile not found');
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    vendor.profile_image = imageUrl;
    await vendor.save();

    return apiResponse(res, 200, 'Profile image updated', { profile_image: imageUrl });
  } catch (error) {
    console.error('Update profile image error:', error);
    apiError(res, 500, 'Failed to update profile image');
  }
};

// Services
export const getServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const services = await Service.find({ vendor_id: vendor._id }).sort({ createdAt: -1 });
    return apiResponse(res, 200, 'Services retrieved', services);
  } catch (error) {
    console.error('Get services error:', error);
    apiError(res, 500, 'Failed to get services');
  }
};

export const createService = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const { name, description, duration_minutes, price, is_active } = req.body;

    const service = await Service.create({
      vendor_id: vendor._id,
      name,
      description,
      duration_minutes: duration_minutes || 60,
      price,
      is_active: is_active !== false
    });

    return apiResponse(res, 201, 'Service created', service);
  } catch (error) {
    console.error('Create service error:', error);
    apiError(res, 500, 'Failed to create service');
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration_minutes, price, is_active } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return apiError(res, 404, 'Service not found');
    }

    // Verify ownership
    const vendor = await Vendor.findOne({ user_id: req.user.id });
    if (!vendor || service.vendor_id.toString() !== vendor._id.toString()) {
      return apiError(res, 403, 'Not authorized');
    }

    // Update fields if provided
    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (duration_minutes !== undefined) service.duration_minutes = duration_minutes;
    if (price !== undefined) service.price = price;
    if (is_active !== undefined) service.is_active = is_active;

    await service.save();

    return apiResponse(res, 200, 'Service updated', service);
  } catch (error) {
    console.error('Update service error:', error);
    apiError(res, 500, 'Failed to update service');
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return apiError(res, 404, 'Service not found');
    }

    const vendor = await Vendor.findOne({ user_id: req.user.id });
    if (!vendor || service.vendor_id.toString() !== vendor._id.toString()) {
      return apiError(res, 403, 'Not authorized');
    }

    await Service.findByIdAndDelete(id);
    return apiResponse(res, 200, 'Service deleted');
  } catch (error) {
    console.error('Delete service error:', error);
    apiError(res, 500, 'Failed to delete service');
  }
};

// Packages
export const getPackages = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const packages = await Package.find({ vendor_id: vendor._id }).sort({ createdAt: -1 });
    return apiResponse(res, 200, 'Packages retrieved', packages);
  } catch (error) {
    console.error('Get packages error:', error);
    apiError(res, 500, 'Failed to get packages');
  }
};

export const createPackage = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const { name, description, price, features, is_featured } = req.body;

    const pkg = await Package.create({
      vendor_id: vendor._id,
      name,
      description,
      price,
      features: features || [],
      is_featured: is_featured || false
    });

    return apiResponse(res, 201, 'Package created', pkg);
  } catch (error) {
    console.error('Create package error:', error);
    apiError(res, 500, 'Failed to create package');
  }
};

export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, features, is_featured } = req.body;

    const pkg = await Package.findById(id);
    if (!pkg) {
      return apiError(res, 404, 'Package not found');
    }

    const vendor = await Vendor.findOne({ user_id: req.user.id });
    if (!vendor || pkg.vendor_id.toString() !== vendor._id.toString()) {
      return apiError(res, 403, 'Not authorized');
    }

    // Update fields if provided
    if (name !== undefined) pkg.name = name;
    if (description !== undefined) pkg.description = description;
    if (price !== undefined) pkg.price = price;
    if (features !== undefined) pkg.features = features;
    if (is_featured !== undefined) pkg.is_featured = is_featured;

    await pkg.save();

    return apiResponse(res, 200, 'Package updated', pkg);
  } catch (error) {
    console.error('Update package error:', error);
    apiError(res, 500, 'Failed to update package');
  }
};

export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findById(id);
    if (!pkg) {
      return apiError(res, 404, 'Package not found');
    }

    const vendor = await Vendor.findOne({ user_id: req.user.id });
    if (!vendor || pkg.vendor_id.toString() !== vendor._id.toString()) {
      return apiError(res, 403, 'Not authorized');
    }

    await Package.findByIdAndDelete(id);
    return apiResponse(res, 200, 'Package deleted');
  } catch (error) {
    console.error('Delete package error:', error);
    apiError(res, 500, 'Failed to delete package');
  }
};

// Gallery
export const getGallery = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const gallery = await GalleryImage.find({ vendor_id: vendor._id, is_active: true }).sort({ createdAt: -1 });
    return apiResponse(res, 200, 'Gallery retrieved', gallery);
  } catch (error) {
    console.error('Get gallery error:', error);
    apiError(res, 500, 'Failed to get gallery');
  }
};

export const uploadGalleryImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const files = req.files;
    if (!files || files.length === 0) {
      return apiError(res, 400, 'No image files provided');
    }

    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const { caption, category } = req.body;

    // Create multiple gallery images
    const images = files.map(file => ({
      vendor_id: vendor._id,
      image_url: `/uploads/${file.filename}`,
      caption,
      category
    }));

    const createdImages = await GalleryImage.insertMany(images);

    return apiResponse(res, 201, `${createdImages.length} image(s) uploaded`, createdImages);
  } catch (error) {
    console.error('Upload gallery error:', error);
    apiError(res, 500, 'Failed to upload images');
  }
};

export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await GalleryImage.findById(id);
    if (!image) {
      return apiError(res, 404, 'Image not found');
    }

    const vendor = await Vendor.findOne({ user_id: req.user.id });
    if (!vendor || image.vendor_id.toString() !== vendor._id.toString()) {
      return apiError(res, 403, 'Not authorized');
    }

    image.is_active = false;
    await image.save();

    return apiResponse(res, 200, 'Image deleted');
  } catch (error) {
    console.error('Delete gallery image error:', error);
    apiError(res, 500, 'Failed to delete image');
  }
};

// Availability
export const getAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const availability = await Availability.find({ vendor_id: vendor._id }).sort({ day_of_week: 1 });
    return apiResponse(res, 200, 'Availability retrieved', availability);
  } catch (error) {
    console.error('Get availability error:', error);
    apiError(res, 500, 'Failed to get availability');
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return apiError(res, 404, 'Vendor not found');
    }

    const { schedule } = req.body; // Array of { day_of_week, start_time, end_time, is_available }

    // Delete existing schedule
    await Availability.deleteMany({ vendor_id: vendor._id });

    // Insert new schedule
    if (schedule && schedule.length > 0) {
      const availabilityDocs = schedule.map(item => ({
        vendor_id: vendor._id,
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
        is_available: item.is_available !== false
      }));
      await Availability.insertMany(availabilityDocs);
    }

    const availability = await Availability.find({ vendor_id: vendor._id }).sort({ day_of_week: 1 });
    return apiResponse(res, 200, 'Availability updated', availability);
  } catch (error) {
    console.error('Update availability error:', error);
    apiError(res, 500, 'Failed to update availability');
  }
};