import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const vendorProfileSchema = z.object({
  business_name: z.string().optional(),
  category: z.string().optional(),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  description: z.string().optional()
});

export const inquirySchema = z.object({
  customer_name: z.string().min(2, 'Customer name is required'),
  customer_email: z.string().email('Invalid email address'),
  customer_phone: z.string().optional(),
  event_type: z.string().min(1, 'Event type is required'),
  event_date: z.string().min(1, 'Event date is required'),
  event_location: z.string().optional(),
  guest_count: z.number().int().positive().optional(),
  budget: z.number().positive().optional(),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

export const bookingSchema = z.object({
  inquiry_id: z.number().int().positive().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  total_amount: z.number().positive('Amount must be positive'),
  deposit_paid: z.number().min(0).optional(),
  status: z.enum(['confirmed', 'cancelled', 'completed', 'in_progress']).optional(),
  payment_status: z.enum(['pending', 'partial', 'paid', 'refunded']).optional()
});

export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  duration_minutes: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  is_active: z.boolean().optional()
});

export const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  features: z.union([z.string(), z.array(z.string())]).optional(),
  is_featured: z.boolean().optional()
});

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    next(error);
  }
};