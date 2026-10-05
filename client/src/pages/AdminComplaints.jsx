import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { Search, Filter, RefreshCw, Eye } from 'lucide-react';

export default function AdminComplaints() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [departmentId, setDepartmentId] = useState(searchParams.get('department_id') || 'All');

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    fetchAdminComplaints();
  }, [search, status, priority, category, departmentId]);

  async function loadDepartments() {
    try {
      const data = await api.getDepartments(true);
      setDepartments(data.departments || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  }

  async function fetchAdminComplaints() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status !== 'All') params.status = status;
      if (priority !== 'All') params.priority = priority;
      if (category !== 'All') params.category = category;
      if (departmentId !== 'All') params.department_id = departmentId;

      const res = await api.getAdminComplaints(params);
      setComplaints(res.complaints || []);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  }

  const resetFilters = () => {
    setSearch('');
    setStatus('All');
    setPriority('All');
    setCategory('All');
    setDepartmentId('All');
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Complaint Management</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Search, filter, assign departments/staff, and resolve complaints</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        {/* Search */}
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={18} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search Ticket ID, title, student name, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="filter-group">
          <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Priority */}
        <div className="filter-group">
          <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Department */}
        <div className="filter-group">
          <select className="form-control" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <button onClick={resetFilters} className="btn btn-secondary btn-sm" title="Reset Filters">
          <RefreshCw size={16} /> Reset
        </button>
      </div>

      {/* Complaints Master Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading complaints list...</div>
        ) : complaints.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            No complaints found matching the active filter criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Student Info</th>
                  <th>Title & Location</th>
                  <th>Category</th>
                  <th>Department / Staff</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-700)' }}>
                        {c.complaint_number}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{c.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{c.student_code}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{c.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>📍 {c.location}</div>
                    </td>
                    <td>{c.category}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {c.department_name || <span style={{ color: '#d97706' }}>Unassigned</span>}
                      </div>
                      {c.assigned_staff_name && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          👤 {c.assigned_staff_name}
                        </div>
                      )}
                    </td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      <Link to={`/admin/complaints/${c.id}`} className="btn btn-primary btn-sm">
                        <Eye size={14} /> Review & Action
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
