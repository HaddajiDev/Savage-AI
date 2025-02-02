import React, { useEffect, useState } from 'react';
import '../css/change-pass.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updatePassword } from '../redux/userSlice';

function ChangePass() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const query = new URLSearchParams(location.search);
    const id = query.get("id");

    useEffect(() => {
        if(!id) navigate("/", { replace: true });
        if(localStorage.getItem("token")) navigate("/", { replace: true });
    }, [navigate, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if(newPassword.length < 6){
            setError("New password must be at least 6 characters");
            return;
        }

        try {
            setIsLoading(true);
            dispatch(updatePassword({id: id, newPassword: newPassword}))
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSuccess(true);
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError('Password change failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="change-pass-container">
            <div className="change-pass-card">
                <h2>Change Password</h2>
                
                {isSuccess ? (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h3>Password Changed!</h3>
                        <p>Your password has been updated successfully.</p>
                        <Link to="/" className="login-link">Return to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="password-form">
                        <div className="input-group">
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder=" "
                                required
                                disabled={isLoading}
                            />
                            <label>New Password</label>
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder=" "
                                required
                                disabled={isLoading}
                            />
                            <label>Confirm Password</label>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="submit-btn-container">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isLoading || !newPassword || !confirmPassword}
                            >
                                {isLoading ? (
                                    <div className="spinner"></div>
                                ) : (
                                    'Change Password'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ChangePass;