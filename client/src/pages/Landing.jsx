import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return (
    <div style={{ padding: '1rem 0 3rem 0', maxWidth: '900px', margin: '0 auto' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        padding: '3rem 1.5rem',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '2rem',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.12)',
          padding: '0.45rem 1.2rem',
          borderRadius: '50px',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          backdropFilter: 'blur(8px)'
        }}>
          <Sparkles size={16} color="#60a5fa" />
          <span>College Complaint Management System</span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', color: 'white' }}>
          College Complaint Box
        </h1>

        <p style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '2rem', maxWidth: '650px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          Welcome to the official campus complaint portal. Please choose an option below to proceed.
        </p>

        {/* Action Buttons / Cards: Login & Register */}
        <div className="form-grid-2" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <Link
            to="/login"
            style={{
              textDecoration: 'none',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem 1.25rem',
              backdropFilter: 'blur(12px)',
              transition: 'transform 0.2s ease, background 0.2s ease',
              color: 'white',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--primary-600)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)'
            }}>
              <LogIn size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.3rem', color: 'white' }}>
              Login
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0 }}>
              Sign in to your existing account
            </p>
          </Link>

          <Link
            to="/register"
            style={{
              textDecoration: 'none',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem 1.25rem',
              backdropFilter: 'blur(12px)',
              transition: 'transform 0.2s ease, background 0.2s ease',
              color: 'white',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#10b981',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)'
            }}>
              <UserPlus size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.3rem', color: 'white' }}>
              Register
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0 }}>
              Create a new student account
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

