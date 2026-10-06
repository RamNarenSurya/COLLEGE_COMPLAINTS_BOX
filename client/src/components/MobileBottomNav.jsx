import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  User, 
  BarChart3
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
          >
            <PlusCircle size={24} />
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
