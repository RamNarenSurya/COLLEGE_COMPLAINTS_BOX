import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { 
  ShieldCheck, 
  User, 
  Clock, 
  Monitor, 
  RefreshCw, 
  Search, 
  Users, 
  Shield, 
  Calendar,
  ListFilter,
  Eye,
  X,
  Building,
  CheckCircle,
  Database,
  Cloud,
  Server,
  Copy,
  AlertCircle
} from 'lucide-react';

export default function AdminLoginHistory() {
  const [logs, setLogs] = useState([]);
  const [userCountMap, setUserCountMap] = useState({});
  const [allUsersDirectory, setAllUsersDirectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // View state
  const [viewMode, setViewMode] = useState('directory'); // 'directory', 'logs', 'clouddb'
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Student Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentLogs, setStudentLogs] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Cloud DB Integration State (Neon.tech & Supabase)
  const [cloudStatus, setCloudStatus] = useState(null);
  const [cloudProvider, setCloudProvider] = useState('supabase'); // 'supabase' or 'neon'
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [neonUrlInput, setNeonUrlInput] = useState('');
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudMsg, setCloudMsg] = useState('');
  const [cloudError, setCloudError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLoginHistory();
      setLogs(data.logs || []);
      setUserCountMap(data.userCountMap || {});
      setAllUsersDirectory(data.allUsersDirectory || []);

      const cloudRes = await api.getCloudDbStatus();
      setCloudStatus(cloudRes);
      if (cloudRes.supabaseUrl) setSupabaseUrlInput(cloudRes.supabaseUrl);
      if (cloudRes.neonUrl) setNeonUrlInput(cloudRes.neonUrl);
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

  const handleTestCloudDb = async () => {
    setCloudLoading(true);
    setCloudMsg('');
    setCloudError('');
    try {
      const res = await api.testCloudDbConnection({
        provider: cloudProvider,
        supabaseUrl: supabaseUrlInput,
        supabaseKey: supabaseKeyInput,
        connectionUrl: neonUrlInput
      });
      setCloudMsg(res.message);
    } catch (err) {
      setCloudError(err.message || 'Connection test failed.');
    } finally {
      setCloudLoading(false);
    }
  };

  const handleSyncCloudDb = async () => {
    setCloudLoading(true);
    setCloudMsg('');
    setCloudError('');
    try {
      const res = await api.syncCloudDb({
        provider: cloudProvider,
        supabaseUrl: supabaseUrlInput,
        supabaseKey: supabaseKeyInput,
        connectionUrl: neonUrlInput
      });
      setCloudMsg(res.message);
    } catch (err) {
      setCloudError(err.message || 'Sync to cloud database failed.');
    } finally {
      setCloudLoading(false);
    }
  };

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

  // Filtered Activity Logs
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

  const totalRegisteredStudents = allUsersDirectory.filter(u => u.role === 'student').length;
  const totalLogsCount = logs.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = logs.filter(l => l.created_at && l.created_at.startsWith(todayStr)).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={26} color="var(--primary-600)" /> Student & User Login Audit History
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Full access trail of all students and admins with login frequency, last active timestamps, and Cloud DB sync (Neon / Supabase)
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
        <StatCard title="Registered Students" value={totalRegisteredStudents} icon={Users} color="var(--primary-600)" bg="var(--primary-50)" />
        <StatCard title="Total Login Logs" value={totalLogsCount} icon={Shield} color="#0284c7" bg="#e0f2fe" />
        <StatCard title="Today's Logins" value={todayCount} icon={Calendar} color="#d97706" bg="#fef3c7" />
        <StatCard title="Total Accounts" value={allUsersDirectory.length} icon={User} color="#10b981" bg="#ecfdf5" />
      </div>

      {/* View Switcher & Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className={`btn ${viewMode === 'directory' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('directory')}
          >
            <Users size={16} /> Student Login Summary Directory
          </button>
          <button
            className={`btn ${viewMode === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('logs')}
          >
            <ListFilter size={16} /> All Chronological Logs Stream
          </button>
          <button
            className={`btn ${viewMode === 'clouddb' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('clouddb')}
          >
            <Cloud size={16} /> Cloud DB Sync (Neon & Supabase)
          </button>
        </div>

        {viewMode !== 'clouddb' && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{ width: '150px', height: '38px', fontSize: '0.85rem' }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students Only</option>
              <option value="admin">Admins Only</option>
            </select>

            <div style={{ position: 'relative', minWidth: '220px' }}>
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
        )}
      </div>

      {/* MODE 1: Student Login Summary Directory */}
      {viewMode === 'directory' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              Loading student login directory...
            </div>
          ) : filteredDirectory.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              No students found matching your search.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name & Roll ID</th>
                    <th>Email & Contact</th>
                    <th>Department & Year</th>
                    <th>Role</th>
                    <th>Total Logins</th>
                    <th>Last Active Login</th>
                    <th>Full Audit Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDirectory.map((u, index) => (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--slate-400)', fontWeight: 600 }}>{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <User size={15} color={u.role === 'admin' ? '#dc2626' : 'var(--primary-600)'} />
                          {u.name}
                        </div>
                        {u.student_id ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 700, fontFamily: 'monospace' }}>
                            Roll ID: {u.student_id}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>Admin Account</span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.88rem', color: 'var(--slate-700)' }}>{u.email}</div>
                        {u.phone && <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>📞 {u.phone}</div>}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.department_name || 'Academic Dept'}</div>
                        {u.year && <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Year {u.year}</div>}
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-status-submitted'}`}>
                          {u.role.toUpperCase()}
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
                            <Clock size={13} style={{ verticalAlign: 'middle', marginRight: '3px', color: 'var(--primary-600)' }} />
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
                          title="Click to view complete login audit history of this student"
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
      )}

      {/* MODE 2: Chronological Logs Feed */}
      {viewMode === 'logs' && (
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
                    <th>Exact Login Time</th>
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
                          <span className="badge badge-status-assigned">
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
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: Cloud Database Sync (Neon.tech & Supabase Integration) */}
      {viewMode === 'clouddb' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={22} color="var(--primary-600)" /> Cloud Database Integration (Neon.tech & Supabase)
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', margin: 0 }}>
              Connect and sync local SQLite login audit history to cloud databases (Neon PostgreSQL at neon.tech or Supabase cloud DB).
            </p>
          </div>

          {cloudMsg && (
            <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} /> {cloudMsg}
            </div>
          )}

          {cloudError && (
            <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} /> {cloudError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Form Column */}
            <div className="card">
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Cloud DB Connection Config
              </h4>

              <div className="form-group">
                <label className="form-label">Select Cloud DB Provider</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className={`btn ${cloudProvider === 'supabase' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setCloudProvider('supabase')}
                  >
                    ⚡ Supabase (supabase.com)
                  </button>
                  <button
                    className={`btn ${cloudProvider === 'neon' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setCloudProvider('neon')}
                  >
                    🐘 Neon Tech (neon.tech)
                  </button>
                </div>
              </div>

              {cloudProvider === 'supabase' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Supabase Project URL *</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="e.g. https://xyz123.supabase.co"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Supabase API Key / Service Key *</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="e.g. eyJhbGciOi..."
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label className="form-label">Neon PostgreSQL Connection String / HTTP SQL Endpoint *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. postgresql://user:pass@ep-xyz.neon.tech/neondb or https://ep-xyz.neon.tech/sql"
                    value={neonUrlInput}
                    onChange={(e) => setNeonUrlInput(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button onClick={handleTestCloudDb} className="btn btn-secondary" disabled={cloudLoading} style={{ flex: 1 }}>
                  <Server size={16} /> Test Connection
                </button>
                <button onClick={handleSyncCloudDb} className="btn btn-primary" disabled={cloudLoading} style={{ flex: 1 }}>
                  <Cloud size={16} /> Sync Login History
                </button>
              </div>
            </div>

            {/* Schema Column */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  PostgreSQL DDL Schema Script
                </h4>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(cloudStatus?.pgSchema || '');
                    alert('PostgreSQL SQL Schema copied to clipboard!');
                  }}
                >
                  <Copy size={14} /> Copy SQL
                </button>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
                Run this SQL query inside your Supabase SQL Editor or Neon Console to create the <code style={{ color: 'var(--primary-600)' }}>login_logs</code> table:
              </p>

              <pre style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                overflowX: 'auto',
                lineHeight: 1.5,
                fontFamily: 'monospace'
              }}>
                {cloudStatus?.pgSchema || `-- Run in Neon / Supabase SQL Editor
CREATE TABLE IF NOT EXISTS login_logs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    ip_address VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
              </pre>
            </div>
          </div>
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
                  {selectedStudent.student_id ? `Roll ID: ${selectedStudent.student_id} | ` : ''}{selectedStudent.email} | {selectedStudent.department_name || 'Department'}
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
                    📊 Total Logins Recorded for {selectedStudent.name}: <strong style={{ color: 'var(--primary-600)' }}>{studentLogs.length} Logins</strong>
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
