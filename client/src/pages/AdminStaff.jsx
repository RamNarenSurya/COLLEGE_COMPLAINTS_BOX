import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Plus, Edit2, Trash2, Mail, Phone, Building } from 'lucide-react';

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Active');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const staffRes = await api.getStaffList();
      setStaff(staffRes.staff || []);

      const deptRes = await api.getDepartments(true);
      setDepartments(deptRes.departments || []);
      if (deptRes.departments && deptRes.departments.length > 0) {
        setDepartmentId(deptRes.departments[0].id);
      }
    } catch (err) {
      console.error('Load staff error:', err);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditId(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('');
    setStatus('Active');
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditId(member.id);
    setName(member.name);
    setEmail(member.email);
    setPhone(member.phone || '');
    setDepartmentId(member.department_id);
    setRole(member.role);
    setStatus(member.status);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const payload = {
        name,
        email,
        phone,
        department_id: parseInt(departmentId, 10),
        role,
        status
      };

      if (editId) {
        await api.updateStaff(editId, payload);
      } else {
        await api.createStaff(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete staff profile?')) return;
    try {
      await api.deleteStaff(id);
      await loadData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading staff roster...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Staff Directory & Assignments</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Manage department personnel assigned to resolve campus complaints</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> Add New Staff Member
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Staff Name & Role</th>
                <th>Department</th>
                <th>Contact Email & Phone</th>
                <th>Active Tickets</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{s.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>{s.role}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.department_name}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Mail size={14} color="var(--slate-400)" /> {s.email}
                    </div>
                    {s.phone && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                        <Phone size={12} color="var(--slate-400)" /> {s.phone}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: s.active_assignments > 0 ? 'var(--primary-700)' : 'var(--slate-500)',
                      background: s.active_assignments > 0 ? 'var(--primary-50)' : 'var(--slate-100)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '50px',
                      fontSize: '0.82rem'
                    }}>
                      {s.active_assignments || 0} active
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.status === 'Active' ? 'badge-status-resolved' : 'badge-status-closed'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditModal(s)} className="btn btn-secondary btn-sm">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm">
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

      {/* Modal Form */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '520px', maxWidth: '92vw', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              {editId ? 'Edit Staff Profile' : 'Add Staff Member'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter staff full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role / Position *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter staff role / position"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter staff email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-control"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    required
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
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
                  {editId ? 'Save Changes' : 'Create Staff Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
