import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { 
  ShieldCheck, 
  User, 
  Clock, 
  RefreshCw, 
  Search, 
  Users, 
  Shield, 
  Calendar,
  Eye,
  X,
  Filter
} from 'lucide-react';

export default function AdminLoginHistory() {
  const [logs, setLogs] = useState([]);
  const [allUsersDirectory, setAllUsersDirectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Role filter & Search query
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'student', 'admin'
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Student Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentLogs, setStudentLogs] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLoginHistory();
      setLogs(data.logs || []);
      setAllUsersDirectory(data.allUsersDirectory || []);
    } catch (err) {
      setError('Failed to load login audit history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const openStudentHistory = async (userObj) => {
    setSelectedStudent(userObj);
    setModalLoading(true);
    try {
      const res = await api.getStudentFullLoginHistory(userObj.id);
      setStudentLogs(res.logs || []);
    } catch (err) {
      alert('Failed to fetch user history: ' + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Counts by role
  const totalStudentsCount = allUsersDirectory.filter(u => u.role === 'student').length;
  const totalAdminsCount = allUsersDirectory.filter(u => u.role === 'admin').length;
  const totalLogsCount = logs.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = logs.filter(l => l.created_at && l.created_at.startsWith(todayStr)).length;

  // Filtered Directory
  const filteredDirectory = allUsersDirectory.filter((u) => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.student_id && u.student_id.toLowerCase().includes(q)) ||
      (u.department_name && u.department_name.toLowerCase().includes(q));

    return matchesRole && matchesSearch;
  });

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={26} color="var(--primary-600)" /> Student & User Login Audit History
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Full access directory of all registered students and system admins with login frequency and timestamps
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchLogs} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Data
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard title="Registered Students" value={totalStudentsCount} icon={Users} color="var(--primary-600)" bg="var(--primary-50)" />
        <StatCard title="System Administrators" value={totalAdminsCount} icon={Shield} color="#dc2626" bg="#fef2f2" />
        <StatCard title="Total Login Activity" value={totalLogsCount} icon={Calendar} color="#0284c7" bg="#e0f2fe" />
        <StatCard title="Today's Active Logins" value={todayCount} icon={Clock} color="#d97706" bg="#fef3c7" />
      </div>

      {/* Role Filters & Search Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {/* Role Filter Tabs (Clearly Visible) */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-600)', marginRight: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Filter size={15} /> Filter Role:
          </span>

          <button
            className={`btn ${filterRole === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
            onClick={() => setFilterRole('all')}
          >
            All Roles ({allUsersDirectory.length})
          </button>

          <button
            className={`btn ${filterRole === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
            onClick={() => setFilterRole('student')}
          >
            🎓 Students ({totalStudentsCount})
          </button>

          <button
            className={`btn ${filterRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
            onClick={() => setFilterRole('admin')}
          >
            🛡️ Administrators ({totalAdminsCount})
          </button>
        </div>

        {/* Search Input Box */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search student, email, Roll ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Directory Table View */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            Loading login directory...
          </div>
        ) : filteredDirectory.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            No accounts found matching your role filter or search.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User Name & Roll ID</th>
                  <th>Email & Contact</th>
                  <th>Department & Year</th>
                  <th>System Role</th>
                  <th>Total Logins</th>
                  <th>Last Active Login</th>
                  <th>Audit Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDirectory.map((u, index) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--slate-400)', fontWeight: 600 }}>{index + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <User size={16} color={u.role === 'admin' ? '#dc2626' : 'var(--primary-600)'} />
                        {u.name}
                      </div>
                      {u.student_id ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 700, fontFamily: 'monospace' }}>
                          Roll ID: {u.student_id}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>System Administrator</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.88rem', color: 'var(--slate-700)', fontWeight: 600 }}>{u.email}</div>
                      {u.phone && <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>📞 {u.phone}</div>}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.department_name || 'Academic Dept'}</div>
                      {u.year && <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Year {u.year}</div>}
                    </td>
                    <td>
                      {/* Clearly Visible Role Badges */}
                      <span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-status-submitted'}`} style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem' }}>
                        {u.role === 'admin' ? '🛡️ ADMIN' : '🎓 STUDENT'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.total_logins > 0 ? 'badge-status-assigned' : 'badge-status-closed'}`}>
                        {u.total_logins} Login{u.total_logins !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--slate-700)', fontWeight: 600 }}>
                      {u.last_login ? (
                        <>
                          <Clock size={13} style={{ verticalAlign: 'middle', marginRight: '4px', color: 'var(--primary-600)' }} />
                          {new Date(u.last_login).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                          })}
                        </>
                      ) : (
                        <span style={{ color: 'var(--slate-400)' }}>No logins recorded</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => openStudentHistory(u)}
                        className="btn btn-secondary btn-sm"
                        title="Click to view complete login audit history"
                      >
                        <Eye size={14} /> Full History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STUDENT FULL HISTORY MODAL */}
      {selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            {/* Modal Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="var(--primary-600)" /> Complete Login Audit History: {selectedStudent.name}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  {selectedStudent.student_id ? `Roll ID: ${selectedStudent.student_id} | ` : ''}{selectedStudent.email} | Role: {selectedStudent.role.toUpperCase()}
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.5rem' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              {modalLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading user history logs...</div>
              ) : studentLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                  No recorded login history for this user.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '1rem', background: 'var(--info-box-bg)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--info-box-border)', fontSize: '0.85rem', fontWeight: 600 }}>
                    📊 Total Logins Recorded: <strong style={{ color: 'var(--primary-600)' }}>{studentLogs.length} Logins</strong>
                  </div>

                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Login Date & Time</th>
                        <th>IP Address</th>
                        <th>User Agent / Device</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentLogs.map((log, i) => (
                        <tr key={log.id || i}>
                          <td style={{ color: 'var(--slate-400)', fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                            <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px', color: 'var(--primary-600)' }} />
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.ip_address || '127.0.0.1'}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>{log.user_agent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedStudent(null)} className="btn btn-secondary btn-sm">
                Close Audit Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
