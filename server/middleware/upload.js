import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// File filter - only images allowed
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
  }
};

// File size limits
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
const AVATAR_SIZE_LIMIT = 2 * 1024 * 1024; // 2MB for avatars
const GALLERY_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB for gallery images

// Create multer instances for different upload types
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: AVATAR_SIZE_LIMIT
  }
});

export const uploadGallery = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: GALLERY_SIZE_LIMIT
  }
});

export const uploadAny = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMIT
  }
});

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next();
};

export default {
  uploadAvatar,
  uploadGallery,
  uploadAny,
  handleMulterError
};