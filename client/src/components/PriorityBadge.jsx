import React from 'react';
import { AlertTriangle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

export default function PriorityBadge({ priority }) {
  const getPriorityConfig = (pr) => {
    switch (pr) {
      case 'Low':
        return { class: 'badge-priority-low', icon: ArrowDown, label: 'Low' };
      case 'Medium':
        return { class: 'badge-priority-medium', icon: ArrowUp, label: 'Medium' };
      case 'High':
        return { class: 'badge-priority-high', icon: AlertCircle, label: 'High' };
      case 'Critical':
        return { class: 'badge-priority-critical', icon: AlertTriangle, label: 'Critical' };
      default:
        return { class: 'badge-priority-medium', icon: ArrowUp, label: pr || 'Medium' };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  return (
    <span className={`badge ${config.class}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
}
