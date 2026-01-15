const mysql = require('mysql2');

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.bm5pxvym0henlez4xrxz-mysql.services.clever-cloud.com,        // Clever Cloud host
  user: process.env.uyma5kwvwow2rv6d,        // Clever Cloud user
  password: process.env.cUAcn7BETSErzsIedLVO,// Clever Cloud password
  database: process.env.bm5pxvym0henlez4xrxz,    // Clever Cloud database name
  port: process.env.3306 || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Required for Clever Cloud / cloud MySQL
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: true }
    : undefined
});

// Export promise-based pool (for async/await)
module.exports = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('✓ Database connected successfully');
  connection.release();
});

module.exports = promisePool;



