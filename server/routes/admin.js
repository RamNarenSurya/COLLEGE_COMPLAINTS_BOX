const express = require('express');
const { get, run, all } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply auth & admin role middleware to all admin endpoints
router.use(authenticateToken, requireRole('admin'));

// 1. Get All Complaints with Search & Filter
router.get('/complaints', async (req, res) => {
  try {
    const { search, status, priority, category, department_id, startDate, endDate } = req.query;

    let query = `
      SELECT c.*, u.name as student_name, u.student_id as student_code, u.email as student_email,
             d.name as department_name, s.name as assigned_staff_name
      FROM complaints c
      JOIN users u ON c.student_id = u.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN staff s ON c.assigned_staff_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (c.complaint_number LIKE ? OR c.title LIKE ? OR u.name LIKE ? OR u.student_id LIKE ? OR c.category LIKE ? OR c.location LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term, term);
    }

    if (status && status !== 'All') {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    if (priority && priority !== 'All') {
      query += ` AND c.priority = ?`;
      params.push(priority);
    }

    if (category && category !== 'All') {
      query += ` AND c.category = ?`;
      params.push(category);
    }

    if (department_id && department_id !== 'All') {
      query += ` AND c.department_id = ?`;
      params.push(department_id);
    }

    if (startDate) {
      query += ` AND DATE(c.created_at) >= DATE(?)`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND DATE(c.created_at) <= DATE(?)`;
      params.push(endDate);
    }

    query += ` ORDER BY c.created_at DESC`;

    const complaints = await all(query, params);
    res.json({ count: complaints.length, complaints });
  } catch (err) {
    console.error('Admin get complaints error:', err);
    res.status(500).json({ error: 'Failed to fetch complaints.' });
  }
});

// 2. Get Single Complaint Details for Admin
router.get('/complaints/:id', async (req, res) => {
  try {
    const complaintId = req.params.id;

    const complaint = await get(
      `SELECT c.*, u.name as student_name, u.email as student_email, u.student_id as student_code, u.phone as student_phone, u.year as student_year,
              d.name as department_name, s.name as assigned_staff_name, s.role as assigned_staff_role, s.email as staff_email, s.phone as staff_phone
       FROM complaints c
       JOIN users u ON c.student_id = u.id
       LEFT JOIN departments d ON c.department_id = d.id
       LEFT JOIN staff s ON c.assigned_staff_id = s.id
       WHERE c.id = ?`,
      [complaintId]
    );

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const attachments = await all(`SELECT * FROM complaint_attachments WHERE complaint_id = ?`, [complaintId]);
    const timeline = await all(`SELECT * FROM complaint_updates WHERE complaint_id = ? ORDER BY created_at ASC`, [complaintId]);
    const resolution = await get(`SELECT * FROM resolutions WHERE complaint_id = ?`, [complaintId]);
    const feedback = await get(`SELECT * FROM feedback WHERE complaint_id = ?`, [complaintId]);

    res.json({
      complaint,
      attachments,
      timeline,
      resolution,
      feedback
    });
  } catch (err) {
    console.error('Admin get complaint detail error:', err);
    res.status(500).json({ error: 'Failed to fetch complaint detail.' });
  }
});

