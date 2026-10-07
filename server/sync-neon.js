require('dotenv').config({ path: './.env' });
const { Client } = require('pg');
const { all, initDB } = require('./db');

async function syncToNeon() {
  await initDB();
  const users = await all('SELECT id, name, student_id, email, role, department_id, year, phone, created_at, updated_at FROM users ORDER BY id ASC');
  const regLogs = await all('SELECT user_id, user_name, student_id, email, role, department_name, year, phone, ip_address, user_agent, created_at FROM registration_logs ORDER BY id ASC');
  const loginLogs = await all('SELECT user_id, user_name, email, role, ip_address, user_agent, created_at FROM login_logs ORDER BY id ASC');
  const profileLogs = await all('SELECT user_id, old_name, new_name, old_email, new_email, old_phone, new_phone, change_summary, created_at FROM user_profile_history ORDER BY id ASC');

  console.log(`Local SQLite totals: ${users.length} users, ${regLogs.length} registration logs, ${loginLogs.length} login logs, ${profileLogs.length} profile change logs.`);

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

  // 2. Registration Audit Logs Table (`registration_logs`)
  await client.query(`
    CREATE TABLE IF NOT EXISTS registration_logs (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      student_id VARCHAR(100),
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      department_name VARCHAR(255),
      year INT,
      phone VARCHAR(50),
      ip_address VARCHAR(100),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  for (const r of regLogs) {
    await client.query(
      `INSERT INTO registration_logs (user_id, user_name, student_id, email, role, department_name, year, phone, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        r.user_id,
        r.user_name || '',
        r.student_id || null,
        r.email || '',
        r.role || 'student',
        r.department_name || null,
        r.year || null,
        r.phone || null,
        r.ip_address || '',
        r.user_agent || '',
        r.created_at
      ]
    );
  }

  // 3. Login Audit Logs Table (`login_logs`)
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

  for (const l of loginLogs) {
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

  // 4. User Profile Edit History Table (`user_profile_history`)
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_profile_history (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      old_name VARCHAR(255),
      new_name VARCHAR(255),
      old_email VARCHAR(255),
      new_email VARCHAR(255),
      old_phone VARCHAR(50),
      new_phone VARCHAR(50),
      change_summary TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  for (const p of profileLogs) {
    await client.query(
      `INSERT INTO user_profile_history (user_id, old_name, new_name, old_email, new_email, old_phone, new_phone, change_summary, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        p.user_id,
        p.old_name || null,
        p.new_name || null,
        p.old_email || null,
        p.new_email || null,
        p.old_phone || null,
        p.new_phone || null,
        p.change_summary || '',
        p.created_at
      ]
    );
  }

  const userCountRes = await client.query('SELECT COUNT(*) FROM users;');
  const regCountRes = await client.query('SELECT COUNT(*) FROM registration_logs;');
  const logCountRes = await client.query('SELECT COUNT(*) FROM login_logs;');
  const profileCountRes = await client.query('SELECT COUNT(*) FROM user_profile_history;');

  console.log('✅ Successfully synced all 4 separate history tables to Neon.tech PostgreSQL Cloud DB!');
  console.log(`✅ Registered Members: ${userCountRes.rows[0].count}`);
  console.log(`✅ Registration History Logs: ${regCountRes.rows[0].count}`);
  console.log(`✅ Login Audit Logs: ${logCountRes.rows[0].count}`);
  console.log(`✅ Profile Change Logs: ${profileCountRes.rows[0].count}`);

  await client.end();
}

syncToNeon().catch(err => console.error('Sync failed:', err));
