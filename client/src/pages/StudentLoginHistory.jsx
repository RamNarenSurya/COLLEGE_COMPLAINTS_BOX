import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { History, Clock, Monitor, RefreshCw, UserCheck, ShieldCheck } from 'lucide-react';

export default function StudentLoginHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [totalLogins, setTotalLogins] = useState(0);
  const [todayLogins, setTodayLogins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getStudentLoginHistory();
      setLogs(res.logs || []);
      setTotalLogins(res.totalLogins || (res.logs ? res.logs.length : 0));
      setTodayLogins(res.todayLogins || 0);
    } catch (err) {
      setError('Failed to fetch login history.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={26} color="var(--primary-600)" /> Student Login History
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            View all past authentication sessions, exact timestamps, and login frequency details
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchHistory} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh History
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* KPI Cards Container */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard title="Total Logins (All Time)" value={totalLogins} icon={UserCheck} color="var(--primary-600)" bg="var(--primary-50)" />
        <StatCard title="Logins Today" value={todayLogins} icon={Clock} color="#d97706" bg="#fef3c7" />
        <StatCard title="Account Security Status" value="Verified" icon={ShieldCheck} color="#059669" bg="#ecfdf5" />
      </div>

      {/* Login Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--slate-200)', background: 'var(--slate-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--slate-800)' }}>
              Authentication Activity Logs
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Showing {logs.length} login event records for {user.name} ({user.student_id || user.email})
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            Loading login audit records...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            No login history recorded yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Login #</th>
                  <th>Date & Exact Time</th>
                  <th>IP Address</th>
                  <th>Browser & System Device</th>
                  <th>Session Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => {
                  const loginNum = logs.length - index;
                  const isLatest = index === 0;
                  return (
                    <tr key={log.id || index}>
                      <td>
                        <span className="badge" style={{ background: isLatest ? 'var(--primary-50)' : 'var(--slate-100)', color: isLatest ? 'var(--primary-700)' : 'var(--slate-600)', border: isLatest ? '1px solid var(--primary-100)' : '1px solid var(--slate-200)' }}>
                          Attempt #{loginNum}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: '0.9rem' }}>
                        <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '6px', color: 'var(--primary-600)' }} />
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
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                        {log.ip_address || '127.0.0.1'}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--slate-600)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.user_agent}>
                        <Monitor size={14} style={{ verticalAlign: 'middle', marginRight: '6px', color: 'var(--slate-400)' }} />
                        {log.user_agent}
                      </td>
                      <td>
                        {isLatest ? (
                          <span className="badge badge-status-resolved">Current Session</span>
                        ) : (
                          <span className="badge badge-status-closed">Success</span>
                        )}
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
