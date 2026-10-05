import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileCheck, CheckCircle, ArrowRight, Sparkles, Building, LogIn } from 'lucide-react';

export default function Landing() {
  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        padding: '5rem 2rem',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '3rem',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.12)',
            padding: '0.4rem 1rem',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            backdropFilter: 'blur(8px)'
          }}>
            <Sparkles size={16} color="#60a5fa" />
            <span>Digital Campus Governance System</span>
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', color: 'white' }}>
            College Complaint & Facility Resolution Platform
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#cbd5e1', marginBottom: '2.5rem', maxWidth: '750px', lineHeight: 1.6 }}>
            Report classroom, Wi-Fi, lab, hostel, or campus infrastructure issues digitally. Track ticket resolution transparently from submission to final student confirmation.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}>
              Submit a Complaint <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="btn btn-secondary"
              style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              Sign In <LogIn size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem', fontWeight: 800 }}>
        End-to-End Resolution Flow
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '4rem'
      }}>
        {[
          { step: '01', title: 'Submit Complaint', desc: 'Student submits details, category, location, priority & attachments.', icon: FileCheck },
          { step: '02', title: 'Admin Review', desc: 'Central administration reviews & routes issue to appropriate department.', icon: ShieldCheck },
          { step: '03', title: 'Staff Assignment', desc: 'Department assigns designated staff member to inspect and resolve.', icon: Building },
          { step: '04', title: 'Student Feedback', desc: 'Student accepts resolution or reopens ticket if issue persists.', icon: CheckCircle }
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div className="card card-hover" key={i} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <Icon size={28} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Step {item.step}
              </span>
              <h3 style={{ fontSize: '1.2rem', margin: '0.4rem 0 0.6rem 0' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', margin: 0 }}>{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
