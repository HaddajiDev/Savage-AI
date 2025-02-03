import React from 'react';
import '../css/SettingsModal.css';

const SettingsModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="settings-modal-title">Settings</h3>
        
        <div className="settings-option">
          <span className="option-label">Save Chat</span>
          <label className="theme-switch">
            <input type="checkbox" checked/>
            <span className="switch-slider"></span>
          </label>
        </div>
        <p className='disclaimer'>not working yet</p>
      </div>
    </div>
  );
};

export default SettingsModal;