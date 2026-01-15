const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

console.log('Testing connection to:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000 // 5s timeout for test
});

(async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to database!');
    const res = await client.query('SELECT NOW()');
    console.log('Current DB time:', res.rows[0].now);
    client.release();
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await pool.end();
  }
})();
