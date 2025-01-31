import React, { useEffect, useState } from 'react';
import '../css/forgot.css';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sendForgotMail } from '../redux/userSlice';

function ForgotPass() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const api_error = useSelector(state => state.user.error);
  const navigate = useNavigate();
  const dispatch = useDispatch();

    useEffect(() => {
        if(localStorage.getItem("token")){
            navigate("/", { replace: true });
        }
    }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);      
      await dispatch(sendForgotMail({email: email})).unwrap();
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSent(true);
    } catch (err) {
      setError('Failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2>Password Reset</h2>
        <p className="instruction-text">
          Enter your email address and we'll send you a link to reset your password
        </p>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="forgot-form">
            <div className="input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                disabled={isLoading}
              />
              <label>Email Address</label>
            </div>

            {error && <div className="error-message">{error}</div>}
            {api_error && <div className="error-message">{api_error}</div>}
            <button
              type="submit"
              className="submit-btn"
              disabled={!email || isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3 style={{color: 'white'}}>Email Sent!</h3>
            <p style={{color: 'white'}}>
              We've sent instructions to {email}.<br />
              Check your spam folder if you don't see it.
            </p>
          </div>
        )}

        <div className="back-to-login">
          Remember your password? <Link to="/">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPass;