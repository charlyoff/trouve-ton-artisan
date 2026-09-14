import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';

const hasDb = process.env.TEST_DB === '1' && Boolean(process.env.DB_NAME && process.env.DB_USER);
const dbTest = hasDb ? test : test.skip;

async function connect() {
  return mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
}

dbTest('database seed matches the source workbook shape', async () => {
  const connection = await connect();
  try {
    const [[counts]] = await connection.execute(`
      SELECT
        (SELECT COUNT(*) FROM categories) AS categories,
        (SELECT COUNT(*) FROM specialties) AS specialties,
        (SELECT COUNT(*) FROM artisans) AS artisans,
        (SELECT COUNT(*) FROM artisans WHERE is_top = 1) AS top_artisans
    `);
    assert.deepEqual(counts, { categories: 4, specialties: 15, artisans: 17, top_artisans: 3 });

    const [rows] = await connection.execute(`
      SELECT a.name, s.name AS specialty, c.slug AS category
      FROM artisans a
      JOIN specialties s ON s.id = a.specialty_id
      JOIN categories c ON c.id = s.category_id
      WHERE a.name = ?
    `, ['Boucherie Dumont']);
    assert.deepEqual(rows[0], { name: 'Boucherie Dumont', specialty: 'Boucher', category: 'alimentation' });
  } finally {
    await connection.end();
  }
});

dbTest('runtime database account is read only', async () => {
  const connection = await connect();
  try {
    await assert.rejects(
      () => connection.execute('UPDATE artisans SET city = city WHERE id = 1'),
      /command denied|UPDATE command denied|denied/i,
    );
  } finally {
    await connection.end();
  }
});
