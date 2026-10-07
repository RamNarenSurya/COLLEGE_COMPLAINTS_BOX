require('dotenv').config({ path: './.env' });
const { Client } = require('pg');
const { all, initDB } = require('./db');

async function syncToNeon() {
  await initDB();
  const users = await all('SELECT id, name, student_id, email, role, department_id, year, phone, created_at, updated_at FROM users ORDER BY id ASC');
  const logs = await all('SELECT user_id, user_name, email, role, ip_address, user_agent, created_at FROM login_logs ORDER BY id ASC');
  console.log(`Local SQLite records: ${users.length} registered users, ${logs.length} login log entries.`);

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('✅ Connected to Neon PostgreSQL Cloud Database');

  // 1. Registered Members Table (`users`)
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      student_id VARCHAR(100),
      email VARCHAR(255) UNIQUE NOT NULL,
      role VARCHAR(50) NOT NULL,
      department_id INT,
      year INT,
      phone VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  for (const u of users) {
    await client.query(
      `INSERT INTO users (id, name, student_id, email, role, department_id, year, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         student_id = EXCLUDED.student_id,
         email = EXCLUDED.email,
         role = EXCLUDED.role,
         department_id = EXCLUDED.department_id,
         year = EXCLUDED.year,
         phone = EXCLUDED.phone,
         updated_at = EXCLUDED.updated_at`,
      [
        u.id,
        u.name,
        u.student_id || null,
        u.email,
        u.role,
        u.department_id || null,
        u.year || null,
        u.phone || null,
        u.created_at,
        u.updated_at
      ]
    );
  }

  // 2. Login Audit Logs Table (`login_logs`)
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

  const userCountRes = await client.query('SELECT COUNT(*) FROM users;');
  const logCountRes = await client.query('SELECT COUNT(*) FROM login_logs;');
  console.log('✅ Successfully synced registered members and login audit data to Neon.tech PostgreSQL Cloud DB!');
  console.log(`✅ Total Registered Members in Neon DB: ${userCountRes.rows[0].count}`);
  console.log(`✅ Total Login Audit Logs in Neon DB: ${logCountRes.rows[0].count}`);

  await client.end();
}

syncToNeon().catch(err => console.error('Sync failed:', err));
