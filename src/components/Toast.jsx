import React from 'react';

export default function Toast({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container-custom">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-custom">
          <i className="bi bi-check-circle-fill text-success fs-5"></i>
          <span>{toast.message}</span>
          <button 
            type="button" 
            className="btn-close btn-close-white ms-auto" 
            onClick={() => onClose && onClose(toast.id)}
          ></button>
        </div>
      ))}
    </div>
  );
}
