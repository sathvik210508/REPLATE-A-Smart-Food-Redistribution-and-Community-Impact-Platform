import React from 'react';

const statusConfig = {
  AVAILABLE: {
    label: 'Available',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  REQUESTED: {
    label: 'Requested',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  ACCEPTED: {
    label: 'Accepted / Reserved',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  PICKED_UP: {
    label: 'Picked Up (In Transit)',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  COMPLETED: {
    label: 'Completed & Served',
    className: 'bg-[#EAF6EF] text-[#116747] border-[#16845B]/30',
    dot: 'bg-[#16845B]',
  },
  EXPIRED: {
    label: 'Expired',
    className: 'bg-stone-100 text-stone-600 border-stone-200',
    dot: 'bg-stone-400',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  PENDING: {
    label: 'Pending Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  REJECTED: {
    label: 'Declined',
    className: 'bg-stone-100 text-stone-600 border-stone-200',
    dot: 'bg-stone-400',
  },
};

export const StatusBadge = ({ status, className = '' }) => {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-stone-100 text-stone-600 border-stone-200',
    dot: 'bg-stone-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.className} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
