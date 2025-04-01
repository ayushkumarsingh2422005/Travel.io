const mysql = require('mysql2');
require('dotenv').config();

// In your db.js or database configuration file
const pool = mysql.createPool({
    host: '127.0.0.1', // Use IPv4 loopback instead of 'localhost'
    user: 'root', // or 'cabbook_admin' if you created that user
    password: 'Satyam@9693',
    database: 'cabbook',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

module.exports = pool.promise();
