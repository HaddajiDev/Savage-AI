import React from 'react';
import '../css/profile.css'

const ProfileModal = ({ user, onClose, onLogout, onResetPassword }) => {
  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content dark-theme" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <img 
            className="profile-avatar"
            src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${user?.username}&flip=true&backgroundColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=solid,gradientLinear&backgroundRotation=0,10,20&shapeColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,transparent`}
            alt="Profile"
          />
          <div className="profile-info">
            <h3 className="username">{user?.username}</h3>
            <p className="email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-actions">
          <button 
            className="action-btn reset-password-btn"
            onClick={onResetPassword}
          >
            Reset Password
          </button>
          <button 
            className="action-btn logout-btn"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;