// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'my_database_name',
  password: 'mypassword',
  port: 5432, // Default PostgreSQL port
});

// Optional: Test the connection
pool.on('connect', () => {
  console.log('Database connected!');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
  // Process.exit(1); // Consider exiting if the database connection is critical
});

// Optional: Test the connection
pool.on('connect', () => {
  console.log('Database connected!');
});

pool.on('remove', () => {
  console.error('Database removed');
  // Process.exit(1); // Consider exiting if the database connection is critical
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};