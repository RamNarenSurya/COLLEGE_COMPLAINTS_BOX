import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentComplaints from './pages/StudentComplaints';
import NewComplaint from './pages/NewComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import StudentHistory from './pages/StudentHistory';
import StudentLoginHistory from './pages/StudentLoginHistory';
import StudentProfile from './pages/StudentProfile';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaints from './pages/AdminComplaints';
import AdminComplaintDetail from './pages/AdminComplaintDetail';
import AdminDepartments from './pages/AdminDepartments';
import AdminStaff from './pages/AdminStaff';
import AdminStatistics from './pages/AdminStatistics';
import AdminLoginHistory from './pages/AdminLoginHistory';
import AdminProfile from './pages/AdminProfile';

// General Logged In Pages
import Settings from './pages/Settings';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Authenticating user session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-container">
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="main-layout">
        {user && (
          <>
            {sidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar} />}
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
          </>
        )}
        <main className="content-area">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* General Logged-In User Settings */}
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Student Protected Routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/complaints" element={<ProtectedRoute allowedRole="student"><StudentComplaints /></ProtectedRoute>} />
            <Route path="/student/complaints/new" element={<ProtectedRoute allowedRole="student"><NewComplaint /></ProtectedRoute>} />
            <Route path="/student/complaints/:id" element={<ProtectedRoute allowedRole="student"><ComplaintDetail /></ProtectedRoute>} />
            <Route path="/student/history" element={<ProtectedRoute allowedRole="student"><StudentHistory /></ProtectedRoute>} />
            <Route path="/student/login-history" element={<ProtectedRoute allowedRole="student"><StudentLoginHistory /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedRole="student"><StudentProfile /></ProtectedRoute>} />

            {/* Admin Protected Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/complaints" element={<ProtectedRoute allowedRole="admin"><AdminComplaints /></ProtectedRoute>} />
            <Route path="/admin/complaints/:id" element={<ProtectedRoute allowedRole="admin"><AdminComplaintDetail /></ProtectedRoute>} />
            <Route path="/admin/departments" element={<ProtectedRoute allowedRole="admin"><AdminDepartments /></ProtectedRoute>} />
            <Route path="/admin/staff" element={<ProtectedRoute allowedRole="admin"><AdminStaff /></ProtectedRoute>} />
            <Route path="/admin/statistics" element={<ProtectedRoute allowedRole="admin"><AdminStatistics /></ProtectedRoute>} />
            <Route path="/admin/login-history" element={<ProtectedRoute allowedRole="admin"><AdminLoginHistory /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute allowedRole="admin"><AdminProfile /></ProtectedRoute>} />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {user && <MobileBottomNav />}
    </div>
  );
}

