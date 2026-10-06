import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  Building, 
  Search, 
  Grid, 
  List, 
  UserCheck, 
  ShieldCheck,
  Filter
} from 'lucide-react';

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Department Separation & Filters
  const [selectedDeptId, setSelectedDeptId] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' (department-wise) or 'table'

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

  const openCreateModal = (preselectedDeptId = null) => {
    setEditId(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('');
    setStatus('Active');
    if (preselectedDeptId && preselectedDeptId !== 'All') {
      setDepartmentId(preselectedDeptId);
    } else if (departments.length > 0) {
      setDepartmentId(departments[0].id);
    }
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

  // Filtered staff list
  const filteredStaff = staff.filter((s) => {
    const matchesDept = selectedDeptId === 'All' || String(s.department_id) === String(selectedDeptId);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.department_name && s.department_name.toLowerCase().includes(q));

    return matchesDept && matchesSearch;
  });

  // Group staff department-wise
  const staffByDepartment = {};
  departments.forEach(dept => {
    staffByDepartment[dept.id] = {
      department: dept,
      members: []
    };
  });
  // Include unassigned department key
  staffByDepartment['unassigned'] = {
    department: { id: 'unassigned', name: 'Unassigned Department', description: 'Staff members not yet linked to a department' },
    members: []
  };

  filteredStaff.forEach(s => {
    const dId = s.department_id || 'unassigned';
    if (!staffByDepartment[dId]) {
      staffByDepartment[dId] = {
        department: { id: dId, name: s.department_name || 'Department ' + dId },
        members: []
      };
    }
    staffByDepartment[dId].members.push(s);
  });

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading staff roster...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={26} color="var(--primary-600)" /> Department-Wise Staff Directory
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Organized department personnel directory for assigned campus issue resolution
          </p>
        </div>
        <button onClick={() => openCreateModal(selectedDeptId)} className="btn btn-primary">
          <Plus size={18} /> Add New Staff Member
        </button>
      </div>

      {/* Department Filter & Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '1rem' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className={`btn ${viewMode === 'grouped' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('grouped')}
            >
              <Grid size={16} /> Department Grouped View
            </button>
            <button
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
            >
              <List size={16} /> Master List Table
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search staff name, role, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Department Filter Tabs / Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--slate-200)' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-600)', marginRight: '0.25rem' }}>
            <Filter size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Select Department:
          </span>
          <button
            className={`btn ${selectedDeptId === 'All' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', borderRadius: '50px' }}
            onClick={() => setSelectedDeptId('All')}
          >
            All Departments ({staff.length})
          </button>
          {departments.map((d) => {
            const count = staff.filter(s => String(s.department_id) === String(d.id)).length;
            const isSelected = String(selectedDeptId) === String(d.id);
            return (
              <button
                key={d.id}
                className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', borderRadius: '50px' }}
                onClick={() => setSelectedDeptId(d.id)}
              >
                {d.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE A: Department-Wise Grouped View */}
      {viewMode === 'grouped' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.keys(staffByDepartment).map(deptKey => {
            const group = staffByDepartment[deptKey];
            // Don't show empty department groups if filtering or unassigned with 0 members
            if (group.members.length === 0 && (selectedDeptId !== 'All' || deptKey === 'unassigned')) {
              return null;
            }

            return (
              <div key={deptKey} className="card" style={{ padding: '1.25rem' }}>
                {/* Department Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--slate-200)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      background: 'var(--primary-50)',
                      color: 'var(--primary-600)',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Building size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                        {group.department.name}
                      </h3>
                      {group.department.description && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          {group.department.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge badge-status-assigned">
                      👥 {group.members.length} Staff Member{group.members.length !== 1 ? 's' : ''}
                    </span>
                    {deptKey !== 'unassigned' && (
                      <button
                        onClick={() => openCreateModal(group.department.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Plus size={14} /> Add Staff to Dept
                      </button>
                    )}
                  </div>
                </div>

                {/* Staff Cards Grid */}
                {group.members.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.88rem' }}>
                    No staff members assigned to this department yet. Click "+ Add Staff to Dept" above.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {group.members.map(s => (
                      <div
                        key={s.id}
                        style={{
                          background: 'var(--bg-main)',
                          border: '1px solid var(--slate-200)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>
                                {s.name}
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', display: 'inline-block', marginTop: '2px' }}>
                                💼 {s.role}
                              </span>
                            </div>
                            <span className={`badge ${s.status === 'Active' ? 'badge-status-resolved' : 'badge-status-closed'}`}>
                              {s.status}
                            </span>
                          </div>

                          <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: 'var(--slate-600)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Mail size={14} color="var(--slate-400)" /> {s.email}
                            </div>
                            {s.phone && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Phone size={14} color="var(--slate-400)" /> {s.phone}
                              </div>
                            )}
                            <div style={{ marginTop: '0.2rem' }}>
                              <span style={{
                                fontWeight: 700,
                                color: s.active_assignments > 0 ? 'var(--primary-700)' : 'var(--slate-500)',
                                background: s.active_assignments > 0 ? 'var(--primary-50)' : 'var(--slate-100)',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '50px',
                                fontSize: '0.75rem'
                              }}>
                                📋 {s.active_assignments || 0} Active Ticket Assignments
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-200)' }}>
                          <button onClick={() => openEditModal(s)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                            <Edit2 size={14} /> Edit
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE B: Master Staff Directory Table */}
      {viewMode === 'table' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filteredStaff.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              No staff members found matching your filter.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Staff Name & Position</th>
                    <th>Department</th>
                    <th>Contact Info</th>
                    <th>Active Tickets</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{s.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>{s.role}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary-700)' }}>
                          🏢 {s.department_name || 'Unassigned'}
                        </span>
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
          )}
        </div>
      )}

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
          <div className="card" style={{ width: '520px', maxWidth: '92vw', background: 'var(--bg-card)', maxHeight: '90vh', overflowY: 'auto' }}>
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
                    placeholder="e.g. Senior Electrician, Warden"
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
                  <label className="form-label">Assigned Department *</label>
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
