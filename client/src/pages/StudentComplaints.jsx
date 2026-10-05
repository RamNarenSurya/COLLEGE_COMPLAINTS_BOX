import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { Search, PlusCircle, Filter } from 'lucide-react';

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getMyComplaints();
        setComplaints(res.complaints || []);
      } catch (err) {
        console.error('Fetch complaints error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Track status and updates of your submitted tickets</p>
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
                  <th>Action</th>
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
                      <Link to={`/student/complaints/${c.id}`} className="btn btn-secondary btn-sm">
                        View Ticket
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
