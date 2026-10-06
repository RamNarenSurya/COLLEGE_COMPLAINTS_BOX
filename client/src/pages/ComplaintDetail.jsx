import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Timeline from '../components/Timeline';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Building, 
  FileText, 
  Download, 
  CheckCircle, 
  RefreshCw, 
  Star, 
  MessageSquare,
  AlertTriangle,
  Edit,
  Save,
  X
} from 'lucide-react';

export default function ComplaintDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);

  // Edit Issue state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');

  useEffect(() => {
    loadComplaintDetail();
  }, [id]);

  async function loadComplaintDetail() {
    try {
      const res = await api.getComplaintDetail(id);
      setData(res);
      if (res.complaint) {
        setEditTitle(res.complaint.title || '');
        setEditCategory(res.complaint.category || '');
        setEditDescription(res.complaint.description || '');
        setEditLocation(res.complaint.location || '');
        setEditPriority(res.complaint.priority || 'Medium');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch complaint detail.');
    } finally {
      setLoading(false);
    }
  }

  const handleStudentAction = async (action, commentText) => {
    setActionLoading(true);
    try {
      await api.updateStudentComplaint(id, action, commentText);
      await loadComplaintDetail();
      setShowReopenModal(false);
    } catch (err) {
      alert('Action failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.editComplaint(id, {
        title: editTitle,
        category: editCategory,
        description: editDescription,
        location: editLocation,
        priority: editPriority
      });
      alert('Complaint details updated successfully!');
      setShowEditModal(false);
      await loadComplaintDetail();
    } catch (err) {
      alert('Failed to edit complaint: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.submitFeedback(id, rating, feedbackComment);
      setFeedbackSubmitted(true);
      await loadComplaintDetail();
    } catch (err) {
      alert('Feedback submission failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading ticket details...</div>;
  }

  if (error || !data) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>{error || 'Complaint not found.'}</p>
        <Link to="/student/complaints" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
          Back to Complaints
        </Link>
      </div>
    );
  }

  const { complaint, attachments, timeline, resolution, feedback } = data;

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/student/complaints" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} /> Back
          </Link>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary-700)' }}>
              #{complaint.complaint_number}
            </span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.1rem 0 0 0' }}>{complaint.title}</h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {complaint.status !== 'Closed' && (
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-secondary btn-sm"
              title="Edit submitted complaint details"
            >
              <Edit size={16} /> Edit Issue
            </button>
          )}
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Edit Issue Modal / Card */}
      {showEditModal && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid var(--primary-600)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit size={20} color="var(--primary-600)" /> Edit Submitted Issue
            </h3>
            <button onClick={() => setShowEditModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.5rem' }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label className="form-label">Issue Title *</label>
              <input
                type="text"
                className="form-control"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-control"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  required
                >
                  <option value="Infrastructure">Infrastructure & Building</option>
                  <option value="IT & Network">IT & Wi-Fi Network</option>
                  <option value="Electrical">Electrical & Power</option>
                  <option value="Plumbing">Plumbing & Water</option>
                  <option value="Cleanliness">Cleanliness & Sanitization</option>
                  <option value="Hostel & Mess">Hostel & Mess Amenities</option>
                  <option value="Academic">Academic & Library</option>
                  <option value="Security">Security & Safety</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Room No. *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-control"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Issue Description *</label>
              <textarea
                className="form-control"
                rows="4"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="detail-grid">
        {/* Left Column: Complaint Details & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Info Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
              Issue Description
            </h3>

            <p style={{ whiteSpace: 'pre-line', fontSize: '0.95rem', color: 'var(--slate-700)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {complaint.description}
            </p>

            <div className="info-two-col" style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Category</span>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{complaint.category}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Location</span>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} color="var(--primary-600)" /> {complaint.location}
                </div>
              </div>
            </div>

            {/* Attachments */}
            {attachments && attachments.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Attachments ({attachments.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {attachments.map(att => (
                    <div key={att.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      background: 'white',
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} color="var(--primary-600)" />
                        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{att.file_name}</span>
                      </div>
                      <a href={att.file_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                        <Download size={14} /> View Attachment
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Student Resolution Confirmation Box (When Resolved) */}
          {complaint.status === 'Resolved' && (
            <div className="card" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', marginBottom: '0.5rem' }}>
                <CheckCircle size={22} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#047857' }}>Complaint Marked as Resolved</h3>
              </div>

              {resolution && (
                <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                    Resolved By: <strong>{resolution.resolved_by}</strong> on {new Date(resolution.resolved_at).toLocaleDateString()}
                  </div>
                  <p style={{ marginTop: '0.4rem', fontSize: '0.92rem', color: 'var(--slate-800)', fontWeight: 600 }}>
                    {resolution.description}
                  </p>
                </div>
              )}

              <p style={{ fontSize: '0.9rem', color: '#064e3b', marginBottom: '1rem' }}>
                Please confirm whether the issue has been resolved to your satisfaction.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleStudentAction('accept')}
                  className="btn btn-success"
                  disabled={actionLoading}
                >
                  <CheckCircle size={16} /> Accept Resolution & Close Ticket
                </button>
                <button
                  onClick={() => setShowReopenModal(true)}
                  className="btn btn-danger"
                  disabled={actionLoading}
                >
                  <RefreshCw size={16} /> Issue Still Exists (Reopen)
                </button>
              </div>
            </div>
          )}

          {/* Reopen Modal / Form */}
          {showReopenModal && (
            <div className="card" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>
                Report Issue Still Exists
              </h4>
              <textarea
                className="form-control"
                placeholder="Explain why the issue is not fully fixed..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                style={{ marginBottom: '1rem' }}
              ></textarea>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleStudentAction('reopen', reopenReason)}
                  className="btn btn-danger btn-sm"
                  disabled={actionLoading}
                >
                  Confirm Reopen Ticket
                </button>
                <button onClick={() => setShowReopenModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Feedback Form (If Resolved or Closed) */}
          {['Resolved', 'Closed'].includes(complaint.status) && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={20} color="#f59e0b" fill="#f59e0b" /> Service Feedback
              </h3>

              {feedback ? (
                <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={18}
                        color={s <= feedback.rating ? '#f59e0b' : '#cbd5e1'}
                        fill={s <= feedback.rating ? '#f59e0b' : 'none'}
                      />
                    ))}
                    <span style={{ marginLeft: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                      {feedback.rating} / 5 Stars
                    </span>
                  </div>
                  {feedback.comment && (
                    <p style={{ fontSize: '0.9rem', color: '#b45309', margin: 0 }}>"{feedback.comment}"</p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Rate Resolution Quality *</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <Star
                            size={28}
                            color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                            fill={star <= rating ? '#f59e0b' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Comments / Remarks (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Technician arrived on time and resolved quickly."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm" disabled={actionLoading}>
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Activity Timeline */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Complaint Timeline & History
            </h3>
            <Timeline updates={timeline} />
          </div>
        </div>

        {/* Right Column: Meta Info Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--slate-700)' }}>
              Assigned Department & Staff
            </h4>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Department</span>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <Building size={16} color="var(--primary-600)" />
                {complaint.department_name || 'Pending Assignment'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Staff Assigned</span>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <UserCheck size={16} color="var(--primary-600)" />
                {complaint.assigned_staff_name || 'Not yet assigned'}
              </div>
              {complaint.assigned_staff_role && (
                <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  ({complaint.assigned_staff_role})
                </span>
              )}
            </div>
          </div>

          <div className="card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--slate-700)' }}>
              Submission Meta
            </h4>

            <div style={{ marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Created Date</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                <Calendar size={14} color="var(--slate-400)" />
                {new Date(complaint.created_at).toLocaleString()}
              </div>
            </div>

            {complaint.resolved_at && (
              <div style={{ marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Resolved Date</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                  <CheckCircle size={14} />
                  {new Date(complaint.resolved_at).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
