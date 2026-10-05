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
    const logs = await all(`SELECT * FROM login_logs ORDER BY created_at DESC LIMIT 100`);
    res.json({ logs });
  } catch (err) {
    console.error('Fetch login history error:', err);
    res.status(500).json({ error: 'Failed to fetch login history.' });
  }
});

module.exports = router;
