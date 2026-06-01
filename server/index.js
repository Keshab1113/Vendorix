import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';

// Route imports
import authRoutes from './routes/auth.js';
import vendorRoutes from './routes/vendor.js';
import inquiryRoutes from './routes/inquiry.js';
import bookingRoutes from './routes/booking.js';
import dashboardRoutes from './routes/dashboard.js';
import notificationRoutes from './routes/notification.js';

// Middleware imports
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { handleMulterError } from './middleware/upload.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Vendorix API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      vendors: '/api/vendors',
      inquiries: '/api/inquiries',
      bookings: '/api/bookings',
      dashboard: '/api/dashboard',
      notifications: '/api/notifications',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use('/api/*', notFoundHandler);

// Global error handler (should be last)
app.use(errorHandler);

// Multer error handler (for file upload errors)
app.use(handleMulterError);

// Start server with MongoDB connection
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Database connected');

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;