import React from 'react';
import { cn } from '@/lib/utils';

const AttendanceBadge = ({ status, percentage, className }) => {
  const getBadgeStyle = (stat) => {
    switch (stat) {
      case 'SAFE':
        return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/30';
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/30';
      case 'CRITICAL':
      default:
        return 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/30 animate-pulse';
    }
  };

  const getLabel = (stat) => {
    switch (stat) {
      case 'SAFE':
        return 'Safe (≥75%)';
      case 'WARNING':
        return 'Warning (70-75%)';
      case 'CRITICAL':
      default:
        return 'Critical (<70%)';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs transition-colors',
        getBadgeStyle(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {percentage !== undefined ? `${percentage}% — ${status}` : getLabel(status)}
    </span>
  );
};

export default AttendanceBadge;
export { AttendanceBadge };
