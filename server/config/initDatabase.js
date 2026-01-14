const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  
  try {
    // Connect without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to MySQL server');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'catering_db'}`);
    console.log('✓ Database created/verified');

    // Switch to the database
    await connection.query(`USE ${process.env.DB_NAME || 'catering_db'}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('admin', 'customer') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Create menu_categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Menu categories table created');

    // Create menu_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(500),
        is_available BOOLEAN DEFAULT true,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Menu items table created');

    // Create event_packages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS event_packages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        min_guests INT DEFAULT 1,
        max_guests INT,
        features JSON,
        image_url VARCHAR(500),
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Event packages table created');

    // Create orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        event_date DATE NOT NULL,
        event_time TIME NOT NULL,
        location TEXT NOT NULL,
        guest_count INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        special_requests TEXT,
        status ENUM('pending', 'confirmed', 'preparing', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Orders table created');

    // Create order_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        item_type ENUM('menu_item', 'package') NOT NULL,
        item_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Order items table created');

    // Create reviews table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        event_type VARCHAR(100),
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Reviews table created');

    // Create gallery table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255),
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        category VARCHAR(100),
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Gallery table created');

    // Create admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
    await connection.query(`
      INSERT INTO users (email, password, name, role)
      VALUES (?, ?, 'Admin', 'admin')
      ON DUPLICATE KEY UPDATE password = password
    `, [process.env.ADMIN_EMAIL || 'admin@catering.com', hashedPassword]);
    console.log('✓ Admin user created');

    // Insert sample data
    await insertSampleData(connection);

    console.log('\n✓ Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function insertSampleData(connection) {
  // Insert menu categories
  await connection.query(`
    INSERT INTO menu_categories (name, description, image_url, display_order) VALUES
    ('Appetizers', 'Start your event with delicious appetizers', '/images/appetizers.jpg', 1),
    ('Main Courses', 'Our signature main dishes for your special event', '/images/main-courses.jpg', 2),
    ('Desserts', 'Sweet endings to make your event memorable', '/images/desserts.jpg', 3),
    ('Beverages', 'Refreshing drinks for all occasions', '/images/beverages.jpg', 4)
    ON DUPLICATE KEY UPDATE name = name
  `);

  // Insert menu items
  await connection.query(`
    INSERT INTO menu_items (category_id, name, description, price, is_available, display_order) VALUES
    (1, 'Spring Rolls', 'Crispy vegetable spring rolls with sweet chili sauce', 12.99, true, 1),
    (1, 'Bruschetta Platter', 'Fresh tomato and basil on toasted bread', 15.99, true, 2),
    (1, 'Stuffed Mushrooms', 'Mushroom caps filled with herbs and cheese', 14.99, true, 3),
    (2, 'Grilled Chicken', 'Herb-marinated grilled chicken breast', 24.99, true, 1),
    (2, 'Beef Wellington', 'Tender beef wrapped in puff pastry', 35.99, true, 2),
    (2, 'Vegetarian Lasagna', 'Layered pasta with vegetables and cheese', 19.99, true, 3),
    (3, 'Chocolate Cake', 'Rich chocolate layer cake', 8.99, true, 1),
    (3, 'Tiramisu', 'Classic Italian dessert', 9.99, true, 2),
    (4, 'Fresh Juice Bar', 'Assorted fresh juices', 5.99, true, 1),
    (4, 'Coffee & Tea Station', 'Premium coffee and tea selection', 3.99, true, 2)
    ON DUPLICATE KEY UPDATE name = name
  `);

  // Insert event packages
  await connection.query(`
    INSERT INTO event_packages (name, description, price, min_guests, max_guests, features) VALUES
    ('Bronze Package', 'Perfect for intimate gatherings', 499.99, 10, 25, 
     '["2 Appetizers", "2 Main Courses", "1 Dessert", "Basic Beverages", "Standard Setup"]'),
    ('Silver Package', 'Ideal for medium-sized events', 899.99, 26, 50, 
     '["3 Appetizers", "3 Main Courses", "2 Desserts", "Premium Beverages", "Elegant Setup", "Professional Service"]'),
    ('Gold Package', 'Premium experience for larger events', 1499.99, 51, 100, 
     '["4 Appetizers", "4 Main Courses", "3 Desserts", "Full Bar Service", "Luxury Setup", "Dedicated Event Coordinator", "Live Cooking Station"]'),
    ('Platinum Package', 'Ultimate luxury for grand celebrations', 2999.99, 101, 200, 
     '["Unlimited Appetizers", "5 Main Courses", "4 Desserts", "Premium Bar Service", "Custom Décor", "Event Planner", "Live Entertainment", "Photography"]')
    ON DUPLICATE KEY UPDATE name = name
  `);

  // Insert sample reviews
  await connection.query(`
    INSERT INTO reviews (customer_name, rating, comment, event_type, is_approved) VALUES
    ('Sarah Johnson', 5, 'Amazing food and service! Our wedding was perfect thanks to this team.', 'Wedding', true),
    ('Michael Chen', 5, 'Professional, delicious, and stress-free. Highly recommend!', 'Corporate Event', true),
    ('Emily Rodriguez', 4, 'Great quality food. The presentation was beautiful.', 'Birthday Party', true),
    ('David Wilson', 5, 'Best catering service in town! Everyone loved the food.', 'Anniversary', true)
    ON DUPLICATE KEY UPDATE customer_name = customer_name
  `);

  console.log('✓ Sample data inserted');
}

// Run initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
