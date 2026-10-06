const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { get, run, all } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Setup Multer for file uploads
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'attachment-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper to generate unique complaint ID: CMP-2026-XXXX
async function generateComplaintNumber() {
  const year = new Date().getFullYear();
  const prefix = `CMP-${year}-`;
  const lastComp = await get(
    `SELECT complaint_number FROM complaints WHERE complaint_number LIKE ? ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextSeq = 1;
  if (lastComp && lastComp.complaint_number) {
    const parts = lastComp.complaint_number.split('-');
    const seq = parseInt(parts[2], 10);
    if (!isNaN(seq)) {
      nextSeq = seq + 1;
    }
  }

  const padded = String(nextSeq).padStart(4, '0');
  return `${prefix}${padded}`;
}

// 1. Submit New Complaint
router.post('/', authenticateToken, requireRole('student'), upload.single('attachment'), async (req, res) => {
  try {
    const { title, category, description, location, priority } = req.body;

    if (!title || !category || !description || !location) {
      return res.status(400).json({ error: 'Title, category, description, and location are required.' });
    }

    const complaint_number = await generateComplaintNumber();
    const assignedPriority = priority && ['Low', 'Medium', 'High', 'Critical'].includes(priority) ? priority : 'Medium';

    const result = await run(
      `INSERT INTO complaints (complaint_number, student_id, title, category, description, location, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Submitted')`,
      [complaint_number, req.user.id, title, category, description, location, assignedPriority]
    );

    const complaintId = result.lastID;

    // Handle file attachment if uploaded
    if (req.file) {
      const file_url = `/uploads/${req.file.filename}`;
      await run(
        `INSERT INTO complaint_attachments (complaint_id, file_name, file_url, file_type, file_size)
         VALUES (?, ?, ?, ?, ?)`,
        [complaintId, req.file.originalname, file_url, req.file.mimetype, req.file.size]
      );
    }

    // Add initial timeline update entry
    await run(
      `INSERT INTO complaint_updates (complaint_id, user_id, user_name, user_role, status, comment)
       VALUES (?, ?, ?, 'student', 'Submitted', ?)`,
      [complaintId, req.user.id, req.user.name, 'Complaint submitted successfully by student.']
    );

    const newComplaint = await get(`SELECT * FROM complaints WHERE id = ?`, [complaintId]);

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: newComplaint
    });
  } catch (err) {
    console.error('Create complaint error:', err);
    res.status(500).json({ error: 'Failed to submit complaint.' });
  }
});

// 2. Get Logged-in Student's Complaints
router.get('/my', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const complaints = await all(
      `SELECT c.*, d.name as department_name, s.name as assigned_staff_name
       FROM complaints c
       LEFT JOIN departments d ON c.department_id = d.id
       LEFT JOIN staff s ON c.assigned_staff_id = s.id
       WHERE c.student_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    // Summary KPI stats
    const stats = {
      total: complaints.length,
      submitted: complaints.filter(c => c.status === 'Submitted').length,
      underReview: complaints.filter(c => c.status === 'Under Review').length,
      assigned: complaints.filter(c => c.status === 'Assigned').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
      closed: complaints.filter(c => c.status === 'Closed').length
    };

    res.json({ stats, complaints });
  } catch (err) {
    console.error('Fetch student complaints error:', err);
    res.status(500).json({ error: 'Failed to fetch complaints.' });
  }
});

// 3. Get Single Complaint Details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const complaintId = req.params.id;

    const complaint = await get(
      `SELECT c.*, u.name as student_name, u.email as student_email, u.student_id as student_code, u.phone as student_phone,
              d.name as department_name, s.name as assigned_staff_name, s.role as assigned_staff_role
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

    // Ensure student can only access their own complaint (admins can access all)
    if (req.user.role === 'student' && complaint.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
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
    console.error('Get complaint detail error:', err);
    res.status(500).json({ error: 'Failed to fetch complaint details.' });
  }
});

