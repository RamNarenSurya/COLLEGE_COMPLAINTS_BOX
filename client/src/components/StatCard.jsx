import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'var(--primary-600)', bg = 'var(--primary-50)' }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: bg, color: color }}>
        {Icon && <Icon size={26} />}
      </div>
      <div>
        <div className="stat-val">{value}</div>
        <div className="stat-lbl">{title}</div>
      </div>
    </div>
  );
}
