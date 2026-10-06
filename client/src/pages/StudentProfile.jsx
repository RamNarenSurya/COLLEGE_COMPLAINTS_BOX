import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, BookOpen, GraduationCap, Shield } from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--slate-200)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--primary-600)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 800
          }}>
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{user.name}</h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--slate-500)', fontWeight: 600 }}>
              Student Roll ID: {user.student_id || 'STU2026001'}
            </div>
          </div>
        </div>

        <div className="form-grid-2">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Mail size={14} /> Email Address
            </span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>{user.email}</div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Phone size={14} /> Phone Number
            </span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>{user.phone || 'Not provided'}</div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <BookOpen size={14} /> Department
            </span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>{user.department_name || 'Academic Dept'}</div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <GraduationCap size={14} /> Academic Year
            </span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>Year {user.year || 1}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