// Edit Complaint Details (Student can edit any of their submitted issues)
router.put('/:id', authenticateToken, requireRole('student'), upload.single('attachment'), async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { title, category, description, location, priority } = req.body;

    const complaint = await get(`SELECT * FROM complaints WHERE id = ? AND student_id = ?`, [complaintId, req.user.id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found or you do not have permission to edit it.' });
    }

    if (complaint.status === 'Closed') {
      return res.status(400).json({ error: 'Closed complaints cannot be edited.' });
    }

    const updatedTitle = title ? title.trim() : complaint.title;
    const updatedCategory = category ? category.trim() : complaint.category;
    const updatedDescription = description ? description.trim() : complaint.description;
    const updatedLocation = location ? location.trim() : complaint.location;
    const updatedPriority = priority && ['Low', 'Medium', 'High', 'Critical'].includes(priority) ? priority : complaint.priority;

    await run(
      `UPDATE complaints SET title = ?, category = ?, description = ?, location = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [updatedTitle, updatedCategory, updatedDescription, updatedLocation, updatedPriority, complaintId]
    );

    // Handle new file attachment if uploaded
    if (req.file) {
      const file_url = `/uploads/${req.file.filename}`;
      await run(
        `INSERT INTO complaint_attachments (complaint_id, file_name, file_url, file_type, file_size)
         VALUES (?, ?, ?, ?, ?)`,
        [complaintId, req.file.originalname, file_url, req.file.mimetype, req.file.size]
      );
    }

    // Add timeline entry
    await run(
      `INSERT INTO complaint_updates (complaint_id, user_id, user_name, user_role, status, comment)
       VALUES (?, ?, ?, 'student', ?, ?)`,
      [complaintId, req.user.id, req.user.name, complaint.status, 'Student updated issue details (title, description, or location).']
    );

    const updatedComplaint = await get(`SELECT * FROM complaints WHERE id = ?`, [complaintId]);

    res.json({
      message: 'Complaint updated successfully',
      complaint: updatedComplaint
    });
  } catch (err) {
    console.error('Edit complaint error:', err);
    res.status(500).json({ error: 'Failed to update complaint details.' });
  }
});

// 4. Update/Close Complaint (Student Confirmation on Resolved status)
router.patch('/:id', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { action, comment } = req.body; // action: 'accept' or 'reopen'

    const complaint = await get(`SELECT * FROM complaints WHERE id = ? AND student_id = ?`, [complaintId, req.user.id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ error: 'Confirmation is only applicable when complaint status is Resolved.' });
    }

    let newStatus = complaint.status;
    let updateComment = '';

    if (action === 'accept') {
      newStatus = 'Closed';
      updateComment = comment || 'Student accepted resolution and confirmed resolution.';
      await run(`UPDATE complaints SET status = ?, closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, ['Closed', complaintId]);
    } else if (action === 'reopen') {
      newStatus = 'In Progress';
      updateComment = comment || 'Student reported issue still exists. Status returned to In Progress.';
      await run(`UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, ['In Progress', complaintId]);
    } else {
      return res.status(400).json({ error: 'Invalid action. Must be "accept" or "reopen".' });
    }

    // Add timeline entry
    await run(
      `INSERT INTO complaint_updates (complaint_id, user_id, user_name, user_role, status, comment)
       VALUES (?, ?, ?, 'student', ?, ?)`,
      [complaintId, req.user.id, req.user.name, newStatus, updateComment]
    );

    const updated = await get(`SELECT * FROM complaints WHERE id = ?`, [complaintId]);
    res.json({ message: 'Complaint status updated', complaint: updated });
  } catch (err) {
    console.error('Update complaint status error:', err);
    res.status(500).json({ error: 'Failed to update complaint.' });
  }
});

// 5. Submit Feedback (After resolution/closure)
router.post('/:id/feedback', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    const complaint = await get(`SELECT * FROM complaints WHERE id = ? AND student_id = ?`, [complaintId, req.user.id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    if (!['Resolved', 'Closed'].includes(complaint.status)) {
      return res.status(400).json({ error: 'Feedback can only be submitted after complaint is resolved or closed.' });
    }

    // Check existing feedback
    const existing = await get(`SELECT id FROM feedback WHERE complaint_id = ?`, [complaintId]);
    if (existing) {
      return res.status(400).json({ error: 'Feedback has already been submitted for this complaint.' });
    }

    await run(
      `INSERT INTO feedback (complaint_id, student_id, rating, comment) VALUES (?, ?, ?, ?)`,
      [complaintId, req.user.id, rating, comment || '']
    );

    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

module.exports = router;
