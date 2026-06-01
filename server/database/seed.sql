-- Seed data for Vendorix
-- Password: password123 (bcrypt hash)

-- Insert demo user
INSERT INTO users (email, password_hash, role, is_active) VALUES
('demo@vendorix.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.aSKiCtTRU1VKJK', 'vendor', TRUE);

-- Get the user id for vendor
SET @user_id = LAST_INSERT_ID();

-- Insert vendor profile
INSERT INTO vendors (user_id, business_name, category, email, phone, address, city, state, zip_code, country, description, is_verified, rating, total_reviews) VALUES
(@user_id, 'Elegant Events Co.', 'Event Planning', 'demo@vendorix.com', '(555) 123-4567', '123 Business Avenue, Suite 400', 'San Francisco', 'California', '94102', 'USA', 'Premium event planning and management services for weddings, corporate events, and special celebrations. With over 10 years of experience, we transform your vision into unforgettable moments.', TRUE, 4.85, 127);

SET @vendor_id = LAST_INSERT_ID();

-- Insert services
INSERT INTO services (vendor_id, name, description, duration_minutes, price) VALUES
(@vendor_id, 'Wedding Planning', 'Full-service wedding planning with day-of coordination', 60, 2500.00),
(@vendor_id, 'Corporate Events', 'Professional corporate event management', 60, 1500.00),
(@vendor_id, 'Birthday Parties', 'Custom birthday party planning', 45, 500.00),
(@vendor_id, 'Private Dinners', 'Intimate private dinner coordination', 30, 800.00),
(@vendor_id, 'Product Launches', 'High-impact product launch events', 60, 2000.00),
(@vendor_id, 'Award Ceremonies', 'Elegant award ceremony planning', 60, 3000.00);

-- Insert packages
INSERT INTO packages (vendor_id, name, description, price, features, is_featured) VALUES
(@vendor_id, 'Starter Package', 'Perfect for small gatherings', 1500.00, '["Event planning", "Day-of coordination", "Vendor referrals"]', FALSE),
(@vendor_id, 'Premium Package', 'Most popular choice', 3500.00, '["Full planning services", "Unlimited consultations", "Budget management", "Vendor negotiation", "Day-of coordination", "24/7 support"]', TRUE),
(@vendor_id, 'Luxury Package', 'Ultimate experience', 7500.00, '["Everything in Premium", "Full venue decoration", "Catering management", "Entertainment booking", "Photo/video coordination", "Guest accommodation booking"]', FALSE);

-- Insert sample inquiries
INSERT INTO inquiries (vendor_id, customer_name, customer_email, customer_phone, event_type, event_date, event_location, guest_count, budget, notes, status, priority) VALUES
(@vendor_id, 'Sarah Mitchell', 'sarah.m@email.com', '(555) 234-5678', 'Wedding', '2026-07-15', 'Grand Ballroom, Fairmont Hotel', 150, 15000.00, 'Looking for a full-service wedding planning experience. Interested in your Premium Package.', 'pending', 'high'),
(@vendor_id, 'James Wilson', 'james.w@corp.com', '(555) 345-6789', 'Corporate', '2026-06-20', 'Tech Conference Center', 200, 8000.00, 'Annual company conference with team building activities.', 'confirmed', 'medium'),
(@vendor_id, 'Emily Chen', 'emily.chen@mail.com', '(555) 456-7890', 'Birthday', '2026-06-10', 'Rooftop Lounge Skybar', 50, 3000.00, 'Surprise birthday party for my husband. Looking for something elegant but fun.', 'contacted', 'medium'),
(@vendor_id, 'Michael Brown', 'mbrown@enterprise.com', '(555) 567-8901', 'Corporate', '2026-08-05', 'Marriott Grand Hotel', 500, 25000.00, 'Large-scale product launch event with media coverage.', 'pending', 'high'),
(@vendor_id, 'Lisa Anderson', 'lisa.a@email.com', '(555) 678-9012', 'Wedding', '2026-09-20', 'Vineyard Estate', 80, 12000.00, 'Dream vineyard wedding. Outdoor ceremony with indoor reception.', 'completed', 'low'),
(@vendor_id, 'Robert Taylor', 'rtaylor@startup.io', '(555) 789-0123', 'Corporate', '2026-06-15', 'Innovation Hub', 75, 5000.00, 'Quarterly team building event. Need activities and catering coordination.', 'rejected', 'low');

-- Insert bookings
INSERT INTO bookings (inquiry_id, vendor_id, booking_ref, start_date, end_date, total_amount, deposit_paid, status, payment_status) VALUES
(1, @vendor_id, 'BK-2026-001', '2026-07-15 14:00:00', '2026-07-15 22:00:00', 15000.00, 5000.00, 'confirmed', 'paid'),
(2, @vendor_id, 'BK-2026-002', '2026-06-20 09:00:00', '2026-06-20 18:00:00', 8000.00, 2000.00, 'in_progress', 'partial'),
(5, @vendor_id, 'BK-2026-003', '2026-09-20 15:00:00', '2026-09-20 23:00:00', 12000.00, 4000.00, 'completed', 'paid');

-- Insert availability
INSERT INTO availability (vendor_id, day_of_week, start_time, end_time, is_available) VALUES
(@vendor_id, 0, '09:00:00', '18:00:00', TRUE),
(@vendor_id, 1, '09:00:00', '20:00:00', TRUE),
(@vendor_id, 2, '09:00:00', '20:00:00', TRUE),
(@vendor_id, 3, '09:00:00', '20:00:00', TRUE),
(@vendor_id, 4, '09:00:00', '20:00:00', TRUE),
(@vendor_id, 5, '09:00:00', '22:00:00', TRUE),
(@vendor_id, 6, '10:00:00', '18:00:00', TRUE);

-- Insert notifications
INSERT INTO notifications (user_id, title, message, type, link) VALUES
(@user_id, 'New Inquiry Received', 'Sarah Mitchell sent a new wedding inquiry for July 15, 2026', 'inquiry', '/inquiries/1'),
(@user_id, 'Booking Confirmed', 'James Wilson confirmed the corporate event booking', 'booking', '/bookings/2'),
(@user_id, 'Payment Received', 'Deposit payment of $5,000 received for BK-2026-001', 'payment', '/bookings/1'),
(@user_id, 'Review Submitted', 'Lisa Anderson left a 5-star review', 'review', '/reviews'),
(@user_id, 'Event Reminder', 'Wedding event in 45 days - contact Sarah Mitchell to confirm details', 'reminder', '/inquiries/1');

-- Insert reviews
INSERT INTO reviews (vendor_id, booking_id, customer_name, rating, comment, is_approved) VALUES
(@vendor_id, 3, 'Lisa Anderson', 5, 'Absolutely incredible! The team made our wedding day absolutely perfect. Every detail was handled with care and professionalism.', TRUE),
(@vendor_id, 1, 'Mark Johnson', 5, 'Elegant Events transformed our corporate gala into something truly memorable. Highly recommend!', TRUE),
(@vendor_id, 2, 'Amanda Roberts', 4, 'Great service for our product launch. The team was responsive and professional.', TRUE);

SELECT 'Database seeded successfully!' as status;