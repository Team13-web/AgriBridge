import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon = 'bi-sprout', title, description, actionText, actionLink, onAction }) {
  return (
    <div className="empty-state my-4">
      <div className="empty-state-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <h5 className="fw-bold text-dark mb-2">{title}</h5>
      <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
        {description}
      </p>

      {actionText && (
        actionLink ? (
          <Link to={actionLink} className="btn btn-success px-4">
            <i className="bi bi-plus-lg me-1"></i> {actionText}
          </Link>
        ) : (
          <button onClick={onAction} className="btn btn-success px-4">
            <i className="bi bi-plus-lg me-1"></i> {actionText}
          </button>
        )
      )}
    </div>
  );
}
