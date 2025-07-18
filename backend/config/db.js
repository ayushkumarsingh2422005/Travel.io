const mysql = require('mysql2');
require('dotenv').config();

console.log(process.env.DB_HOST)

const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_BASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

module.exports = pool.promise();
