import React from 'react';
import { Clock, Eye, UserCheck, Wrench, CheckCircle2, Archive } from 'lucide-react';

export default function StatusBadge({ status }) {
  const getStatusConfig = (st) => {
    switch (st) {
      case 'Submitted':
        return { class: 'badge-status-submitted', icon: Clock, label: 'Submitted' };
      case 'Under Review':
        return { class: 'badge-status-under-review', icon: Eye, label: 'Under Review' };
      case 'Assigned':
        return { class: 'badge-status-assigned', icon: UserCheck, label: 'Assigned' };
      case 'In Progress':
        return { class: 'badge-status-in-progress', icon: Wrench, label: 'In Progress' };
      case 'Resolved':
        return { class: 'badge-status-resolved', icon: CheckCircle2, label: 'Resolved' };
      case 'Closed':
        return { class: 'badge-status-closed', icon: Archive, label: 'Closed' };
      default:
        return { class: 'badge-status-submitted', icon: Clock, label: st || 'Submitted' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`badge ${config.class}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
}
