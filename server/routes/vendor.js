import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  getProfile,
  updateProfile,
  updateProfileImage,
  getServices,
  createService,
  updateService,
  deleteService,
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getGallery,
  uploadGalleryImage,
  deleteGalleryImage,
  getAvailability,
  updateAvailability
} from '../controllers/vendorController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { vendorProfileSchema, serviceSchema, packageSchema } from '../validators/auth.js';

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Profile
router.get('/profile', getProfile);
router.put('/profile', validate(vendorProfileSchema), updateProfile);
router.post('/avatar', upload.single('image'), updateProfileImage);

// Services
router.get('/services', getServices);
router.post('/services', validate(serviceSchema), createService);
router.put('/services/:id', validate(serviceSchema), updateService);
router.delete('/services/:id', deleteService);

// Packages
router.get('/packages', getPackages);
router.post('/packages', validate(packageSchema), createPackage);
router.put('/packages/:id', validate(packageSchema), updatePackage);
router.delete('/packages/:id', deletePackage);

// Gallery
router.get('/gallery', getGallery);
router.post('/gallery', upload.single('image'), uploadGalleryImage);
router.delete('/gallery/:id', deleteGalleryImage);

// Availability
router.get('/availability', getAvailability);
router.put('/availability', updateAvailability);

export default router;