import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { BarChart3, PieChart, Star, TrendingUp, ShieldCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function AdminStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getStatistics();
        setStats(res);
      } catch (err) {
        console.error('Failed to load statistics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading system analytics...</div>;
  }

  if (!stats) return null;

  const resolutionRate = stats.total > 0 ? (((stats.resolved + stats.closed) / stats.total) * 100).toFixed(1) : 0;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={24} color="var(--primary-600)" /> Analytics & Performance Statistics
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Aggregate data, resolution velocity, category trends, and student rating feedback</p>
      </div>

      {/* Main KPI Grid */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <StatCard title="Total Tickets" value={stats.total} icon={BarChart3} color="var(--primary-600)" bg="var(--primary-50)" />
        <StatCard title="Resolution Rate" value={`${resolutionRate}%`} icon={TrendingUp} color="#059669" bg="#ecfdf5" />
        <StatCard title="Average Rating" value={`${stats.avgRating} / 5 ⭐`} icon={Star} color="#b45309" bg="#fffbeb" />
        <StatCard title="Critical Tickets" value={stats.critical} icon={AlertTriangle} color="#be123c" bg="#ffe4e6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Status Breakdown Bar */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
            Complaint Status Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { label: 'Submitted', count: stats.submitted, color: 'var(--primary-500)' },
              { label: 'Under Review', count: stats.underReview, color: '#d97706' },
              { label: 'Assigned', count: stats.assigned, color: '#6366f1' },
              { label: 'In Progress', count: stats.inProgress, color: '#0284c7' },
              { label: 'Resolved', count: stats.resolved, color: '#059669' },
              { label: 'Closed', count: stats.closed, color: '#64748b' }
            ].map((st, i) => {
              const pct = stats.total > 0 ? ((st.count / stats.total) * 100).toFixed(1) : 0;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                    <span>{st.label}</span>
                    <span>{st.count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '10px', background: 'var(--slate-100)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: st.color, transition: 'width 0.4s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Category */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
            Complaints by Category
          </h3>

          {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.categoryBreakdown.map((cat, i) => {
                const pct = stats.total > 0 ? ((cat.count / stats.total) * 100).toFixed(1) : 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{cat.category}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                      {cat.count} issues ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--slate-500)' }}>No category data yet.</p>
          )}
        </div>
      </div>

      {/* Department Distribution Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          Department Workload Distribution
        </h3>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Total Assigned Complaints</th>
                <th>Percentage Share</th>
              </tr>
            </thead>
            <tbody>
              {stats.departmentBreakdown && stats.departmentBreakdown.map((dept, i) => {
                const pct = stats.total > 0 ? ((dept.count / stats.total) * 100).toFixed(1) : 0;
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{dept.department}</td>
                    <td><span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{dept.count}</span></td>
                    <td>{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
