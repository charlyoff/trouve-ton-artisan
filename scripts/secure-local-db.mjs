import 'dotenv/config';
import mysql from 'mysql2/promise';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

if (process.env.DB_HOST !== '127.0.0.1' || process.env.DB_PORT !== '3307') throw new Error('This helper only applies to the dedicated local instance on 3307.');
if (process.env.DB_ADMIN_PASSWORD) { console.log('Local administrator already protected.'); process.exit(0); }
const connection = await mysql.createConnection({ host: '127.0.0.1', port: 3307, user: 'root', password: '' });
try {
  const password = randomBytes(32).toString('hex');
  await connection.query('ALTER USER CURRENT_USER() IDENTIFIED BY ?', [password]);
  const env = await readFile('.env', 'utf8');
  await writeFile('.env', env.replace(/^DB_ADMIN_PASSWORD=.*$/m, `DB_ADMIN_PASSWORD=${password}`));
  console.log('Dedicated MySQL root account protected. Password saved only in ignored .env.');
} finally { await connection.end(); }
