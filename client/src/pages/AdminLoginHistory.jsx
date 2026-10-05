import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldCheck, User, Clock, Monitor, RefreshCw, KeyRound } from 'lucide-react';

export default function AdminLoginHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLoginHistory();
      setLogs(data.logs || []);
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
    if (filterRole === 'all') return true;
    return log.role === filterRole;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Login History & Audit Log</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Real-time track of user authentications, timestamps, IP addresses, and device usage
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

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-600)' }}>Filter by Role:</span>
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
          Students Only ({logs.filter(l => l.role === 'student').length})
        </button>
        <button
          className={`btn ${filterRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
          onClick={() => setFilterRole('admin')}
        >
          Admins Only ({logs.filter(l => l.role === 'admin').length})
        </button>
      </div>

      {/* Logs Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            Loading audit logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            No login history recorded yet. Log in to generate records.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--slate-100)', borderBottom: '1px solid var(--slate-200)', color: 'var(--slate-600)' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>#</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>User Name</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>Email Address</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>Role</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>IP Address</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>Device / Browser</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>Login Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--slate-400)' }}>{index + 1}</td>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} color="var(--primary-600)" />
                        {log.user_name}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--slate-600)' }}>{log.email}</td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <span className={`badge ${log.role === 'admin' ? 'badge-danger' : 'badge-info'}`}>
                        {log.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.82rem', color: 'var(--slate-500)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.user_agent}>
                      <Monitor size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {log.user_agent}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--slate-600)', fontSize: '0.85rem' }}>
                      <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {new Date(log.created_at).toLocaleString()}
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
