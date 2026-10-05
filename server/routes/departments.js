const express = require('express');
const { get, run, all } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public / Authenticated: Get All Active Departments (for registration & complaint dropdowns)
router.get('/', async (req, res) => {
  try {
    const { includeInactive } = req.query;
    let query = `
      SELECT d.*, 
             (SELECT COUNT(*) FROM complaints c WHERE c.department_id = d.id) as complaint_count,
             (SELECT COUNT(*) FROM staff s WHERE s.department_id = d.id) as staff_count
      FROM departments d
    `;

    if (!includeInactive || includeInactive !== 'true') {
      query += ` WHERE d.status = 'Active'`;
    }

    query += ` ORDER BY d.name ASC`;
    const departments = await all(query);
    res.json({ departments });
  } catch (err) {
    console.error('Fetch departments error:', err);
    res.status(500).json({ error: 'Failed to fetch departments.' });
  }
});

// Admin-only endpoints below
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Department name is required.' });
    }

    const existing = await get(`SELECT id FROM departments WHERE name = ?`, [name.trim()]);
    if (existing) {
      return res.status(400).json({ error: 'Department name already exists.' });
    }

    const result = await run(
      `INSERT INTO departments (name, description) VALUES (?, ?)`,
      [name.trim(), description || '']
    );

    const newDept = await get(`SELECT * FROM departments WHERE id = ?`, [result.lastID]);
    res.status(201).json({ message: 'Department created successfully', department: newDept });
  } catch (err) {
    console.error('Create department error:', err);
    res.status(500).json({ error: 'Failed to create department.' });
  }
});

router.patch('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const deptId = req.params.id;
    const { name, description, status } = req.body;

    const dept = await get(`SELECT * FROM departments WHERE id = ?`, [deptId]);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found.' });
    }

    const updatedName = name !== undefined ? name.trim() : dept.name;
    const updatedDesc = description !== undefined ? description : dept.description;
    const updatedStatus = status && ['Active', 'Inactive'].includes(status) ? status : dept.status;

    await run(
      `UPDATE departments SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [updatedName, updatedDesc, updatedStatus, deptId]
    );

    const updated = await get(`SELECT * FROM departments WHERE id = ?`, [deptId]);
    res.json({ message: 'Department updated successfully', department: updated });
  } catch (err) {
    console.error('Update department error:', err);
    res.status(500).json({ error: 'Failed to update department.' });
  }
});

router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const deptId = req.params.id;
    await run(`DELETE FROM departments WHERE id = ?`, [deptId]);
    res.json({ message: 'Department deleted successfully.' });
  } catch (err) {
    console.error('Delete department error:', err);
    res.status(500).json({ error: 'Failed to delete department.' });
  }
});

module.exports = router;
