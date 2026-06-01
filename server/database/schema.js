import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS vendorix`);
    await connection.query(`USE vendorix`);

    // Users table
    await connection.query(`
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
        deleted_at DATETIME DEFAULT NULL
      )
    `);

    // Vendors table
    await connection.query(`
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
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Services table
    await connection.query(`
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
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
      )
    `);

    // Packages table
    await connection.query(`
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
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
      )
    `);

    // Inquiries table
    await connection.query(`
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
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
      )
    `);

    // Bookings table
    await connection.query(`
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
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
      )
    `);

    // Gallery images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        vendor_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        caption VARCHAR(255),
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
      )
    `);

    // Availability table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS availability (
        id INT PRIMARY KEY AUTO_INCREMENT,
        vendor_id INT NOT NULL,
        day_of_week TINYINT (0-6),
        start_time TIME,
        end_time TIME,
        is_available BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
      )
    `);

    // Notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        type VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        link VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Reviews table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        vendor_id INT NOT NULL,
        booking_id INT,
        customer_name VARCHAR(255),
        rating TINYINT (1-5),
        comment TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ All tables created successfully');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
};

export default initDatabase;