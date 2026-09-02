import React from 'react';

export default function Modal({ isOpen, title, children, onClose, onConfirm, confirmText = 'Confirm', confirmVariant = 'success' }) {
  if (!isOpen) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50 tab-index-1" style={{ zIndex: 1080 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body py-3">
            {children}
          </div>
          <div className="modal-footer border-0 pt-0">
            <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
            {onConfirm && (
              <button type="button" className={`btn btn-${confirmVariant}`} onClick={onConfirm}>
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
