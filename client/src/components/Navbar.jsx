import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, LayoutDashboard, Menu, Settings } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="app-navbar">
      <div className="navbar-container">
        {/* Left: Three Line Navbar Icon & 'C' Logo Icon Only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user && (
            <button className="navbar-menu-toggle" onClick={onToggleSidebar} aria-label="Toggle Sidebar Menu">
              <Menu size={22} />
            </button>
          )}

          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-900))',
              color: 'white',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              flexShrink: 0
            }}>
              C
            </div>
          </Link>
        </div>

        {/* Right: Navigation Actions & Profile Bar */}
        <div className="navbar-actions">
          {user ? (
            <>
              {user.role === 'student' ? (
                <>
                  <Link to="/student/dashboard" className="btn btn-secondary btn-sm nav-btn-hide-mobile">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/student/complaints/new" className="btn btn-primary btn-sm nav-btn-hide-mobile">
                    <PlusCircle size={16} /> <span className="report-issue-text">Report Issue</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/admin/dashboard" className="btn btn-secondary btn-sm nav-btn-hide-mobile">
                    <LayoutDashboard size={16} /> Admin Portal
                  </Link>
                </>
              )}

              {/* User Profile Bar with Settings Icon on the Left side of Profile */}
              <div className="user-profile-bar">
                {/* Settings Icon on left side of profile */}
                <Link
                  to="/settings"
                  className="btn btn-secondary btn-sm"
                  title="Settings & Preferences"
                  style={{ padding: '0.4rem 0.6rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Settings size={18} />
                </Link>

                {/* Profile Avatar */}
                <div className="user-avatar-hide-mobile" style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'var(--primary-50)',
                  color: user.role === 'admin' ? '#ef4444' : 'var(--primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  border: user.role === 'admin' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--primary-100)',
                  flexShrink: 0
                }}>
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>

                {/* User Details */}
                <div className="user-details-hide-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                    {user.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {user.role} {user.student_id ? `(${user.student_id})` : ''}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm mobile-logout-btn"
                  title="Logout Account"
                >
                  <LogOut size={16} /> <span className="logout-btn-label">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register Student
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
