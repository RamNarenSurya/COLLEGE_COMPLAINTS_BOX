import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { PlusCircle, FileText, Clock, Wrench, CheckCircle2, Archive, ArrowRight } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ stats: null, complaints: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getMyComplaints();
        setData({ stats: res.stats, complaints: res.complaints || [] });
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading student dashboard...</div>;
  }

  const { stats, complaints } = data;
  const recentComplaints = complaints.slice(0, 5);

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-700), var(--primary-900))',
        color: 'white',
        padding: '2rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 10px 25px rgba(30, 58, 138, 0.2)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'white', fontWeight: 800, marginBottom: '0.25rem' }}>
            Welcome back, {user.name}!
          </h1>
          <p style={{ color: 'var(--primary-100)', fontSize: '0.95rem', margin: 0 }}>
            Student ID: {user.student_id || 'STU'} • {user.department_name || 'Academic Dept'}
          </p>
        </div>

        <Link to="/student/complaints/new" className="btn btn-primary" style={{ background: 'white', color: 'var(--primary-800)', border: 'none' }}>
          <PlusCircle size={18} /> Report New Issue
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid">
        <StatCard title="Total Complaints" value={stats?.total || 0} icon={FileText} color="var(--primary-600)" bg="var(--primary-50)" />
        <StatCard title="Submitted / Review" value={(stats?.submitted || 0) + (stats?.underReview || 0)} icon={Clock} color="#d97706" bg="#fef3c7" />
        <StatCard title="In Progress" value={(stats?.assigned || 0) + (stats?.inProgress || 0)} icon={Wrench} color="#0284c7" bg="#e0f2fe" />
        <StatCard title="Resolved" value={stats?.resolved || 0} icon={CheckCircle2} color="#059669" bg="#ecfdf5" />
        <StatCard title="Closed" value={stats?.closed || 0} icon={Archive} color="#475569" bg="#f1f5f9" />
      </div>

      {/* Recent Complaints Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Complaints</h2>
          <Link to="/student/complaints" style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View All ({complaints.length}) <ArrowRight size={16} />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-500)' }}>
            <FileText size={42} color="var(--slate-300)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: 600 }}>No complaints submitted yet.</p>
            <Link to="/student/complaints/new" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
              Report First Issue
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title & Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((c) => (
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
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Link to={`/student/complaints/${c.id}`} className="btn btn-secondary btn-sm">
                        View Details
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
