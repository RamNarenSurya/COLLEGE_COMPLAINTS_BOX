import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, PlusCircle, LayoutDashboard, Menu, Sun, Moon } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="app-navbar">
      <div className="navbar-container">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user && (
            <button className="mobile-menu-toggle" onClick={onToggleSidebar} aria-label="Toggle Sidebar Menu">
              <Menu size={22} />
            </button>
          )}

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
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
            <div className="brand-text-container">
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--heading-color)', display: 'block', lineHeight: 1.1 }}>
                Complant<span style={{ color: 'var(--primary-600)' }}>Box</span>
              </span>
              <span className="brand-subtitle" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Campus Complaint Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation Actions */}
        <div className="navbar-actions">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn-theme-toggle"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Light or Dark Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} color="#f59e0b" />}
          </button>

          {user ? (
            <>
              {user.role === 'student' ? (
                <>
                  <Link to="/student/dashboard" className="btn btn-secondary btn-sm nav-btn-hide-mobile">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/student/complaints/new" className="btn btn-primary btn-sm">
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

              {/* User Dropdown Profile info */}
              <div className="user-profile-bar">
                <div style={{
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
                <div className="user-details-hide-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                    {user.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {user.role} {user.student_id ? `(${user.student_id})` : ''}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Logout"
                  style={{ padding: '0.4rem 0.6rem' }}
                >
                  <LogOut size={16} />
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
