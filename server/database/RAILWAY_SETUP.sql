-- =============================================================================
-- VENDORIX DATABASE SETUP FOR RAILWAY (MySQL)
-- =============================================================================
-- Run this in Railway Dashboard SQL Editor or MySQL CLI
-- =============================================================================

-- =============================================================================
-- STEP 1: Create Database (if not exists via connection string)
-- =============================================================================
-- CREATE DATABASE IF NOT EXISTS vendorix;
-- USE vendorix;

-- =============================================================================
-- STEP 2: Create Tables
-- =============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'vendor') DEFAULT 'vendor',
  is_active BOOLEAN DEFAULT TRUE,
  remember_token VARCHAR(500),
  reset_token VARCHAR(255),
  reset_token_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  description TEXT,
  profile_image VARCHAR(500),
  social_links JSON,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_vendors_user_id (user_id),
  INDEX idx_vendors_category (category),
  INDEX idx_vendors_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 60,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_services_vendor_id (vendor_id),
  INDEX idx_services_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  features JSON,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_packages_vendor_id (vendor_id),
  INDEX idx_packages_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  event_type VARCHAR(100),
  event_date DATE,
  event_location TEXT,
  guest_count INT,
  budget DECIMAL(10,2),
  notes TEXT,
  status ENUM('pending', 'contacted', 'confirmed', 'rejected', 'completed') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_inquiries_vendor_id (vendor_id),
  INDEX idx_inquiries_status (status),
  INDEX idx_inquiries_priority (priority),
  INDEX idx_inquiries_event_date (event_date),
  INDEX idx_inquiries_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  inquiry_id INT,
  vendor_id INT NOT NULL,
  booking_ref VARCHAR(50) UNIQUE,
  start_date DATETIME,
  end_date DATETIME,
  total_amount DECIMAL(10,2),
  deposit_paid DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('confirmed', 'cancelled', 'completed', 'in_progress') DEFAULT 'confirmed',
  payment_status ENUM('pending', 'partial', 'paid', 'refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_bookings_vendor_id (vendor_id),
  INDEX idx_bookings_ref (booking_ref),
  INDEX idx_bookings_status (status),
  INDEX idx_bookings_payment_status (payment_status),
  INDEX idx_bookings_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gallery images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_gallery_vendor_id (vendor_id),
  INDEX idx_gallery_category (category),
  INDEX idx_gallery_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Availability table
CREATE TABLE IF NOT EXISTS availability (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  day_of_week TINYINT CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_availability_vendor_id (vendor_id),
  INDEX idx_availability_day (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_read (is_read),
  INDEX idx_notifications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  booking_id INT,
  customer_name VARCHAR(255),
  rating TINYINT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_reviews_vendor_id (vendor_id),
  INDEX idx_reviews_booking_id (booking_id),
  INDEX idx_reviews_approved (is_approved),
  INDEX idx_reviews_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- STEP 3: Seed Demo Data
-- =============================================================================

-- Insert demo user (password: password123)
INSERT INTO users (email, password_hash, role, is_active) VALUES
('demo@vendorix.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.aSKiCtTRU1VKJK', 'vendor', TRUE);

-- Insert vendor profile
INSERT INTO vendors (user_id, business_name, category, email, phone, address, city, state, zip_code, country, description, is_verified, rating, total_reviews) VALUES
(1, 'Elegant Events Co.', 'Event Planning', 'demo@vendorix.com', '(555) 123-4567', '123 Business Avenue, Suite 400', 'San Francisco', 'California', '94102', 'USA', 'Premium event planning and management services for weddings, corporate events, and special celebrations. With over 10 years of experience, we transform your vision into unforgettable moments.', TRUE, 4.85, 127);

-- Insert services
INSERT INTO services (vendor_id, name, description, duration_minutes, price) VALUES
(1, 'Wedding Planning', 'Full-service wedding planning with day-of coordination', 60, 2500.00),
(1, 'Corporate Events', 'Professional corporate event management', 60, 1500.00),
(1, 'Birthday Parties', 'Custom birthday party planning', 45, 500.00),
(1, 'Private Dinners', 'Intimate private dinner coordination', 30, 800.00),
(1, 'Product Launches', 'High-impact product launch events', 60, 2000.00),
(1, 'Award Ceremonies', 'Elegant award ceremony planning', 60, 3000.00);

-- Insert packages
INSERT INTO packages (vendor_id, name, description, price, features, is_featured) VALUES
(1, 'Starter Package', 'Perfect for small gatherings', 1500.00, '["Event planning", "Day-of coordination", "Vendor referrals"]', FALSE),
(1, 'Premium Package', 'Most popular choice', 3500.00, '["Full planning services", "Unlimited consultations", "Budget management", "Vendor negotiation", "Day-of coordination", "24/7 support"]', TRUE),
(1, 'Luxury Package', 'Ultimate experience', 7500.00, '["Everything in Premium", "Full venue decoration", "Catering management", "Entertainment booking", "Photo/video coordination", "Guest accommodation booking"]', FALSE);

-- Insert inquiries
INSERT INTO inquiries (vendor_id, customer_name, customer_email, customer_phone, event_type, event_date, event_location, guest_count, budget, notes, status, priority) VALUES
(1, 'Sarah Mitchell', 'sarah.m@email.com', '(555) 234-5678', 'Wedding', '2026-07-15', 'Grand Ballroom, Fairmont Hotel', 150, 15000.00, 'Looking for a full-service wedding planning experience. Interested in your Premium Package.', 'pending', 'high'),
(1, 'James Wilson', 'james.w@corp.com', '(555) 345-6789', 'Corporate', '2026-06-20', 'Tech Conference Center', 200, 8000.00, 'Annual company conference with team building activities.', 'confirmed', 'medium'),
(1, 'Emily Chen', 'emily.chen@mail.com', '(555) 456-7890', 'Birthday', '2026-06-10', 'Rooftop Lounge Skybar', 50, 3000.00, 'Surprise birthday party for my husband. Looking for something elegant but fun.', 'contacted', 'medium'),
(1, 'Michael Brown', 'mbrown@enterprise.com', '(555) 567-8901', 'Corporate', '2026-08-05', 'Marriott Grand Hotel', 500, 25000.00, 'Large-scale product launch event with media coverage.', 'pending', 'high'),
(1, 'Lisa Anderson', 'lisa.a@email.com', '(555) 678-9012', 'Wedding', '2026-09-20', 'Vineyard Estate', 80, 12000.00, 'Dream vineyard wedding. Outdoor ceremony with indoor reception.', 'completed', 'low'),
(1, 'Robert Taylor', 'rtaylor@startup.io', '(555) 789-0123', 'Corporate', '2026-06-15', 'Innovation Hub', 75, 5000.00, 'Quarterly team building event. Need activities and catering coordination.', 'rejected', 'low');

-- Insert bookings
INSERT INTO bookings (inquiry_id, vendor_id, booking_ref, start_date, end_date, total_amount, deposit_paid, status, payment_status) VALUES
(1, 1, 'BK-2026-001', '2026-07-15 14:00:00', '2026-07-15 22:00:00', 15000.00, 5000.00, 'confirmed', 'paid'),
(2, 1, 'BK-2026-002', '2026-06-20 09:00:00', '2026-06-20 18:00:00', 8000.00, 2000.00, 'in_progress', 'partial'),
(5, 1, 'BK-2026-003', '2026-09-20 15:00:00', '2026-09-20 23:00:00', 12000.00, 4000.00, 'completed', 'paid');

-- Insert availability
INSERT INTO availability (vendor_id, day_of_week, start_time, end_time, is_available) VALUES
(1, 0, '09:00:00', '18:00:00', TRUE),
(1, 1, '09:00:00', '20:00:00', TRUE),
(1, 2, '09:00:00', '20:00:00', TRUE),
(1, 3, '09:00:00', '20:00:00', TRUE),
(1, 4, '09:00:00', '20:00:00', TRUE),
(1, 5, '09:00:00', '22:00:00', TRUE),
(1, 6, '10:00:00', '18:00:00', TRUE);

-- Insert notifications
INSERT INTO notifications (user_id, title, message, type, link) VALUES
(1, 'New Inquiry Received', 'Sarah Mitchell sent a new wedding inquiry for July 15, 2026', 'inquiry', '/inquiries/1'),
(1, 'Booking Confirmed', 'James Wilson confirmed the corporate event booking', 'booking', '/bookings/2'),
(1, 'Payment Received', 'Deposit payment of $5,000 received for BK-2026-001', 'payment', '/bookings/1'),
(1, 'Review Submitted', 'Lisa Anderson left a 5-star review', 'review', '/reviews'),
(1, 'Event Reminder', 'Wedding event in 45 days - contact Sarah Mitchell to confirm details', 'reminder', '/inquiries/1');

-- Insert reviews
INSERT INTO reviews (vendor_id, booking_id, customer_name, rating, comment, is_approved) VALUES
(1, 3, 'Lisa Anderson', 5, 'Absolutely incredible! The team made our wedding day absolutely perfect. Every detail was handled with care and professionalism.', TRUE),
(1, 1, 'Mark Johnson', 5, 'Elegant Events transformed our corporate gala into something truly memorable. Highly recommend!', TRUE),
(1, 2, 'Amanda Roberts', 4, 'Great service for our product launch. The team was responsive and professional.', TRUE);

-- =============================================================================
-- STEP 4: Verify Setup
-- =============================================================================
SELECT 'Users:' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'Vendors:', COUNT(*) FROM vendors
UNION ALL
SELECT 'Services:', COUNT(*) FROM services
UNION ALL
SELECT 'Packages:', COUNT(*) FROM packages
UNION ALL
SELECT 'Inquiries:', COUNT(*) FROM inquiries
UNION ALL
SELECT 'Bookings:', COUNT(*) FROM bookings
UNION ALL
SELECT 'Gallery:', COUNT(*) FROM gallery_images
UNION ALL
SELECT 'Notifications:', COUNT(*) FROM notifications
UNION ALL
SELECT 'Reviews:', COUNT(*) FROM reviews;

-- =============================================================================
-- COMPLETE! You should see counts > 0 for all tables
-- =============================================================================
--
-- Demo Login Credentials:
-- Email: demo@vendorix.com
-- Password: password123
-- =============================================================================