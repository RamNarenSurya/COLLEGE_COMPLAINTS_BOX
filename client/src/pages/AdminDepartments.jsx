import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Building2, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state for creation / editing
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    try {
      const res = await api.getDepartments(true);
      setDepartments(res.departments || []);
    } catch (err) {
      console.error('Load departments error:', err);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditId(null);
    setName('');
    setDescription('');
    setStatus('Active');
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditId(dept.id);
    setName(dept.name);
    setDescription(dept.description || '');
    setStatus(dept.status);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editId) {
        await api.updateDepartment(editId, { name, description, status });
      } else {
        await api.createDepartment({ name, description });
      }
      setShowModal(false);
      await loadDepartments();
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.deleteDepartment(id);
      await loadDepartments();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading departments roster...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Department Management</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Configure campus departments handling ticket resolutions</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> Add New Department
        </button>
      </div>

      {/* Departments Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Description</th>
                <th>Staff Count</th>
                <th>Total Complaints</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={18} color="var(--primary-600)" />
                      {d.name}
                    </div>
                  </td>
                  <td style={{ color: 'var(--slate-600)', fontSize: '0.88rem' }}>
                    {d.description || 'No description provided.'}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{d.staff_count || 0} Staff</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{d.complaint_count || 0} Complaints</span>
                  </td>
                  <td>
                    <span className={`badge ${d.status === 'Active' ? 'badge-status-resolved' : 'badge-status-closed'}`}>
                      {d.status === 'Active' ? <CheckCircle size={14} /> : <XCircle size={14} />} {d.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditModal(d)} className="btn btn-secondary btn-sm">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="btn btn-danger btn-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '480px', maxWidth: '92vw', background: 'white' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              {editId ? 'Edit Department' : 'Create New Department'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Electrical Department"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Responsibilities & coverage..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {editId && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {editId ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
