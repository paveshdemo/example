import React from 'react';
import { getStatusColor, getStatusLabel } from '../../utils/helpers';

const StatusBadge = ({ status }) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  return (
    <span
      className="badge"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`
      }}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
