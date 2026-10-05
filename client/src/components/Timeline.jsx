import React from 'react';
import StatusBadge from './StatusBadge';

export default function Timeline({ updates = [] }) {
  if (!updates || updates.length === 0) {
    return <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>No status updates recorded yet.</p>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="timeline-container">
      {updates.map((item, idx) => (
        <div className="timeline-item" key={item.id || idx}>
          <div className="timeline-dot"></div>
          <div className="timeline-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StatusBadge status={item.status} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                  {item.user_name} ({item.user_role})
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
                {formatDate(item.created_at)}
              </span>
            </div>
            {item.comment && (
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', margin: '0.2rem 0 0 0' }}>
                {item.comment}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
