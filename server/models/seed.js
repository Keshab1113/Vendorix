import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './User.js';
import { Vendor } from './Vendor.js';
import { Service } from './Service.js';
import { Package } from './Package.js';
import { Inquiry } from './Inquiry.js';
import { Booking } from './Booking.js';
import { Availability } from './Availability.js';
import { Notification } from './Notification.js';
import { Review } from './Review.js';
import connectDB from '../config/database.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🔄 Seeding database...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Vendor.deleteMany({}),
      Service.deleteMany({}),
      Package.deleteMany({}),
      Inquiry.deleteMany({}),
      Booking.deleteMany({}),
      Availability.deleteMany({}),
      Notification.deleteMany({}),
      Review.deleteMany({})
    ]);
    console.log('  ✓ Cleared existing data');

    // Create demo user
    const passwordHash = await bcrypt.hash('password123', 12);
    const user = await User.create({
      email: 'demo@vendorix.com',
      password_hash: passwordHash,
      role: 'vendor',
      is_active: true
    });
    console.log('  ✓ Created demo user');

    // Create vendor profile
    const vendor = await Vendor.create({
      user_id: user._id,
      business_name: 'Elegant Events Co.',
      category: 'Event Planning',
      email: 'demo@vendorix.com',
      phone: '(555) 123-4567',
      address: '123 Business Avenue, Suite 400',
      city: 'San Francisco',
      state: 'California',
      zip_code: '94102',
      country: 'USA',
      description: 'Premium event planning and management services for weddings, corporate events, and special celebrations. With over 10 years of experience, we transform your vision into unforgettable moments.',
      is_verified: true,
      rating: 4.85,
      total_reviews: 127
    });
    console.log('  ✓ Created vendor profile');

    // Create services
    const services = await Service.insertMany([
      { vendor_id: vendor._id, name: 'Wedding Planning', description: 'Full-service wedding planning with day-of coordination', duration_minutes: 60, price: 2500.00 },
      { vendor_id: vendor._id, name: 'Corporate Events', description: 'Professional corporate event management', duration_minutes: 60, price: 1500.00 },
      { vendor_id: vendor._id, name: 'Birthday Parties', description: 'Custom birthday party planning', duration_minutes: 45, price: 500.00 },
      { vendor_id: vendor._id, name: 'Private Dinners', description: 'Intimate private dinner coordination', duration_minutes: 30, price: 800.00 },
      { vendor_id: vendor._id, name: 'Product Launches', description: 'High-impact product launch events', duration_minutes: 60, price: 2000.00 },
      { vendor_id: vendor._id, name: 'Award Ceremonies', description: 'Elegant award ceremony planning', duration_minutes: 60, price: 3000.00 }
    ]);
    console.log('  ✓ Created services');

    // Create packages
    const packages = await Package.insertMany([
      { vendor_id: vendor._id, name: 'Starter Package', description: 'Perfect for small gatherings', price: 1500.00, features: ['Event planning', 'Day-of coordination', 'Vendor referrals'], is_featured: false },
      { vendor_id: vendor._id, name: 'Premium Package', description: 'Most popular choice', price: 3500.00, features: ['Full planning services', 'Unlimited consultations', 'Budget management', 'Vendor negotiation', 'Day-of coordination', '24/7 support'], is_featured: true },
      { vendor_id: vendor._id, name: 'Luxury Package', description: 'Ultimate experience', price: 7500.00, features: ['Everything in Premium', 'Full venue decoration', 'Catering management', 'Entertainment booking', 'Photo/video coordination', 'Guest accommodation booking'], is_featured: false }
    ]);
    console.log('  ✓ Created packages');

    // Create inquiries
    const inquiries = await Inquiry.insertMany([
      { vendor_id: vendor._id, customer_name: 'Sarah Mitchell', customer_email: 'sarah.m@email.com', customer_phone: '(555) 234-5678', event_type: 'Wedding', event_date: new Date('2026-07-15'), event_location: 'Grand Ballroom, Fairmont Hotel', guest_count: 150, budget: 15000.00, notes: 'Looking for a full-service wedding planning experience. Interested in your Premium Package.', status: 'pending', priority: 'high' },
      { vendor_id: vendor._id, customer_name: 'James Wilson', customer_email: 'james.w@corp.com', customer_phone: '(555) 345-6789', event_type: 'Corporate', event_date: new Date('2026-06-20'), event_location: 'Tech Conference Center', guest_count: 200, budget: 8000.00, notes: 'Annual company conference with team building activities.', status: 'confirmed', priority: 'medium' },
      { vendor_id: vendor._id, customer_name: 'Emily Chen', customer_email: 'emily.chen@mail.com', customer_phone: '(555) 456-7890', event_type: 'Birthday', event_date: new Date('2026-06-10'), event_location: 'Rooftop Lounge Skybar', guest_count: 50, budget: 3000.00, notes: 'Surprise birthday party for my husband. Looking for something elegant but fun.', status: 'contacted', priority: 'medium' },
      { vendor_id: vendor._id, customer_name: 'Michael Brown', customer_email: 'mbrown@enterprise.com', customer_phone: '(555) 567-8901', event_type: 'Corporate', event_date: new Date('2026-08-05'), event_location: 'Marriott Grand Hotel', guest_count: 500, budget: 25000.00, notes: 'Large-scale product launch event with media coverage.', status: 'pending', priority: 'high' },
      { vendor_id: vendor._id, customer_name: 'Lisa Anderson', customer_email: 'lisa.a@email.com', customer_phone: '(555) 678-9012', event_type: 'Wedding', event_date: new Date('2026-09-20'), event_location: 'Vineyard Estate', guest_count: 80, budget: 12000.00, notes: 'Dream vineyard wedding. Outdoor ceremony with indoor reception.', status: 'completed', priority: 'low' },
      { vendor_id: vendor._id, customer_name: 'Robert Taylor', customer_email: 'rtaylor@startup.io', customer_phone: '(555) 789-0123', event_type: 'Corporate', event_date: new Date('2026-06-15'), event_location: 'Innovation Hub', guest_count: 75, budget: 5000.00, notes: 'Quarterly team building event. Need activities and catering coordination.', status: 'rejected', priority: 'low' }
    ]);
    console.log('  ✓ Created inquiries');

    // Create bookings
    await Booking.insertMany([
      { inquiry_id: inquiries[0]._id, vendor_id: vendor._id, booking_ref: 'BK-2026-001', start_date: new Date('2026-07-15 14:00:00'), end_date: new Date('2026-07-15 22:00:00'), total_amount: 15000.00, deposit_paid: 5000.00, status: 'confirmed', payment_status: 'paid' },
      { inquiry_id: inquiries[1]._id, vendor_id: vendor._id, booking_ref: 'BK-2026-002', start_date: new Date('2026-06-20 09:00:00'), end_date: new Date('2026-06-20 18:00:00'), total_amount: 8000.00, deposit_paid: 2000.00, status: 'in_progress', payment_status: 'partial' },
      { inquiry_id: inquiries[4]._id, vendor_id: vendor._id, booking_ref: 'BK-2026-003', start_date: new Date('2026-09-20 15:00:00'), end_date: new Date('2026-09-20 23:00:00'), total_amount: 12000.00, deposit_paid: 4000.00, status: 'completed', payment_status: 'paid' }
    ]);
    console.log('  ✓ Created bookings');

    // Create availability
    await Availability.insertMany([
      { vendor_id: vendor._id, day_of_week: 0, start_time: '09:00', end_time: '18:00', is_available: true },
      { vendor_id: vendor._id, day_of_week: 1, start_time: '09:00', end_time: '20:00', is_available: true },
      { vendor_id: vendor._id, day_of_week: 2, start_time: '09:00', end_time: '20:00', is_available: true },
      { vendor_id: vendor._id, day_of_week: 3, start_time: '09:00', end_time: '20:00', is_available: true },
      { vendor_id: vendor._id, day_of_week: 4, start_time: '09:00', end_time: '20:00', is_available: true },
      { vendor_id: vendor._id, day_of_week: 5, start_time: '09:00', end_time: '22:00', is_available: true },
      { vendor_id: vendor._id, day_of_week: 6, start_time: '10:00', end_time: '18:00', is_available: true }
    ]);
    console.log('  ✓ Created availability');

    // Create notifications
    await Notification.insertMany([
      { user_id: user._id, title: 'New Inquiry Received', message: 'Sarah Mitchell sent a new wedding inquiry for July 15, 2026', type: 'inquiry', link: '/inquiries/1' },
      { user_id: user._id, title: 'Booking Confirmed', message: 'James Wilson confirmed the corporate event booking', type: 'booking', link: '/bookings/2' },
      { user_id: user._id, title: 'Payment Received', message: 'Deposit payment of $5,000 received for BK-2026-001', type: 'payment', link: '/bookings/1' },
      { user_id: user._id, title: 'Review Submitted', message: 'Lisa Anderson left a 5-star review', type: 'review', link: '/reviews' },
      { user_id: user._id, title: 'Event Reminder', message: 'Wedding event in 45 days - contact Sarah Mitchell to confirm details', type: 'reminder', link: '/inquiries/1' }
    ]);
    console.log('  ✓ Created notifications');

    // Create reviews
    await Review.insertMany([
      { vendor_id: vendor._id, booking_id: null, customer_name: 'Lisa Anderson', rating: 5, comment: 'Absolutely incredible! The team made our wedding day absolutely perfect. Every detail was handled with care and professionalism.', is_approved: true },
      { vendor_id: vendor._id, booking_id: null, customer_name: 'Mark Johnson', rating: 5, comment: 'Elegant Events transformed our corporate gala into something truly memorable. Highly recommend!', is_approved: true },
      { vendor_id: vendor._id, booking_id: null, customer_name: 'Amanda Roberts', rating: 4, comment: 'Great service for our product launch. The team was responsive and professional.', is_approved: true }
    ]);
    console.log('  ✓ Created reviews');

    console.log('✅ Database seeded successfully!');
    console.log('📧 Demo credentials: demo@vendorix.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();