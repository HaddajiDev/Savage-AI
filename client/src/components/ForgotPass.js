import React, { useEffect, useState } from 'react';
import '../css/forgot.css';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sendForgotMail } from '../redux/userSlice';
import { decryptKryptos } from '../kryptos';

function ForgotPass() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const api_error = useSelector((state) => state.user.error);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const isSent = searchParams.get('sent') === 'true';

  useEffect(() => {
    if (localStorage.getItem("token")) {
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
      await dispatch(sendForgotMail({ email })).unwrap();
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSearchParams({ sent: 'true' });
    } catch (err) {
      setError('Failed. Please try again.');
    } finally {
      setIsLoading(false);
      setCooldown(20);
    }
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    try {
      setCooldown(20);
      let currentEmail = email;
      if (localStorage.getItem("em")) {
        const em = localStorage.getItem("em");
        currentEmail = decryptKryptos(em, process.env.REACT_APP_KEY);
      }
      await dispatch(sendForgotMail({ email: currentEmail })).unwrap();
    } catch (err) {
      setError('Failed. Please try again.');
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
          <>
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3 style={{ color: 'white' }}>Email Sent!</h3>
              <p style={{ color: 'white' }}>
                We've sent instructions to {email}.<br />
                Check your spam folder if you don't see it.
              </p>
            </div>
            <div className='resend-button-forgot'>
              <button
                className={`resend-button ${cooldown > 0 ? 'disabled' : ''}`}
                onClick={handleResend}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Email"}
              </button>
            </div>
          </>
        )}

        <div className="back-to-login">
          Remember your password? <Link to="/">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPass;