// 3. Update Status
router.patch('/complaints/:id/status', async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { status, comment } = req.body;

    const validStatuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const complaint = await get(`SELECT * FROM complaints WHERE id = ?`, [complaintId]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    let extraUpdates = '';
    const extraParams = [];

    if (status === 'Resolved') {
      extraUpdates = `, resolved_at = CURRENT_TIMESTAMP`;
    } else if (status === 'Closed') {
      extraUpdates = `, closed_at = CURRENT_TIMESTAMP`;
    }

    await run(
      `UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP ${extraUpdates} WHERE id = ?`,
      [status, complaintId]
    );

    const updateComment = comment || `Status updated to ${status} by administrator.`;
    await run(
      `INSERT INTO complaint_updates (complaint_id, user_id, user_name, user_role, status, comment)
       VALUES (?, ?, ?, 'admin', ?, ?)`,
      [complaintId, req.user.id, req.user.name, status, updateComment]
    );

    const updated = await get(`SELECT * FROM complaints WHERE id = ?`, [complaintId]);
    res.json({ message: 'Status updated successfully', complaint: updated });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// 4. Assign Department
router.patch('/complaints/:id/department', async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { department_id } = req.body;

    const complaint = await get(`SELECT * FROM complaints WHERE id = ?`, [complaintId]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const dept = await get(`SELECT name FROM departments WHERE id = ?`, [department_id]);
    if (!dept) {
      return res.status(400).json({ error: 'Invalid department ID.' });
    }

    // Default status change to 'Assigned' if currently 'Submitted' or 'Under Review'
    let newStatus = complaint.status;
    if (['Submitted', 'Under Review'].includes(complaint.status)) {
      newStatus = 'Assigned';
    }

    await run(
      `UPDATE complaints SET department_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [department_id, newStatus, complaintId]
    );

    const comment = `Complaint assigned to ${dept.name}.`;
    await run(
      `INSERT INTO complaint_updates (complaint_id, user_id, user_name, user_role, status, comment)
       VALUES (?, ?, ?, 'admin', ?, ?)`,
      [complaintId, req.user.id, req.user.name, newStatus, comment]
    );

    res.json({ message: 'Department assigned successfully.' });
  } catch (err) {
    console.error('Assign department error:', err);
    res.status(500).json({ error: 'Failed to assign department.' });
  }
});

// 5. Assign Staff
router.patch('/complaints/:id/staff', async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { assigned_staff_id } = req.body;

    const complaint = await get(`SELECT * FROM complaints WHERE id = ?`, [complaintId]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const staffMember = await get(`SELECT name, role, department_id FROM staff WHERE id = ?`, [assigned_staff_id]);
    if (!staffMember) {
      return res.status(400).json({ error: 'Invalid staff ID.' });
    }

    let newStatus = complaint.status;
    if (['Submitted', 'Under Review', 'Assigned'].includes(complaint.status)) {
      newStatus = 'Assigned';
    }

    await run(
      `UPDATE complaints SET assigned_staff_id = ?, department_id = COALESCE(department_id, ?), status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [assigned_staff_id, staffMember.department_id, newStatus, complaintId]
    );

    const comment = `Assigned to staff member ${staffMember.name} (${staffMember.role}).`;
    await run(
      `INSERT INTO complaint_updates (complaint_id, user_id, user_name, user_role, status, comment)
       VALUES (?, ?, ?, 'admin', ?, ?)`,
      [complaintId, req.user.id, req.user.name, newStatus, comment]
    );

    res.json({ message: 'Staff assigned successfully.' });
  } catch (err) {
    console.error('Assign staff error:', err);
    res.status(500).json({ error: 'Failed to assign staff.' });
  }
});

// 6. Update Priority
router.patch('/complaints/:id/priority', async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { priority } = req.body;

    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    if (!priority || !validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority.' });
    }

    await run(`UPDATE complaints SET priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [priority, complaintId]);

    await run(
      `INSERT INTO complaint_updates (complaint_id, user_id, user_name, user_role, status, comment)
       VALUES (?, ?, ?, 'admin', (SELECT status FROM complaints WHERE id = ?), ?)`,
      [complaintId, req.user.id, req.user.name, complaintId, `Priority updated to ${priority}.`]
    );

    res.json({ message: 'Priority updated successfully.' });
  } catch (err) {
    console.error('Update priority error:', err);
    res.status(500).json({ error: 'Failed to update priority.' });
  }
});

// 7. Add Comment / Administrative Update
router.post('/complaints/:id/comments', async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty.' });
    }

    const complaint = await get(`SELECT status FROM complaints WHERE id = ?`, [complaintId]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    await run(
      `INSERT INTO complaint_updates (complaint_id, user_id, user_name, user_role, status, comment)
       VALUES (?, ?, ?, 'admin', ?, ?)`,
      [complaintId, req.user.id, req.user.name, complaint.status, comment]
    );

    res.status(201).json({ message: 'Comment added successfully.' });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// 8. Add Resolution
router.post('/complaints/:id/resolution', async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { description, resolved_by, attachment_url } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Resolution description is required.' });
    }

    const complaint = await get(`SELECT * FROM complaints WHERE id = ?`, [complaintId]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const resolver = resolved_by || req.user.name;

    // Insert or Replace Resolution record
    const existing = await get(`SELECT id FROM resolutions WHERE complaint_id = ?`, [complaintId]);
    if (existing) {
      await run(
        `UPDATE resolutions SET resolved_by = ?, description = ?, attachment_url = ?, resolved_at = CURRENT_TIMESTAMP WHERE complaint_id = ?`,
        [resolver, description, attachment_url || null, complaintId]
      );
    } else {
      await run(
        `INSERT INTO resolutions (complaint_id, resolved_by, description, attachment_url) VALUES (?, ?, ?, ?)`,
        [complaintId, resolver, description, attachment_url || null]
      );
    }

    // Mark status as 'Resolved'
    await run(
      `UPDATE complaints SET status = 'Resolved', resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [complaintId]
    );

    await run(
      `INSERT INTO complaint_updates (complaint_id, user_id, user_name, user_role, status, comment)
       VALUES (?, ?, ?, 'admin', 'Resolved', ?)`,
      [complaintId, req.user.id, req.user.name, `Resolution added: ${description}`]
    );

    res.json({ message: 'Resolution saved and complaint marked as Resolved.' });
  } catch (err) {
    console.error('Add resolution error:', err);
    res.status(500).json({ error: 'Failed to add resolution.' });
  }
});

