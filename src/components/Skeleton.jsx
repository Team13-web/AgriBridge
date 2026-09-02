import React from 'react';

export function CardSkeleton() {
  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
      <div className="skeleton" style={{ height: '190px' }}></div>
      <div className="card-body">
        <div className="skeleton mb-2" style={{ height: '20px', width: '60%' }}></div>
        <div className="skeleton mb-3" style={{ height: '14px', width: '40%' }}></div>
        <div className="skeleton mb-2" style={{ height: '14px', width: '90%' }}></div>
        <div className="skeleton" style={{ height: '36px', borderRadius: '12px' }}></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th style={{ width: '30%' }}><div className="skeleton" style={{ height: '16px' }}></div></th>
            <th style={{ width: '25%' }}><div className="skeleton" style={{ height: '16px' }}></div></th>
            <th style={{ width: '25%' }}><div className="skeleton" style={{ height: '16px' }}></div></th>
            <th style={{ width: '20%' }}><div className="skeleton" style={{ height: '16px' }}></div></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td><div className="skeleton" style={{ height: '16px' }}></div></td>
              <td><div className="skeleton" style={{ height: '16px' }}></div></td>
              <td><div className="skeleton" style={{ height: '16px' }}></div></td>
              <td><div className="skeleton" style={{ height: '16px' }}></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
