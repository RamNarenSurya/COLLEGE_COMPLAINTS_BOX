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
  Filter,
  UserPlus,
  History,
  FileEdit
} from 'lucide-react';

export default function AdminLoginHistory() {
  const [activeTab, setActiveTab] = useState('registration'); // 'registration', 'login', 'profile_history'
  const [logs, setLogs] = useState([]);
  const [registrationLogs, setRegistrationLogs] = useState([]);
  const [profileLogs, setProfileLogs] = useState([]);
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

      const regRes = await api.getRegistrationHistory().catch(() => ({ registrationLogs: [] }));
      setRegistrationLogs(regRes.registrationLogs || []);

      const profRes = await api.getProfileHistory().catch(() => ({ profileLogs: [] }));
      setProfileLogs(profRes.profileLogs || []);
    } catch (err) {
      console.error('Fetch logs error:', err);
      setError('Failed to load audit history.');
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

  // Filtered Registration Logs
  const filteredRegLogs = registrationLogs.filter((r) => {
    const matchesRole = filterRole === 'all' || r.role === filterRole;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (r.user_name && r.user_name.toLowerCase().includes(q)) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      (r.student_id && r.student_id.toLowerCase().includes(q)) ||
      (r.department_name && r.department_name.toLowerCase().includes(q));

    return matchesRole && matchesSearch;
  });

  // Filtered Profile History Logs
  const filteredProfileLogs = profileLogs.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return !q ||
      (p.old_name && p.old_name.toLowerCase().includes(q)) ||
      (p.new_name && p.new_name.toLowerCase().includes(q)) ||
      (p.old_email && p.old_email.toLowerCase().includes(q)) ||
      (p.new_email && p.new_email.toLowerCase().includes(q)) ||
      (p.change_summary && p.change_summary.toLowerCase().includes(q));
  });

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={26} color="var(--primary-600)" /> Student & User Audit Logs
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Permanent separate audit histories for Registration, Login Sessions, and Profile Updates
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
        <StatCard title="Registered Members" value={totalStudentsCount + totalAdminsCount} icon={Users} color="var(--primary-600)" bg="var(--primary-50)" />
        <StatCard title="Registration History Logs" value={registrationLogs.length || allUsersDirectory.length} icon={UserPlus} color="#10b981" bg="#ecfdf5" />
        <StatCard title="Total Login Activity" value={totalLogsCount} icon={Calendar} color="#0284c7" bg="#e0f2fe" />
        <StatCard title="Permanent Profile Edits" value={profileLogs.length} icon={FileEdit} color="#8b5cf6" bg="#f3e8ff" />
      </div>

      {/* Main Tab Bar */}
      <div className="card" style={{ padding: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'registration' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('registration')}
          style={{ flex: 1, minWidth: '220px' }}
        >
          <UserPlus size={16} /> 1. Registration History ({registrationLogs.length || allUsersDirectory.length})
        </button>

        <button
          className={`btn ${activeTab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('login')}
          style={{ flex: 1, minWidth: '220px' }}
        >
          <History size={16} /> 2. Login Audit History ({logs.length})
        </button>

        <button
          className={`btn ${activeTab === 'profile_history' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('profile_history')}
          style={{ flex: 1, minWidth: '220px' }}
        >
          <FileEdit size={16} /> 3. Profile Edits History ({profileLogs.length})
        </button>
      </div>

      {/* Role Filters & Search Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-600)', marginRight: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Filter size={15} /> Filter Role:
          </span>

          <button
            className={`btn ${filterRole === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
            onClick={() => setFilterRole('all')}
          >
            All Roles
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

        {/* Search Box */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search name, email, Roll ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* TAB 1: REGISTRATION HISTORY */}
      {activeTab === 'registration' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              Loading registration history...
            </div>
          ) : (registrationLogs.length > 0 ? filteredRegLogs : filteredDirectory).length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              No registration history logs match your filter criteria.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User Name & Roll ID</th>
                    <th>Registered Email</th>
                    <th>Department & Year</th>
                    <th>Role</th>
                    <th>Registration Timestamp</th>
                    <th>IP / User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {(registrationLogs.length > 0 ? filteredRegLogs : filteredDirectory).map((reg, index) => (
                    <tr key={reg.id || index}>
                      <td style={{ color: 'var(--slate-400)', fontWeight: 600 }}>{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <User size={16} color={reg.role === 'admin' ? '#dc2626' : 'var(--primary-600)'} />
                          {reg.user_name || reg.name}
                        </div>
                        {reg.student_id ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 700, fontFamily: 'monospace' }}>
                            Roll ID: {reg.student_id}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>System Administrator</span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.88rem', color: 'var(--slate-700)', fontWeight: 600 }}>{reg.email}</div>
                        {reg.phone && <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>📞 {reg.phone}</div>}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{reg.department_name || 'Academic Dept'}</div>
                        {reg.year && <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Year {reg.year}</div>}
                      </td>
                      <td>
                        <span className={`badge ${reg.role === 'admin' ? 'badge-danger' : 'badge-status-submitted'}`} style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem' }}>
                          {reg.role === 'admin' ? '🛡️ ADMIN' : '🎓 STUDENT'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--slate-800)', fontWeight: 700 }}>
                        <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#10b981' }} />
                        {new Date(reg.created_at || reg.registered_at).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--slate-700)' }}>
                          🌐 {reg.ip_address || '127.0.0.1'}
                        </div>
                        {reg.user_agent && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {reg.user_agent}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOGIN AUDIT HISTORY */}
      {activeTab === 'login' && (
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
                          <Eye size={14} /> Full Logins
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERMANENT PROFILE EDIT HISTORY */}
      {activeTab === 'profile_history' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filteredProfileLogs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              No profile update logs recorded yet. Previous account histories remain preserved.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User ID</th>
                    <th>Original Details</th>
                    <th>Updated Details</th>
                    <th>Changes Summary</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfileLogs.map((p, idx) => (
                    <tr key={p.id || idx}>
                      <td style={{ color: 'var(--slate-400)', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>User #{p.user_id}</td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{p.old_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{p.old_email}</div>
                        {p.old_phone && <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>📞 {p.old_phone}</div>}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{p.new_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--primary-600)' }}>{p.new_email}</div>
                        {p.new_phone && <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>📞 {p.new_phone}</div>}
                      </td>
                      <td>
                        <span style={{
                          background: 'var(--primary-50)',
                          color: 'var(--primary-700)',
                          border: '1px solid var(--primary-100)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          ✏️ {p.change_summary}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--slate-700)', fontWeight: 600 }}>
                        <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#8b5cf6' }} />
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
