const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestCustomer() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'edson@123',
      database: process.env.DB_NAME || 'catering_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Connected to database');

    // Create test customer account
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Check if test user already exists
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [testEmail]);
    
    if (existing.length > 0) {
      console.log('ℹ️  Test customer already exists');
      // Update password in case it was changed
      await connection.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, testEmail]);
      console.log('✓ Test customer password updated');
    } else {
      await connection.query(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [testEmail, hashedPassword, 'Test Customer', 'customer']
      );
      console.log('✓ Test customer account created');
    }

    console.log('\n📧 Test Customer Credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('\nYou can now login at: http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
createTestCustomer();
