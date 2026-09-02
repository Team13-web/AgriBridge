import React from 'react';

export default function StatCard({ title, value, icon, color = 'primary', subtitle }) {
  return (
    <div className="stat-pill">
      <div className={`rounded-3 p-3 bg-${color}-subtle text-${color} d-flex align-items-center justify-content-center`} style={{ width: '54px', height: '54px' }}>
        <i className={`bi ${icon} fs-3`}></i>
      </div>
      <div>
        <h3>{value}</h3>
        <small className="text-muted fw-semibold">{title}</small>
        {subtitle && <div className="text-muted extra-small">{subtitle}</div>}
      </div>
    </div>
  );
}
