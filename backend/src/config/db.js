const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'lushnails_spa',
  user: process.env.DB_USER || 'lushnails_admin',
  password: process.env.DB_PASSWORD || 'LushNails2024',
});

pool.on('error', (err) => {
  console.error('Error inesperado en PostgreSQL:', err);
});

module.exports = pool;
