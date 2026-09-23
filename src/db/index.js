require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const isNeonOrCloud = connectionString && (connectionString.includes('neon.tech') || connectionString.includes('sslmode=require'));

const pool = new Pool({
  connectionString,
  ssl: isNeonOrCloud ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres error on idle client', err);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params)
};
