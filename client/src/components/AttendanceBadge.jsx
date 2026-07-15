import React from 'react';
import { Badge } from './ui/badge';

const AttendanceBadge = ({ status, percentage, className }) => {
  const getVariant = (stat) => {
    switch (stat) {
      case 'SAFE':
        return 'safe';
      case 'WARNING':
        return 'warning';
      case 'CRITICAL':
      default:
        return 'critical';
    }
  };

  const getLabel = (stat) => {
    switch (stat) {
      case 'SAFE':
        return '🟢 Safe';
      case 'WARNING':
        return '🟡 Warning';
      case 'CRITICAL':
      default:
        return '🔴 Critical';
    }
  };

  const variant = getVariant(status);

  return (
    <Badge variant={variant} className={className}>
      {percentage !== undefined ? `${percentage}% · ${status}` : getLabel(status)}
    </Badge>
  );
};

export default AttendanceBadge;
export { AttendanceBadge };
