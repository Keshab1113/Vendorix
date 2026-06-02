import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional()
});

export const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address')
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const profileSchema = z.object({
  business_name: z.string().optional(),
  category: z.string().optional(),
  email: z.union([z.string().email('Invalid email address'), z.literal('')]).optional(),
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
  guest_count: z.coerce.number().int().positive().optional(),
  budget: z.coerce.number().positive().optional(),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

export const bookingSchema = z.object({
  inquiry_id: z.coerce.number().int().positive().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  total_amount: z.coerce.number().positive('Amount must be positive'),
  deposit_paid: z.coerce.number().min(0).optional(),
  status: z.enum(['confirmed', 'cancelled', 'completed', 'in_progress']).optional(),
  payment_status: z.enum(['pending', 'partial', 'paid', 'refunded']).optional()
});

export const serviceSchema = z.object({
  name: z.string().min(2, 'Service name is required'),
  description: z.string().optional(),
  duration_minutes: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().positive('Price is required'),
  is_active: z.boolean().optional()
});

export const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required').trim(),
  description: z.string().optional(),
  price: z.coerce.number({ invalid_type_error: 'Price is required' }).min(0, 'Price must be 0 or greater'),
  features: z.union([z.string(), z.array(z.string())]).optional(),
  is_featured: z.boolean().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});