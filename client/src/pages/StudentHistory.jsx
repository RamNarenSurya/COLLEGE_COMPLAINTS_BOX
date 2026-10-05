import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { History, CheckCircle2, Archive } from 'lucide-react';

export default function StudentHistory() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.getMyComplaints();
        const historyOnly = (res.complaints || []).filter(c => ['Resolved', 'Closed'].includes(c.status));
        setComplaints(historyOnly);
      } catch (err) {
        console.error('History load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading complaint history...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={24} color="var(--primary-600)" /> Complaint History & Archival
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
          Archived view of all resolved and closed complaints
        </p>
      </div>

      <div className="card">
        {complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-500)' }}>
            <p style={{ fontWeight: 600 }}>No resolved or closed complaints found in history.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Title & Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Resolved Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-700)' }}>
                        {c.complaint_number}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{c.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>📍 {c.location}</div>
                    </td>
                    <td>{c.category}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                      {c.resolved_at ? new Date(c.resolved_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <Link to={`/student/complaints/${c.id}`} className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
