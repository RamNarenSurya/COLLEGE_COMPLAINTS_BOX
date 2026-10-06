require('dotenv').config({ path: './.env' });
const { Client } = require('pg');
const { all, initDB } = require('./db');

async function syncToNeon() {
  await initDB();
  const logs = await all('SELECT user_id, user_name, email, role, ip_address, user_agent, created_at FROM login_logs ORDER BY id ASC');
  console.log('Local SQLite records count:', logs.length);

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('✅ Connected to Neon PostgreSQL Cloud Database');

  await client.query(`
    CREATE TABLE IF NOT EXISTS login_logs (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      ip_address VARCHAR(100),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  for (const l of logs) {
    await client.query(
      `INSERT INTO login_logs (user_id, user_name, email, role, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        l.user_id,
        l.user_name || '',
        l.email || '',
        l.role || 'student',
        l.ip_address || '',
        l.user_agent || '',
        l.created_at
      ]
    );
  }

  const countRes = await client.query('SELECT COUNT(*) FROM login_logs;');
  console.log('✅ Successfully synced all login audit records!');
  console.log('✅ Total records verified in Neon PostgreSQL Cloud DB:', countRes.rows[0].count);

  await client.end();
}

syncToNeon().catch(err => console.error('Sync failed:', err));
