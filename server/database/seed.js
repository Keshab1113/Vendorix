import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vendorix'
  });

  try {
    // Clear existing data
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE notifications');
    await connection.query('TRUNCATE TABLE reviews');
    await connection.query('TRUNCATE TABLE gallery_images');
    await connection.query('TRUNCATE TABLE availability');
    await connection.query('TRUNCATE TABLE bookings');
    await connection.query('TRUNCATE TABLE inquiries');
    await connection.query('TRUNCATE TABLE packages');
    await connection.query('TRUNCATE TABLE services');
    await connection.query('TRUNCATE TABLE vendors');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // Create demo vendor user
    const passwordHash = await bcrypt.hash('password123', 12);

    const [userResult] = await connection.query(
      `INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
      ['demo@vendorix.com', passwordHash, 'vendor']
    );
    const userId = userResult.insertId;

    // Create vendor profile
    await connection.query(
      `INSERT INTO vendors (user_id, business_name, category, email, phone, address, city, state, zip_code, country, description, is_verified, rating, total_reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'Elegant Events Co.',
        'Event Planning',
        'demo@vendorix.com',
        '(555) 123-4567',
        '123 Business Avenue, Suite 400',
        'San Francisco',
        'California',
        '94102',
        'USA',
        'Premium event planning and management services for weddings, corporate events, and special celebrations. With over 10 years of experience, we transform your vision into unforgettable moments.',
        true,
        4.85,
        127
      ]
    );
    const vendorId = connection.lastInsertId;

    // Create services
    const services = [
      ['Wedding Planning', 'Full-service wedding planning with day-of coordination', 60, 2500.00],
      ['Corporate Events', 'Professional corporate event management', 60, 1500.00],
      ['Birthday Parties', 'Custom birthday party planning', 45, 500.00],
      ['Private Dinners', 'Intimate private dinner coordination', 30, 800.00],
      ['Product Launches', 'High-impact product launch events', 60, 2000.00],
      ['Award Ceremonies', 'Elegant award ceremony planning', 60, 3000.00]
    ];

    for (const service of services) {
      await connection.query(
        `INSERT INTO services (vendor_id, name, description, duration_minutes, price) VALUES (?, ?, ?, ?, ?)`,
        [vendorId, ...service]
      );
    }

    // Create packages
    const packages = [
      ['Starter Package', 'Perfect for small gatherings', 1500.00, JSON.stringify(['Event planning', 'Day-of coordination', 'Vendor referrals']), false],
      ['Premium Package', 'Most popular choice', 3500.00, JSON.stringify(['Full planning services', 'Unlimited consultations', 'Budget management', 'Vendor negotiation', 'Day-of coordination', '24/7 support']), true],
      ['Luxury Package', 'Ultimate experience', 7500.00, JSON.stringify(['Everything in Premium', 'Full venue decoration', 'Catering management', 'Entertainment booking', 'Photo/video coordination', 'Guest accommodation booking']), false]
    ];

    for (const pkg of packages) {
      await connection.query(
        `INSERT INTO packages (vendor_id, name, description, price, features, is_featured) VALUES (?, ?, ?, ?, ?, ?)`,
        [vendorId, ...pkg]
      );
    }

    // Create sample inquiries
    const inquiries = [
      ['Sarah Mitchell', 'sarah.m@email.com', '(555) 234-5678', 'Wedding', '2026-07-15', 'Grand Ballroom, Fairmont Hotel', 150, 15000.00, 'Looking for a full-service wedding planning experience. Interested in your Premium Package.', 'pending', 'high'],
      ['James Wilson', 'james.w@corp.com', '(555) 345-6789', 'Corporate', '2026-06-20', 'Tech Conference Center', 200, 8000.00, 'Annual company conference with team building activities.', 'confirmed', 'medium'],
      ['Emily Chen', 'emily.chen@mail.com', '(555) 456-7890', 'Birthday', '2026-06-10', 'Rooftop Lounge Skybar', 50, 3000.00, 'Surprise birthday party for my husband. Looking for something elegant but fun.', 'contacted', 'medium'],
      ['Michael Brown', 'mbrown@enterprise.com', '(555) 567-8901', 'Corporate', '2026-08-05', 'Marriott Grand Hotel', 500, 25000.00, 'Large-scale product launch event with media coverage.', 'pending', 'high'],
      ['Lisa Anderson', 'lisa.a@email.com', '(555) 678-9012', 'Wedding', '2026-09-20', 'Vineyard Estate', 80, 12000.00, 'Dream vineyard wedding. Outdoor ceremony with indoor reception.', 'completed', 'low'],
      ['Robert Taylor', 'rtaylor@startup.io', '(555) 789-0123', 'Corporate', '2026-06-15', 'Innovation Hub', 75, 5000.00, 'Quarterly team building event. Need activities and catering coordination.', 'rejected', 'low']
    ];

    for (const inquiry of inquiries) {
      await connection.query(
        `INSERT INTO inquiries (vendor_id, customer_name, customer_email, customer_phone, event_type, event_date, event_location, guest_count, budget, notes, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [vendorId, ...inquiry]
      );
    }

    // Create sample bookings
    const bookings = [
      [1, vendorId, 'BK-2026-001', '2026-07-15 14:00:00', '2026-07-15 22:00:00', 15000.00, 5000.00, 'confirmed', 'paid'],
      [2, vendorId, 'BK-2026-002', '2026-06-20 09:00:00', '2026-06-20 18:00:00', 8000.00, 2000.00, 'in_progress', 'partial'],
      [5, vendorId, 'BK-2026-003', '2026-09-20 15:00:00', '2026-09-20 23:00:00', 12000.00, 4000.00, 'completed', 'paid']
    ];

    for (const booking of bookings) {
      await connection.query(
        `INSERT INTO bookings (inquiry_id, vendor_id, booking_ref, start_date, end_date, total_amount, deposit_paid, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        booking
      );
    }

    // Create availability
    const availability = [
      [vendorId, 0, '09:00:00', '18:00:00', true],  // Sunday
      [vendorId, 1, '09:00:00', '20:00:00', true],  // Monday
      [vendorId, 2, '09:00:00', '20:00:00', true],  // Tuesday
      [vendorId, 3, '09:00:00', '20:00:00', true],  // Wednesday
      [vendorId, 4, '09:00:00', '20:00:00', true],  // Thursday
      [vendorId, 5, '09:00:00', '22:00:00', true],  // Friday
      [vendorId, 6, '10:00:00', '18:00:00', true]   // Saturday
    ];

    for (const avail of availability) {
      await connection.query(
        `INSERT INTO availability (vendor_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?)`,
        avail
      );
    }

    // Create notifications
    const notifications = [
      [userId, 'New Inquiry Received', 'Sarah Mitchell sent a new wedding inquiry for July 15, 2026', 'inquiry', '/inquiries/1'],
      [userId, 'Booking Confirmed', 'James Wilson confirmed the corporate event booking', 'booking', '/bookings/2'],
      [userId, 'Payment Received', 'Deposit payment of $5,000 received for BK-2026-001', 'payment', '/bookings/1'],
      [userId, 'Review Submitted', 'Lisa Anderson left a 5-star review', 'review', '/reviews'],
      [userId, 'Event Reminder', 'Wedding event in 45 days - contact Sarah Mitchell to confirm details', 'reminder', '/inquiries/1']
    ];

    for (const notif of notifications) {
      await connection.query(
        `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)`,
        notif
      );
    }

    // Create sample reviews
    const reviews = [
      [vendorId, 3, 'Lisa Anderson', 5, 'Absolutely incredible! The team made our wedding day absolutely perfect. Every detail was handled with care and professionalism.'],
      [vendorId, 1, 'Mark Johnson', 5, 'Elegant Events transformed our corporate gala into something truly memorable. Highly recommend!'],
      [vendorId, 2, 'Amanda Roberts', 4, 'Great service for our product launch. The team was responsive and professional.']
    ];

    for (const review of reviews) {
      await connection.query(
        `INSERT INTO reviews (vendor_id, booking_id, customer_name, rating, comment, is_approved) VALUES (?, ?, ?, ?, ?, ?)`,
        [...review, true]
      );
    }

    console.log('✅ Database seeded successfully');
    console.log('📧 Demo credentials: demo@vendorix.com / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
};

export default seedDatabase;