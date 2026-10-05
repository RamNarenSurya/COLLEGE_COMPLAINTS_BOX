import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Timeline from '../components/Timeline';
import { 
  ArrowLeft, 
  MapPin, 
  UserCheck, 
  Building, 
  FileText, 
  Download, 
  CheckCircle, 
  MessageSquare,
  Wrench,
  Shield,
  Star,
  Send
} from 'lucide-react';

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form controls
  const [statusVal, setStatusVal] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [deptVal, setDeptVal] = useState('');
  const [staffVal, setStaffVal] = useState('');
  const [priorityVal, setPriorityVal] = useState('');
  const [newComment, setNewComment] = useState('');

  // Resolution Modal Form
  const [resolutionDesc, setResolutionDesc] = useState('');
  const [resolvedBy, setResolvedBy] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const res = await api.getAdminComplaintDetail(id);
      setData(res);
      setStatusVal(res.complaint.status);
      setDeptVal(res.complaint.department_id || '');
      setStaffVal(res.complaint.assigned_staff_id || '');
      setPriorityVal(res.complaint.priority);

      const deptsRes = await api.getDepartments(true);
      setDepartments(deptsRes.departments || []);

      if (res.complaint.department_id) {
        loadStaffForDept(res.complaint.department_id);
      }
    } catch (err) {
      console.error('Failed to load detail:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStaffForDept(deptId) {
    if (!deptId) {
      setStaffList([]);
      return;
    }
    try {
      const res = await api.getStaffList({ department_id: deptId });
      setStaffList(res.staff || []);
    } catch (err) {
      console.error('Fetch staff list error:', err);
    }
  }

  const handleStatusChange = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.updateComplaintStatus(id, statusVal, statusComment);
      setStatusComment('');
      await loadData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeptAssign = async (e) => {
    e.preventDefault();
    if (!deptVal) return;
    setActionLoading(true);
    try {
      await api.assignDepartment(id, parseInt(deptVal, 10));
      await loadStaffForDept(deptVal);
      await loadData();
    } catch (err) {
      alert('Failed to assign department: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStaffAssign = async (e) => {
    e.preventDefault();
    if (!staffVal) return;
    setActionLoading(true);
    try {
      await api.assignStaff(id, parseInt(staffVal, 10));
      await loadData();
    } catch (err) {
      alert('Failed to assign staff: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityChange = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.updatePriority(id, priorityVal);
      await loadData();
    } catch (err) {
      alert('Failed to update priority: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setActionLoading(true);
    try {
      await api.addAdminComment(id, newComment);
      setNewComment('');
      await loadData();
    } catch (err) {
      alert('Failed to post comment: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddResolution = async (e) => {
    e.preventDefault();
    if (!resolutionDesc.trim()) return;
    setActionLoading(true);
    try {
      await api.addResolution(id, {
        description: resolutionDesc,
        resolved_by: resolvedBy
      });
      setResolutionDesc('');
      await loadData();
    } catch (err) {
      alert('Failed to save resolution: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading complaint action panel...</div>;
  }

  if (!data) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Complaint not found.</div>;
  }

  const { complaint, attachments, timeline, resolution, feedback } = data;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/complaints" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} /> Back to Master List
          </Link>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary-700)' }}>
              #{complaint.complaint_number}
            </span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.1rem 0 0 0' }}>{complaint.title}</h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Left Column: Complaint Details, Resolution Form & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Info Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
              Complaint Overview & Description
            </h3>

            <p style={{ whiteSpace: 'pre-line', fontSize: '0.95rem', color: 'var(--slate-700)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {complaint.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Submitted By Student</span>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{complaint.student_name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{complaint.student_code} ({complaint.student_email})</div>
              </div>
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
                  Submitted Files ({attachments.length})
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
                        <Download size={14} /> Open File
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resolution Form / Display */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} color="#059669" /> Resolution Details
            </h3>

            {resolution ? (
              <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 700 }}>
                  Resolved By: {resolution.resolved_by} on {new Date(resolution.resolved_at).toLocaleString()}
                </div>
                <p style={{ marginTop: '0.4rem', fontSize: '0.95rem', color: '#064e3b' }}>
                  {resolution.description}
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddResolution}>
                <div className="form-group">
                  <label className="form-label">Resolution Description *</label>
                  <textarea
                    className="form-control"
                    placeholder="Describe how the issue was fixed, components replaced, or actions taken..."
                    value={resolutionDesc}
                    onChange={(e) => setResolutionDesc(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Resolved By (Technician / Authority)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter technician name or authority details"
                    value={resolvedBy}
                    onChange={(e) => setResolvedBy(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-success" disabled={actionLoading}>
                  <CheckCircle size={16} /> Mark as Resolved & Record Solution
                </button>
              </form>
            )}
          </div>

          {/* Student Feedback (If available) */}
          {feedback && (
            <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#b45309' }}>
                Student Rating & Review
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={20}
                    color={s <= feedback.rating ? '#f59e0b' : '#cbd5e1'}
                    fill={s <= feedback.rating ? '#f59e0b' : 'none'}
                  />
                ))}
                <span style={{ marginLeft: '0.5rem', fontWeight: 800 }}>{feedback.rating} / 5 Stars</span>
              </div>
              {feedback.comment && <p style={{ fontSize: '0.9rem', color: '#92400e', margin: 0 }}>"{feedback.comment}"</p>}
            </div>
          )}

          {/* Add Administrative Comment */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="var(--primary-600)" /> Add Administrative Update
            </h3>

            <form onSubmit={handleAddComment}>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Post progress update or note visible to student..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={actionLoading}>
                <Send size={14} /> Post Update
              </button>
            </form>
          </div>

          {/* Activity Timeline */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Audit Timeline
            </h3>
            <Timeline updates={timeline} />
          </div>
        </div>

        {/* Right Column: Administrative Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Change Status Card */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              Update Complaint Status
            </h4>

            <form onSubmit={handleStatusChange}>
              <div className="form-group">
                <label className="form-label">Current Status</label>
                <select className="form-control" value={statusVal} onChange={(e) => setStatusVal(e.target.value)}>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status Change Reason / Log</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Under review by maintenance lead"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }} disabled={actionLoading}>
                Update Status
              </button>
            </form>
          </div>

          {/* Department Assignment */}
          <div className="card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building size={16} color="var(--primary-600)" /> Department Assignment
            </h4>

            <form onSubmit={handleDeptAssign}>
              <div className="form-group">
                <select className="form-control" value={deptVal} onChange={(e) => setDeptVal(e.target.value)}>
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }} disabled={actionLoading || !deptVal}>
                Assign Department
              </button>
            </form>
          </div>

          {/* Staff Assignment */}
          <div className="card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserCheck size={16} color="var(--primary-600)" /> Staff Member Assignment
            </h4>

            <form onSubmit={handleStaffAssign}>
              <div className="form-group">
                <select className="form-control" value={staffVal} onChange={(e) => setStaffVal(e.target.value)} disabled={staffList.length === 0}>
                  <option value="">{staffList.length > 0 ? 'Select Staff Member' : 'Select Dept First'}</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }} disabled={actionLoading || !staffVal}>
                Assign Staff
              </button>
            </form>
          </div>

          {/* Change Priority */}
          <div className="card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              Change Priority Level
            </h4>

            <form onSubmit={handlePriorityChange}>
              <div className="form-group">
                <select className="form-control" value={priorityVal} onChange={(e) => setPriorityVal(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }} disabled={actionLoading}>
                Set Priority Level
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
