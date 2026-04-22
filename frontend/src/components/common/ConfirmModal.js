import React from 'react';

const ConfirmModal = ({ show, title, message, onConfirm, onCancel, confirmText = 'Confirm', danger = false }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>&times;</button>
        </div>
        <p style={{ marginBottom: '20px', fontSize: '14px', color: '#5f6368' }}>{message}</p>
        <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
