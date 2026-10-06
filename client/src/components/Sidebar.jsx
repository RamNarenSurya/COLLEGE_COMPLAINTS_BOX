import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  History, 
  User, 
  Building2, 
  Users, 
  BarChart3, 
  ShieldAlert,
  Clock,
  Settings,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  if (!user) return null;

  const isStudent = user.role === 'student';

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? 'var(--primary-500)' : 'var(--text-muted)',
    background: isActive ? 'var(--info-box-bg)' : 'transparent',
    fontWeight: isActive ? 700 : 500,
    fontSize: '0.92rem',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    marginBottom: '0.35rem',
    borderLeft: isActive ? '3px solid var(--primary-600)' : '3px solid transparent'
  });

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--slate-400)', fontWeight: 700 }}>
          {isStudent ? 'Student Workspace' : 'Administrator Portal'}
        </span>
        {onClose && (
          <button className="mobile-close-btn" onClick={onClose} aria-label="Close Menu">
            <X size={20} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {isStudent ? (
          <>
            <NavLink to="/student/dashboard" style={linkStyle} onClick={onClose}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/student/complaints/new" style={linkStyle} onClick={onClose}>
              <PlusCircle size={18} /> Submit Complaint
            </NavLink>
            <NavLink to="/student/complaints" style={linkStyle} onClick={onClose}>
              <FileText size={18} /> My Complaints
            </NavLink>
            <NavLink to="/student/history" style={linkStyle} onClick={onClose}>
              <History size={18} /> Complaint History
            </NavLink>
            <NavLink to="/student/login-history" style={linkStyle} onClick={onClose}>
              <Clock size={18} /> Login History
            </NavLink>
            <NavLink to="/student/profile" style={linkStyle} onClick={onClose}>
              <User size={18} /> My Profile
            </NavLink>
            <NavLink to="/settings" style={linkStyle} onClick={onClose}>
              <Settings size={18} /> Settings & Theme
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/admin/dashboard" style={linkStyle} onClick={onClose}>
              <LayoutDashboard size={18} /> Overview
            </NavLink>
            <NavLink to="/admin/complaints" style={linkStyle} onClick={onClose}>
              <FileText size={18} /> Manage Complaints
            </NavLink>
            <NavLink to="/admin/departments" style={linkStyle} onClick={onClose}>
              <Building2 size={18} /> Departments
            </NavLink>
            <NavLink to="/admin/staff" style={linkStyle} onClick={onClose}>
              <Users size={18} /> Staff Directory
            </NavLink>
            <NavLink to="/admin/statistics" style={linkStyle} onClick={onClose}>
              <BarChart3 size={18} /> Analytics & Stats
            </NavLink>
            <NavLink to="/admin/login-history" style={linkStyle} onClick={onClose}>
              <Clock size={18} /> Login Audit Logs
            </NavLink>
            <NavLink to="/admin/profile" style={linkStyle} onClick={onClose}>
              <User size={18} /> Admin Profile
            </NavLink>
            <NavLink to="/settings" style={linkStyle} onClick={onClose}>
              <Settings size={18} /> Settings & Theme
            </NavLink>
          </>
        )}
      </div>

      <div style={{
        padding: '1rem',
        background: isStudent ? 'var(--primary-50)' : '#fef2f2',
        borderRadius: 'var(--radius-sm)',
        border: isStudent ? '1px solid var(--primary-100)' : '1px solid #fecaca',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          {isStudent ? <User size={16} color="var(--primary-700)" /> : <ShieldAlert size={16} color="#dc2626" />}
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isStudent ? 'var(--primary-800)' : '#991b1b' }}>
            {isStudent ? 'Need Assistance?' : 'Admin Privileges'}
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: isStudent ? 'var(--slate-600)' : '#7f1d1d', margin: 0 }}>
          {isStudent ? 'Track your ticket updates in real-time.' : 'Full system modification authority enabled.'}
        </p>
      </div>
    </aside>
  );
}
