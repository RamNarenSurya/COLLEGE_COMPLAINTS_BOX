import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { 
  FileText, 
  Clock, 
  Eye, 
  UserCheck, 
  Wrench, 
  CheckCircle2, 
  Archive, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Star
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminDashboard() {
      try {
        const statsData = await api.getStatistics();
        setStats(statsData);

        const complaintsData = await api.getAdminComplaints({ limit: 5 });
        setRecentComplaints(complaintsData.complaints || []);
      } catch (err) {
        console.error('Admin dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminDashboard();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading administrator dashboard...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Admin System Dashboard</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Central governance and real-time complaint oversight</p>
        </div>
        <Link to="/admin/complaints" className="btn btn-primary">
          Manage All Complaints
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="stat-grid">
        <StatCard title="Total Received" value={stats?.total || 0} icon={FileText} color="var(--primary-600)" bg="var(--primary-50)" />
        <StatCard title="Pending Action" value={stats?.pending || 0} icon={Clock} color="#d97706" bg="#fef3c7" />
        <StatCard title="In Progress" value={stats?.inProgress || 0} icon={Wrench} color="#0284c7" bg="#e0f2fe" />
        <StatCard title="Resolved" value={stats?.resolved || 0} icon={CheckCircle2} color="#059669" bg="#ecfdf5" />
        <StatCard title="Critical Priority" value={stats?.critical || 0} icon={AlertTriangle} color="#be123c" bg="#ffe4e6" />
        <StatCard title="Avg Satisfaction" value={stats?.avgRating ? `${stats.avgRating} / 5 ⭐` : 'N/A'} icon={Star} color="#b45309" bg="#fffbeb" />
      </div>

      {/* Quick Action Alerts */}
      {stats?.critical > 0 && (
        <div style={{
          background: '#ffe4e6',
          border: '1px solid #fecdd3',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#9f1239'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={22} />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>{stats.critical} Critical Complaints Require Attention!</strong>
              <div style={{ fontSize: '0.85rem' }}>Filter tickets by Critical priority to assign technicians immediately.</div>
            </div>
          </div>
          <Link to="/admin/complaints?priority=Critical" className="btn btn-danger btn-sm">
            View Critical Tickets
          </Link>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Submissions & Assignments</h2>
          <Link to="/admin/complaints" style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View Master List <ArrowRight size={16} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Student</th>
                <th>Title & Category</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.slice(0, 5).map((c) => (
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
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{c.category} • 📍 {c.location}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.department_name || 'Unassigned'}</span>
                  </td>
                  <td><PriorityBadge priority={c.priority} /></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    <Link to={`/admin/complaints/${c.id}`} className="btn btn-secondary btn-sm">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
