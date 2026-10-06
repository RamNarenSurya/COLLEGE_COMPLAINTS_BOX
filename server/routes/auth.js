const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run, all } = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Helper to extract IP
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

// Student Registration
router.post('/register', async (req, res) => {
  try {
    const { name, student_id, email, password, department_id, year, phone } = req.body;

    if (!name || !student_id || !email || !password || !department_id || !year) {
      return res.status(400).json({ error: 'All required fields (name, student_id, email, password, department, year) must be provided.' });
    }

    const cleanName = name.trim();
    const cleanStudentId = student_id.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check duplicate student_id or email (case-insensitive)
    const existingStudentId = await get(`SELECT id FROM users WHERE LOWER(student_id) = LOWER(?)`, [cleanStudentId]);
    if (existingStudentId) {
      return res.status(400).json({ error: 'Student ID is already registered.' });
    }

    const existingEmail = await get(`SELECT id FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const password_hash = await bcrypt.hash(cleanPassword, 10);

    const result = await run(
      `INSERT INTO users (name, student_id, email, password_hash, role, department_id, year, phone) 
       VALUES (?, ?, ?, ?, 'student', ?, ?, ?)`,
      [cleanName, cleanStudentId, cleanEmail, password_hash, department_id, year, phone ? phone.trim() : null]
    );

    const newUser = await get(
      `SELECT u.id, u.name, u.student_id, u.email, u.role, u.department_id, d.name as department_name, u.year, u.phone 
       FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.id = ?`,
      [result.lastID]
    );

    // Record initial Audit Log Entry for new student registration
    const ip_address = getClientIp(req);
    const user_agent = req.headers['user-agent'] || 'Unknown';
    await run(
      `INSERT INTO login_logs (user_id, user_name, email, role, ip_address, user_agent) VALUES (?, ?, ?, 'student', ?, ?)`,
      [newUser.id, newUser.name, newUser.email, ip_address, user_agent]
    );

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login (Student or Admin - accepts Email OR Student Roll ID)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email/Student ID and password are required.' });
    }

    const identifier = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // Query supports logging in via Email OR Student Roll ID (case-insensitive)
    const user = await get(
      `SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(student_id) = ?`,
      [identifier, identifier]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Get department name if applicable
    let department_name = null;
    if (user.department_id) {
      const dept = await get(`SELECT name FROM departments WHERE id = ?`, [user.department_id]);
      if (dept) department_name = dept.name;
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      student_id: user.student_id,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      department_name,
      year: user.year,
      phone: user.phone
    };

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Record Audit Log Entry
    const ip_address = getClientIp(req);
    const user_agent = req.headers['user-agent'] || 'Unknown';
    await run(
      `INSERT INTO login_logs (user_id, user_name, email, role, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, user.name, user.email, user.role, ip_address, user_agent]
    );

    res.json({
      message: 'Login successful',
      token,
      user: userPayload
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Current User Details
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await get(
      `SELECT u.id, u.name, u.student_id, u.email, u.role, u.department_id, d.name as department_name, u.year, u.phone 
       FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Current User Login History
router.get('/login-history', authenticateToken, async (req, res) => {
  try {
    const logs = await all(
      `SELECT * FROM login_logs WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    const totalLogins = logs.length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogins = logs.filter(l => l.created_at && l.created_at.startsWith(todayStr)).length;

    res.json({
      logs,
      totalLogins,
      todayLogins
    });
  } catch (err) {
    console.error('Fetch student login history error:', err);
    res.status(500).json({ error: 'Failed to fetch login history.' });
  }
});

// Update Current User Profile (no re-registration needed!)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, department_id, year, password, currentPassword } = req.body;

    const user = await get(`SELECT * FROM users WHERE id = ?`, [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Email duplicate check if email changed (case-insensitive)
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== user.email.toLowerCase()) {
        const existing = await get(`SELECT id FROM users WHERE LOWER(email) = ? AND id != ?`, [cleanEmail, userId]);
        if (existing) {
          return res.status(400).json({ error: 'Email address is already in use by another user.' });
        }
      }
    }

    let password_hash = user.password_hash;
    if (password && typeof password === 'string' && password.trim().length > 0) {
      const cleanNewPass = password.trim();
      if (cleanNewPass.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }
      if (currentPassword) {
        const isMatch = await bcrypt.compare(String(currentPassword).trim(), user.password_hash);
        if (!isMatch) {
          return res.status(400).json({ error: 'Current password is incorrect.' });
        }
      }
      password_hash = await bcrypt.hash(cleanNewPass, 10);
    }

    const updatedName = name && name.trim() ? name.trim() : user.name;
    const updatedEmail = email && email.trim() ? email.trim().toLowerCase() : user.email;
    const updatedPhone = phone !== undefined ? (phone ? String(phone).trim() : null) : user.phone;
    const updatedDept = department_id !== undefined ? department_id : user.department_id;
    const updatedYear = year !== undefined ? year : user.year;

    await run(
      `UPDATE users SET name = ?, email = ?, phone = ?, department_id = ?, year = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [updatedName, updatedEmail, updatedPhone, updatedDept, updatedYear, password_hash, userId]
    );

    const updatedUser = await get(
      `SELECT u.id, u.name, u.student_id, u.email, u.role, u.department_id, d.name as department_name, u.year, u.phone 
       FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.id = ?`,
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
