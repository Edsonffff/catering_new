const mysql = require('mysql2');

// Railway-compatible MySQL pool
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Debug log (VERY IMPORTANT)
console.log('🟢 MYSQL CONNECTED:', {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

module.exports = pool.promise();
