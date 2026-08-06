import React from 'react';

const StatusBadge = ({ type, value }) => {
  const getBadgeStyle = () => {
    if (type === 'status') {
      switch (value?.toLowerCase()) {
        case 'todo':
        case 'to do':
        case 'pending':
          return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-300';
        case 'in_progress':
        case 'in progress':
        case 'active':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'review':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'completed':
        case 'done':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        default:
          return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-300';
      }
    } else if (type === 'priority') {
      switch (value?.toLowerCase()) {
        case 'low':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'medium':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'high':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        default:
          return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-300';
      }
    } else if (type === 'role') {
        switch (value?.toLowerCase()) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'pm':
            case 'manager':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'member':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default:
                return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-300';
        }
    }
    return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-300';
  };

  const formattedValue = value?.replace('_', ' ')?.toUpperCase() || 'UNKNOWN';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeStyle()}`}>
      {formattedValue}
    </span>
  );
};

export default StatusBadge;
