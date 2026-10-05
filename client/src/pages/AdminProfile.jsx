import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, ShieldAlert } from 'lucide-react';

export default function AdminProfile() {
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
            background: '#dc2626',
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
            <div style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
              <ShieldCheck size={16} /> System Administrator
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Mail size={14} /> Admin Email
            </span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>{user.email}</div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldAlert size={14} /> Role Authority
            </span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>Super Admin (Full Access)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
