import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { 
  Sun, 
  Moon, 
  User, 
  Lock, 
  Bell, 
  Save, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'appearance', 'security', 'notifications'

  // Profile Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [year, setYear] = useState('');
  const [departments, setDepartments] = useState([]);

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status messages
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Notification Preferences
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifStatus, setNotifStatus] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDepartmentId(user.department_id || '');
      setYear(user.year || '1');
    }
    loadDepartments();
  }, [user]);

  async function loadDepartments() {
    try {
      const res = await api.getDepartments(true);
      setDepartments(res.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateProfile({
        name,
        email,
        phone,
        department_id: departmentId ? parseInt(departmentId, 10) : null,
        year: year ? parseInt(year, 10) : 1
      });
      setSuccessMsg('Profile information updated successfully! You do not need to register again.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      await updateProfile({
        currentPassword,
        password: newPassword
      });
      setSuccessMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Account & Portal Settings</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
          Manage your personal profile, appearance theme modes, password security, and notifications
        </p>
      </div>

      {successMsg && (
        <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="card" style={{ padding: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        <button
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('profile'); setSuccessMsg(''); setErrorMsg(''); }}
          style={{ flex: 1, minWidth: '130px' }}
        >
          <User size={16} /> Edit Profile
        </button>

        <button
          className={`btn ${activeTab === 'appearance' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('appearance'); setSuccessMsg(''); setErrorMsg(''); }}
          style={{ flex: 1, minWidth: '130px' }}
        >
          <Sun size={16} /> Light / Dark Mode
        </button>

        <button
          className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('security'); setSuccessMsg(''); setErrorMsg(''); }}
          style={{ flex: 1, minWidth: '130px' }}
        >
          <Lock size={16} /> Password & Security
        </button>

        <button
          className={`btn ${activeTab === 'notifications' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('notifications'); setSuccessMsg(''); setErrorMsg(''); }}
          style={{ flex: 1, minWidth: '130px' }}
        >
          <Bell size={16} /> Preferences
        </button>
      </div>

      {/* TAB 1: Edit Profile */}
      {activeTab === 'profile' && (
        <div className="card">
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--slate-200)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Update Personal Information</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              Update your account details below. Any updates will be applied instantly without re-registering.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {user.role === 'student' && (
                <div className="form-group">
                  <label className="form-label">Student Roll ID (Immutable)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user.student_id || ''}
                    disabled
                    style={{ background: 'var(--slate-100)', cursor: 'not-allowed' }}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Mobile Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {user.role === 'student' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-control"
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Academic Year</label>
                    <select
                      className="form-control"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={16} /> Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Appearance & Light Mode Options */}
      {activeTab === 'appearance' && (
        <div className="card">
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--slate-200)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Theme & Appearance Settings</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              Choose your preferred visual theme mode for the campus portal.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Light Mode Card */}
            <div 
              onClick={() => setTheme('light')}
              style={{
                border: theme === 'light' ? '2px solid var(--primary-600)' : '1px solid var(--slate-300)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                cursor: 'pointer',
                background: '#ffffff',
                color: '#0f172a',
                boxShadow: theme === 'light' ? '0 4px 14px rgba(37, 99, 235, 0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                  <Sun size={22} color="#f59e0b" /> Light Mode
                </div>
                {theme === 'light' && <CheckCircle size={20} color="var(--primary-600)" />}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Clean, high-contrast bright interface suitable for well-lit classrooms and daytime usage.
              </p>
            </div>

            {/* Dark Mode Card */}
            <div 
              onClick={() => setTheme('dark')}
              style={{
                border: theme === 'dark' ? '2px solid var(--primary-600)' : '1px solid var(--slate-300)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                cursor: 'pointer',
                background: '#0f172a',
                color: '#f8fafc',
                boxShadow: theme === 'dark' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                  <Moon size={22} color="#38bdf8" /> Dark Mode
                </div>
                {theme === 'dark' && <CheckCircle size={20} color="var(--primary-500)" />}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Sleek dark interface designed to reduce eye strain in low-light environments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Password & Security */}
      {activeTab === 'security' && (
        <div className="card">
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--slate-200)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Change Account Password</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              Keep your complaint portal account secure by using a strong password.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Lock size={16} /> Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="card">
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--slate-200)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Notification Preferences</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              Customize alerts for complaint updates, status changes, and staff assignments.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--info-box-bg)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Email Notifications</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>Receive immediate email alerts when staff or admins update your ticket.</div>
              </div>
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--info-box-bg)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Status & Resolution Alerts</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>Show real-time notifications on ticket resolution and assignment.</div>
              </div>
              <input
                type="checkbox"
                checked={notifStatus}
                onChange={(e) => setNotifStatus(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
