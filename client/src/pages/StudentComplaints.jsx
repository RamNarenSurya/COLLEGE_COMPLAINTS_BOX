import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { Search, PlusCircle, Filter, Edit, Eye, Save, X, Paperclip } from 'lucide-react';

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Edit Issue State
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.getMyComplaints();
      setComplaints(res.complaints || []);
    } catch (err) {
      console.error('Fetch complaints error:', err);
    } finally {
      setLoading(false);
    }
  }

  const openEditModal = (c) => {
    setEditingComplaint(c);
    setEditTitle(c.title || '');
    setEditCategory(c.category || '');
    setEditDescription(c.description || '');
    setEditLocation(c.location || '');
    setEditPriority(c.priority || 'Medium');
    setEditFile(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingComplaint) return;
    setEditLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('category', editCategory);
      formData.append('description', editDescription);
      formData.append('location', editLocation);
      formData.append('priority', editPriority);
      if (editFile) {
        formData.append('attachment', editFile);
      }

      await api.editComplaint(editingComplaint.id, formData);
      alert('Issue details updated and re-submitted successfully!');
      setEditingComplaint(null);
      await loadData();
    } catch (err) {
      alert('Failed to edit complaint: ' + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.complaint_number.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(complaints.map(c => c.category)));

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading complaints...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Complaints</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Track, edit, and manage status updates for your submitted tickets</p>
        </div>
        <Link to="/student/complaints/new" className="btn btn-primary">
          <PlusCircle size={18} /> Report New Issue
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={18} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by ID, title, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} color="var(--slate-500)" />
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-500)' }}>
            <p style={{ fontWeight: 600 }}>No complaints found matching filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Title & Location</th>
                  <th>Category</th>
                  <th>Department / Staff</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-700)' }}>
                        {c.complaint_number}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{c.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>📍 {c.location}</div>
                    </td>
                    <td>{c.category}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {c.department_name || 'Unassigned'}
                      </div>
                      {c.assigned_staff_name && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          👤 {c.assigned_staff_name}
                        </div>
                      )}
                    </td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <Link to={`/student/complaints/${c.id}`} className="btn btn-secondary btn-sm">
                          <Eye size={14} /> View
                        </Link>
                        {c.status !== 'Closed' && (
                          <button
                            onClick={() => openEditModal(c)}
                            className="btn btn-primary btn-sm"
                            title="Edit and Re-submit Issue"
                          >
                            <Edit size={14} /> Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Issue Modal */}
      {editingComplaint && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '560px', maxWidth: '92vw', background: 'var(--bg-card)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Edit Issue: #{editingComplaint.complaint_number}
              </h3>
              <button
                type="button"
                onClick={() => setEditingComplaint(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Complaint Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-control"
                    value={editCategory}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    required
                  >
                    <option value="IT & Network">IT & Network</option>
                    <option value="Electrical & Lighting">Electrical & Lighting</option>
                    <option value="Maintenance & Repair">Maintenance & Repair</option>
                    <option value="Hostel & Mess">Hostel & Mess</option>
                    <option value="Cleanliness & Hygiene">Cleanliness & Hygiene</option>
                    <option value="Transport & Parking">Transport & Parking</option>
                    <option value="Security & Safety">Security & Safety</option>
                    <option value="Academic & Admin">Academic & Admin</option>
                    <option value="Other Campus Issue">Other Campus Issue</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Urgency / Priority *</label>
                  <select
                    className="form-control"
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Building / Room *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Lab 3, Block B, 2nd Floor"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Attach New Photo/Document (Optional)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setEditFile(e.target.files[0] || null)}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingComplaint(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  <Save size={16} /> Save & Re-submit Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
