import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';

const name = process.env.DB_NAME || 'trouve_ton_artisan';
if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error('Invalid database name.');
const connection = await mysql.createConnection({ host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_ADMIN_USER || 'root', password: process.env.DB_ADMIN_PASSWORD || '', multipleStatements: true,
  ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}) });
try {
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.query(`USE \`${name}\``);
  const [tables] = await connection.query('SHOW TABLES');
  if (tables.length) throw new Error('Database is not empty. Setup stopped to preserve existing data.');
  await connection.query(await readFile('database/schema.sql', 'utf8'));
  await connection.query(await readFile('database/seed.sql', 'utf8'));
  // A new reader account is optional on managed hosts that provision users separately.
  if (process.env.DB_USER && process.env.DB_USER !== process.env.DB_ADMIN_USER) {
    await connection.query('CREATE USER IF NOT EXISTS ?@? IDENTIFIED BY ?', [process.env.DB_USER, '%', process.env.DB_PASSWORD]);
    await connection.query(`GRANT SELECT ON \`${name}\`.* TO ?@?`, [process.env.DB_USER, '%']);
  }
  const [counts] = await connection.query('SELECT (SELECT COUNT(*) FROM categories) AS categories, (SELECT COUNT(*) FROM specialties) AS specialties, (SELECT COUNT(*) FROM artisans) AS artisans');
  console.log('Database initialized:', counts[0]);
} finally { await connection.end(); }
