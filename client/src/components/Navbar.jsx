import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, LogOut, PlusCircle, LayoutDashboard, History, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid var(--slate-200)',
      padding: '0.85rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
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
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}>
            C
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--slate-900)', display: 'block', lineHeight: 1.1 }}>
              Complant<span style={{ color: 'var(--primary-600)' }}>Box</span>
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600 }}>Campus Complaint Portal</span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <>
              {user.role === 'student' ? (
                <>
                  <Link to="/student/dashboard" className="btn btn-secondary btn-sm">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/student/complaints/new" className="btn btn-primary btn-sm">
                    <PlusCircle size={16} /> Report Issue
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/admin/dashboard" className="btn btn-secondary btn-sm">
                    <LayoutDashboard size={16} /> Admin Portal
                  </Link>
                </>
              )}

              {/* User Dropdown Profile info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                paddingLeft: '0.75rem',
                borderLeft: '1px solid var(--slate-200)'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? '#fef2f2' : 'var(--primary-50)',
                  color: user.role === 'admin' ? '#dc2626' : 'var(--primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  border: user.role === 'admin' ? '1px solid #fecaca' : '1px solid var(--primary-100)'
                }}>
                  {user.name.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-800)', lineHeight: 1.1 }}>
                    {user.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'capitalize' }}>
                    {user.role} {user.student_id ? `(${user.student_id})` : ''}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Logout"
                  style={{ marginLeft: '0.5rem', padding: '0.4rem 0.6rem' }}
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