// 9. Statistics API
router.get('/statistics', async (req, res) => {
  try {
    const total = (await get(`SELECT COUNT(*) as c FROM complaints`)).c;
    const submitted = (await get(`SELECT COUNT(*) as c FROM complaints WHERE status = 'Submitted'`)).c;
    const underReview = (await get(`SELECT COUNT(*) as c FROM complaints WHERE status = 'Under Review'`)).c;
    const assigned = (await get(`SELECT COUNT(*) as c FROM complaints WHERE status = 'Assigned'`)).c;
    const inProgress = (await get(`SELECT COUNT(*) as c FROM complaints WHERE status = 'In Progress'`)).c;
    const resolved = (await get(`SELECT COUNT(*) as c FROM complaints WHERE status = 'Resolved'`)).c;
    const closed = (await get(`SELECT COUNT(*) as c FROM complaints WHERE status = 'Closed'`)).c;
    const critical = (await get(`SELECT COUNT(*) as c FROM complaints WHERE priority = 'Critical'`)).c;

    const pending = submitted + underReview + assigned + inProgress;

    // Breakdown by Category
    const categoryBreakdown = await all(
      `SELECT category, COUNT(*) as count FROM complaints GROUP BY category ORDER BY count DESC`
    );

    // Breakdown by Department
    const departmentBreakdown = await all(
      `SELECT COALESCE(d.name, 'Unassigned') as department, COUNT(c.id) as count 
       FROM complaints c LEFT JOIN departments d ON c.department_id = d.id 
       GROUP BY department ORDER BY count DESC`
    );

    // Average Feedback Rating
    const ratingData = await get(`SELECT AVG(rating) as avg_rating, COUNT(*) as total_feedback FROM feedback`);

    res.json({
      total,
      submitted,
      underReview,
      assigned,
      inProgress,
      resolved,
      closed,
      pending,
      critical,
      categoryBreakdown,
      departmentBreakdown,
      avgRating: ratingData.avg_rating ? parseFloat(ratingData.avg_rating.toFixed(2)) : 0,
      totalFeedback: ratingData.total_feedback
    });
  } catch (err) {
    console.error('Statistics API error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
});

// 10. Audit / Login History
router.get('/login-history', async (req, res) => {
  try {
    const logs = await all(`
      SELECT l.*, u.student_id 
      FROM login_logs l 
      LEFT JOIN users u ON l.user_id = u.id 
      ORDER BY l.created_at DESC 
      LIMIT 2000
    `);

    const userCounts = await all(`
      SELECT user_id, COUNT(*) as total_count FROM login_logs GROUP BY user_id
    `);

    const userCountMap = {};
    userCounts.forEach(item => {
      userCountMap[item.user_id] = item.total_count;
    });

    // Get ALL registered users (students and admins) with aggregated login stats
    const allUsersDirectory = await all(`
      SELECT u.id, u.name, u.student_id, u.email, u.role, u.department_id, d.name as department_name, u.year, u.phone, u.created_at as registered_at,
             (SELECT COUNT(*) FROM login_logs l WHERE l.user_id = u.id) as total_logins,
             (SELECT MAX(created_at) FROM login_logs l WHERE l.user_id = u.id) as last_login,
             (SELECT ip_address FROM login_logs l WHERE l.user_id = u.id ORDER BY created_at DESC LIMIT 1) as last_ip
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      ORDER BY total_logins DESC, u.name ASC
    `);

    res.json({ logs, userCountMap, allUsersDirectory });
  } catch (err) {
    console.error('Fetch login history error:', err);
    res.status(500).json({ error: 'Failed to fetch login history.' });
  }
});

// Get specific student/user full login history
router.get('/student-login-history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const targetUser = await get(
      `SELECT u.id, u.name, u.student_id, u.email, u.role, d.name as department_name, u.year, u.phone 
       FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.id = ?`,
      [userId]
    );

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const logs = await all(
      `SELECT * FROM login_logs WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      user: targetUser,
      logs,
      totalLogins: logs.length
    });
  } catch (err) {
    console.error('Fetch student full history error:', err);
    res.status(500).json({ error: 'Failed to fetch user login history.' });
  }
});

// Get Separate Registration Audit History
router.get('/registration-history', async (req, res) => {
  try {
    const regLogs = await all(`SELECT * FROM registration_logs ORDER BY created_at DESC`);
    res.json({ registrationLogs: regLogs });
  } catch (err) {
    console.error('Fetch registration history error:', err);
    res.status(500).json({ error: 'Failed to fetch registration history.' });
  }
});

// Get Permanent Profile Change Audit History
router.get('/profile-history', async (req, res) => {
  try {
    const profileLogs = await all(`SELECT * FROM user_profile_history ORDER BY created_at DESC`);
    res.json({ profileLogs });
  } catch (err) {
    console.error('Fetch profile history error:', err);
    res.status(500).json({ error: 'Failed to fetch profile history.' });
  }
});

// 11. Cloud DB Status, Test & Sync (Neon.tech & Supabase Cloud Integration)
router.get('/cloud-db/status', async (req, res) => {
  try {
    const totalLocalLogs = (await get(`SELECT COUNT(*) as c FROM login_logs`)).c;

    const neonConfigured = !!process.env.NEON_DATABASE_URL || !!process.env.DATABASE_URL;
    const supabaseConfigured = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_KEY;

    const pgSchema = `
-- PostgreSQL DDL Table Schema for Neon.tech / Supabase Cloud DB
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
    `.trim();

    res.json({
      totalLocalLogs,
      neonConfigured,
      supabaseConfigured,
      neonUrl: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '',
      supabaseUrl: process.env.SUPABASE_URL || '',
      pgSchema
    });
  } catch (err) {
    console.error('Cloud DB status error:', err);
    res.status(500).json({ error: 'Failed to fetch Cloud DB status.' });
  }
});

router.post('/cloud-db/test', async (req, res) => {
  try {
    const { provider, connectionUrl, supabaseUrl, supabaseKey } = req.body;

    if (provider === 'supabase') {
      if (!supabaseUrl || !supabaseKey) {
        return res.status(400).json({ error: 'Supabase URL and API Key/Service Key are required.' });
      }

      const testRes = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (!testRes.ok && testRes.status !== 404) {
        return res.status(400).json({ error: `Supabase Connection Failed (HTTP ${testRes.status})` });
      }

      return res.json({ message: 'Supabase Cloud Database connected successfully!' });
    } else if (provider === 'neon') {
      const connUrl = connectionUrl || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

      if (!connUrl) {
        return res.status(400).json({ error: 'Neon.tech Database URL is required.' });
      }

      if (connUrl.startsWith('postgresql://') || connUrl.startsWith('postgres://')) {
        const { Client } = require('pg');
        const client = new Client({ connectionString: connUrl, ssl: { rejectUnauthorized: false } });
        await client.connect();
        await client.query('SELECT 1;');
        await client.end();
        return res.json({ message: 'Neon.tech PostgreSQL Cloud Database connected & verified successfully!' });
      } else if (connUrl.startsWith('https://')) {
        return res.json({ message: 'Neon.tech HTTP Connection URL validated successfully!' });
      } else {
        return res.status(400).json({ error: 'Invalid Neon Database URL. Must begin with postgresql:// or https://' });
      }
    } else {
      return res.status(400).json({ error: 'Unsupported provider. Must be "neon" or "supabase".' });
    }
  } catch (err) {
    console.error('Test Cloud DB Error:', err);
    res.status(500).json({ error: 'Connection test failed: ' + err.message });
  }
});

router.post('/cloud-db/sync', async (req, res) => {
  try {
    const { provider, supabaseUrl, supabaseKey, connectionUrl } = req.body;

    const logs = await all(`SELECT user_id, user_name, email, role, ip_address, user_agent, created_at FROM login_logs ORDER BY id ASC`);

    if (provider === 'supabase') {
      const url = supabaseUrl || process.env.SUPABASE_URL;
      const key = supabaseKey || process.env.SUPABASE_KEY;

      if (!url || !key) {
        return res.status(400).json({ error: 'Supabase URL and API Key are required for cloud sync.' });
      }

      const syncRes = await fetch(`${url}/rest/v1/login_logs`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(logs)
      });

      if (!syncRes.ok) {
        const errText = await syncRes.text();
        return res.status(400).json({ error: `Supabase Cloud Sync Failed: ${errText || syncRes.statusText}` });
      }

      return res.json({ message: `Successfully synced ${logs.length} login log records to Supabase Cloud Database!`, count: logs.length });
    } else if (provider === 'neon') {
      const connUrl = connectionUrl || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

      if (!connUrl) {
        return res.status(400).json({ error: 'Neon.tech Database URL is required for cloud sync.' });
      }

      if (connUrl.startsWith('postgresql://') || connUrl.startsWith('postgres://')) {
        const { Client } = require('pg');
        const client = new Client({ connectionString: connUrl, ssl: { rejectUnauthorized: false } });
        await client.connect();

        // 1. Registered Members Table (`users`)
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            student_id VARCHAR(100),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT,
            role VARCHAR(50) NOT NULL,
            department_id INT,
            year INT,
            phone VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;`).catch(() => {});

        const allUsers = await all(`SELECT id, name, student_id, email, password_hash, role, department_id, year, phone, created_at, updated_at FROM users ORDER BY id ASC`);
        for (const u of allUsers) {
          await client.query(
            `INSERT INTO users (id, name, student_id, email, password_hash, role, department_id, year, phone, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (email) DO UPDATE SET
               id = EXCLUDED.id,
               name = EXCLUDED.name,
               student_id = EXCLUDED.student_id,
               password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
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
              u.password_hash || null,
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

        const regLogs = await all(`SELECT user_id, user_name, student_id, email, role, department_name, year, phone, ip_address, user_agent, created_at FROM registration_logs ORDER BY id ASC`);
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

        const profileLogs = await all(`SELECT user_id, old_name, new_name, old_email, new_email, old_phone, new_phone, change_summary, created_at FROM user_profile_history ORDER BY id ASC`);
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
        const countRes = await client.query('SELECT COUNT(*) FROM login_logs;');
        const profileCountRes = await client.query('SELECT COUNT(*) FROM user_profile_history;');
        await client.end();

        return res.json({
          message: `Successfully synced all 4 history tables to Neon.tech PostgreSQL Cloud DB! (Neon DB Totals: ${userCountRes.rows[0].count} users, ${regCountRes.rows[0].count} registrations, ${countRes.rows[0].count} logins, ${profileCountRes.rows[0].count} profile changes)`,
          count: logs.length
        });
      } else if (connUrl.startsWith('https://')) {
        const sqlStatements = logs.map(l => 
          `INSERT INTO login_logs (user_id, user_name, email, role, ip_address, user_agent, created_at) VALUES (${l.user_id}, '${(l.user_name || '').replace(/'/g, "''")}', '${(l.email || '').replace(/'/g, "''")}', '${l.role || 'student'}', '${l.ip_address || ''}', '${(l.user_agent || '').replace(/'/g, "''")}', '${l.created_at}');`
        ).join('\n');

        const neonRes = await fetch(connUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/sql' },
          body: sqlStatements
        });

        if (!neonRes.ok) {
          const errText = await neonRes.text();
          return res.status(400).json({ error: `Neon Sync Failed: ${errText}` });
        }

        return res.json({ message: `Successfully synced ${logs.length} login log records to Neon.tech PostgreSQL!`, count: logs.length });
      } else {
        return res.status(400).json({ error: 'Invalid Neon Database URL. Must begin with postgresql:// or https://' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid Cloud DB Provider selected.' });
    }
  } catch (err) {
    console.error('Cloud DB Sync Error:', err);
    res.status(500).json({ error: 'Cloud database sync failed: ' + err.message });
  }
});

module.exports = router;
