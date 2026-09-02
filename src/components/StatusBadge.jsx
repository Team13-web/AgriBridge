import React from 'react';

export default function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();
  
  const getIcon = () => {
    if (['approved', 'active', 'successful', 'paid', 'verified', 'delivered'].includes(s)) return 'bi-check-circle-fill';
    if (['pending', 'processing'].includes(s)) return 'bi-hourglass-split';
    if (['rejected', 'failed', 'overdue', 'suspended'].includes(s)) return 'bi-x-circle-fill';
    return 'bi-info-circle-fill';
  };

  return (
    <span className={`badge-status ${s}`}>
      <i className={`bi ${getIcon()}`}></i>
      <span>{status}</span>
    </span>
  );
}
