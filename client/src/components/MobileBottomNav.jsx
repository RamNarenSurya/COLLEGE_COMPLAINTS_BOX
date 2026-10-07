import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  User, 
  BarChart3,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function MobileBottomNav() {
  const { user } = useAuth();
  if (!user) return null;

  const isStudent = user.role === 'student';

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {isStudent ? (
        <>
          <NavLink 
            to="/student/dashboard" 
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Home</span>
          </NavLink>
          
          <NavLink 
            to="/student/complaints" 
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <FileText size={20} />
            <span>Tickets</span>
          </NavLink>

          <NavLink 
            to="/student/complaints/new" 
            className="mobile-nav-item mobile-nav-item-primary"
            aria-label="Report New Issue"
            title="Report New Issue"
          >
            <Plus size={28} strokeWidth={2.8} />
          </NavLink>

          <NavLink 
            to="/student/history" 
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <Clock size={20} />
            <span>History</span>
          </NavLink>

          <NavLink 
            to="/student/profile" 
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        </>
      ) : (
        <>
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Home</span>
          </NavLink>

          <NavLink 
            to="/admin/complaints" 
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <FileText size={20} />
            <span>Tickets</span>
          </NavLink>

          <NavLink 
            to="/admin/statistics" 
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <BarChart3 size={20} />
            <span>Stats</span>
          </NavLink>

          <NavLink 
            to="/admin/login-history" 
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <ShieldCheck size={20} />
            <span>Audit</span>
          </NavLink>

          <NavLink 
            to="/admin/profile" 
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        </>
      )}
    </nav>
  );
}
