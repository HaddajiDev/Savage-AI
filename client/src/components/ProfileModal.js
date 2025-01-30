import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updatePassword } from '../redux/userSlice';
import '../css/profile.css';

const ProfileModal = ({ user, onClose, onLogout }) => {
  const dispatch = useDispatch();
  const [showResetForm, setShowResetForm] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(updatePassword({ newPassword: passwords.newPassword, id: user?._id })).unwrap();
      setShowResetForm(false);
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Password update failed');
    } finally {
      setIsLoading(false);
    }
  };

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
          {!showResetForm ? (
            <button 
              className="action-btn reset-password-btn"
              onClick={() => setShowResetForm(true)}
            >
              Reset Password
            </button>
          ) : (
            <form className="password-reset-form" onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
              {error && <div className="error-message">{error}</div>}
              <div className="form-actions">
                <button
                  type="button"
                  className="action-btn cancel-btn"
                  onClick={() => {
                    setShowResetForm(false);
                    setError('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="action-btn confirm-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="loading-spinner" />
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          )}
          
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