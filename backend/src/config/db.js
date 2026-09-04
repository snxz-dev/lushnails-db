const { Pool } = require('pg');
require('dotenv').config();

const useSsl = process.env.DB_SSL === 'true' || !!process.env.DATABASE_URL;

const poolConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
} : {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'lushnails_spa',
  user: process.env.DB_USER || 'lushnails_admin',
  password: process.env.DB_PASSWORD || 'DemoDb_7c9L_2026',
};

if (useSsl) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Error inesperado en PostgreSQL:', err);
});

module.exports = pool;
