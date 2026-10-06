import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { ShieldCheck, User, Clock, Monitor, RefreshCw, Search, Users, Shield, Calendar } from 'lucide-react';

export default function AdminLoginHistory() {
  const [logs, setLogs] = useState([]);
  const [userCountMap, setUserCountMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLoginHistory();
      setLogs(data.logs || []);
      setUserCountMap(data.userCountMap || {});
    } catch (err) {
      setError('Failed to load login audit history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesRole = filterRole === 'all' || log.role === filterRole;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (log.user_name && log.user_name.toLowerCase().includes(q)) ||
      (log.email && log.email.toLowerCase().includes(q)) ||
      (log.student_id && log.student_id.toLowerCase().includes(q)) ||
      (log.ip_address && log.ip_address.includes(q));

    return matchesRole && matchesSearch;
  });

  const totalCount = logs.length;
  const studentCount = logs.filter(l => l.role === 'student').length;
  const adminCount = logs.filter(l => l.role === 'admin').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = logs.filter(l => l.created_at && l.created_at.startsWith(todayStr)).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={26} color="var(--primary-600)" /> Login Audit & User Access Logs
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Complete audit trail of all student and administrator login attempts, timestamps, and login frequency counts
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchLogs} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Logs
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard title="Total Recorded Logins" value={totalCount} icon={Users} color="var(--primary-600)" bg="var(--primary-50)" />
        <StatCard title="Student Logins" value={studentCount} icon={User} color="#0284c7" bg="#e0f2fe" />
        <StatCard title="Admin Logins" value={adminCount} icon={Shield} color="#dc2626" bg="#fef2f2" />
        <StatCard title="Today's Logins" value={todayCount} icon={Calendar} color="#d97706" bg="#fef3c7" />
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-600)', marginRight: '0.5rem' }}>Filter Role:</span>
          <button
            className={`btn ${filterRole === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            onClick={() => setFilterRole('all')}
          >
            All Logins ({logs.length})
          </button>
          <button
            className={`btn ${filterRole === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            onClick={() => setFilterRole('student')}
          >
            Students Only ({studentCount})
          </button>
          <button
            className={`btn ${filterRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            onClick={() => setFilterRole('admin')}
          >
            Admins Only ({adminCount})
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search student, email, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            Loading audit logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            No matching login logs found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User Name & ID</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Total User Logins</th>
                  <th>IP Address</th>
                  <th>Device / Browser</th>
                  <th>Exact Login Time & Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => {
                  const userTotal = userCountMap[log.user_id] || 1;
                  return (
                    <tr key={log.id || index}>
                      <td style={{ color: 'var(--slate-400)', fontWeight: 600 }}>{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <User size={15} color={log.role === 'admin' ? '#dc2626' : 'var(--primary-600)'} />
                          {log.user_name}
                        </div>
                        {log.student_id && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 700, fontFamily: 'monospace' }}>
                            ID: {log.student_id}
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--slate-600)', fontSize: '0.88rem' }}>{log.email}</td>
                      <td>
                        <span className={`badge ${log.role === 'admin' ? 'badge-danger' : 'badge-status-submitted'}`}>
                          {log.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-status-assigned" title={`This user has logged in ${userTotal} times`}>
                          {userTotal} Login{userTotal > 1 ? 's' : ''} Total
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                        {log.ip_address || '127.0.0.1'}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--slate-500)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.user_agent}>
                        <Monitor size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {log.user_agent}
                      </td>
                      <td style={{ color: 'var(--slate-700)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px', color: 'var(--primary-600)' }} />
                        {new Date(log.created_at).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
