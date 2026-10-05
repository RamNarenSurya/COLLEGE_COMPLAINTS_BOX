const express = require('express');
const { get, run, all } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Get staff list (Filtered by department optional)
router.get('/', async (req, res) => {
  try {
    const { department_id, status } = req.query;

    let query = `
      SELECT s.*, d.name as department_name,
             (SELECT COUNT(*) FROM complaints c WHERE c.assigned_staff_id = s.id AND c.status NOT IN ('Closed', 'Resolved')) as active_assignments
      FROM staff s
      LEFT JOIN departments d ON s.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      query += ` AND s.department_id = ?`;
      params.push(department_id);
    }

    if (status) {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY s.name ASC`;
    const staffList = await all(query, params);
    res.json({ staff: staffList });
  } catch (err) {
    console.error('Fetch staff error:', err);
    res.status(500).json({ error: 'Failed to fetch staff directory.' });
  }
});

// Admin-only staff mutations
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { name, email, phone, department_id, role } = req.body;

    if (!name || !email || !department_id || !role) {
      return res.status(400).json({ error: 'Name, email, department, and role are required.' });
    }

    const existing = await get(`SELECT id FROM staff WHERE email = ?`, [email.trim()]);
    if (existing) {
      return res.status(400).json({ error: 'Staff email already registered.' });
    }

    const result = await run(
      `INSERT INTO staff (name, email, phone, department_id, role) VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email.trim(), phone || null, department_id, role.trim()]
    );

    const newStaff = await get(
      `SELECT s.*, d.name as department_name FROM staff s LEFT JOIN departments d ON s.department_id = d.id WHERE s.id = ?`,
      [result.lastID]
    );

    res.status(201).json({ message: 'Staff member created successfully', staff: newStaff });
  } catch (err) {
    console.error('Create staff error:', err);
    res.status(500).json({ error: 'Failed to create staff member.' });
  }
});

router.patch('/:id', requireRole('admin'), async (req, res) => {
  try {
    const staffId = req.params.id;
    const { name, email, phone, department_id, role, status } = req.body;

    const staffMember = await get(`SELECT * FROM staff WHERE id = ?`, [staffId]);
    if (!staffMember) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    const updatedName = name !== undefined ? name.trim() : staffMember.name;
    const updatedEmail = email !== undefined ? email.trim() : staffMember.email;
    const updatedPhone = phone !== undefined ? phone : staffMember.phone;
    const updatedDept = department_id !== undefined ? department_id : staffMember.department_id;
    const updatedRole = role !== undefined ? role.trim() : staffMember.role;
    const updatedStatus = status && ['Active', 'Inactive'].includes(status) ? status : staffMember.status;

    await run(
      `UPDATE staff SET name = ?, email = ?, phone = ?, department_id = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [updatedName, updatedEmail, updatedPhone, updatedDept, updatedRole, updatedStatus, staffId]
    );

    const updated = await get(
      `SELECT s.*, d.name as department_name FROM staff s LEFT JOIN departments d ON s.department_id = d.id WHERE s.id = ?`,
      [staffId]
    );

    res.json({ message: 'Staff profile updated successfully', staff: updated });
  } catch (err) {
    console.error('Update staff error:', err);
    res.status(500).json({ error: 'Failed to update staff member.' });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const staffId = req.params.id;
    await run(`DELETE FROM staff WHERE id = ?`, [staffId]);
    res.json({ message: 'Staff member deleted successfully.' });
  } catch (err) {
    console.error('Delete staff error:', err);
    res.status(500).json({ error: 'Failed to delete staff member.' });
  }
});

module.exports = router;
