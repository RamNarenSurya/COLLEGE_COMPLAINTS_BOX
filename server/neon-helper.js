require('dotenv').config({ path: './.env' });
const { Client } = require('pg');

function getNeonClient() {
  const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) return null;
  return new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
}

/**
 * Ensures tables exist in Neon PostgreSQL database
 */
async function initNeonTables(client) {
  // 1. users table
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

  // 2. registration_logs table
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

  // 3. login_logs table
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

  // 4. user_profile_history table
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
}

/**
 * Real-time helper: Save new registration record directly to Neon DB
 */
async function saveRegistrationToNeon(newUser, ipAddress = '', userAgent = '') {
  const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) return;

  const client = getNeonClient();
  if (!client) return;

  try {
    await client.connect();
    await initNeonTables(client);

    // Insert or update user record
    await client.query(
      `INSERT INTO users (id, name, student_id, email, role, department_id, year, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         student_id = EXCLUDED.student_id,
         email = EXCLUDED.email,
         role = EXCLUDED.role,
         department_id = EXCLUDED.department_id,
         year = EXCLUDED.year,
         phone = EXCLUDED.phone,
         updated_at = CURRENT_TIMESTAMP`,
      [
        newUser.id,
        newUser.name,
        newUser.student_id || null,
        newUser.email,
        newUser.role || 'student',
        newUser.department_id || null,
        newUser.year || null,
        newUser.phone || null
      ]
    );

    // Insert registration log
    await client.query(
      `INSERT INTO registration_logs (user_id, user_name, student_id, email, role, department_name, year, phone, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        newUser.id,
        newUser.name,
        newUser.student_id || null,
        newUser.email,
        newUser.role || 'student',
        newUser.department_name || null,
        newUser.year || null,
        newUser.phone || null,
        ipAddress,
        userAgent
      ]
    );

    console.log(`⚡ [Neon Cloud DB] Successfully recorded registration for user #${newUser.id} (${newUser.email})`);
  } catch (err) {
    console.error('⚠️ [Neon Cloud DB] Failed to save real-time registration:', err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

/**
 * Real-time helper: Save login record directly to Neon DB
 */
async function saveLoginToNeon(user, ipAddress = '', userAgent = '') {
  const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) return;

  const client = getNeonClient();
  if (!client) return;

  try {
    await client.connect();
    await initNeonTables(client);

    await client.query(
      `INSERT INTO login_logs (user_id, user_name, email, role, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        user.name,
        user.email,
        user.role || 'student',
        ipAddress,
        userAgent
      ]
    );

    console.log(`⚡ [Neon Cloud DB] Successfully recorded login audit for user #${user.id}`);
  } catch (err) {
    console.error('⚠️ [Neon Cloud DB] Failed to save real-time login audit:', err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

module.exports = {
  getNeonClient,
  initNeonTables,
  saveRegistrationToNeon,
  saveLoginToNeon
};
