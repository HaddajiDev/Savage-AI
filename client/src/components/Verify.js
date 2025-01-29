import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { resendEmail, setToken } from '../redux/userSlice';
import '../css/verify.css';
import { decryptKryptos } from '../kryptos';

function Verify() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [message, setMessage] = useState(null);
  const [cooldown, setCooldown] = useState(0);  
  const em = localStorage.getItem("em");
  const userEmail = decryptKryptos(em ? em : "", process.env.REACT_APP_KEY);  

  useEffect(() => {
    if(localStorage.getItem("token")){
      navigate("/", { replace: true });
    }
    if(!localStorage.getItem('em')){
      navigate("/", { replace: true });
    }
    
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    const sent = query.get("sent");

    if (token) {
      dispatch(setToken(token));
      navigate("/", { replace: true });
      setMessage("Processing verification...");
    } else if (sent) {
      setMessage("Verification email sent");
      setCooldown(20);
    }
  }, [location, navigate, dispatch]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    try {
      setCooldown(20);
      await dispatch(resendEmail({email: userEmail})).unwrap();
      setMessage("Verification email resent successfully!");
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to resend email");
    }
  };

  return (
    <div className="verify-container">
      {message && (
        <div className={`verify-message ${message.toLowerCase().includes('fail') ? 'error' : ''}`}>
            {message}
        </div>
      )}
      
      <button 
        className="verify-button"
        onClick={() => navigate('/', {replace: true})}
      >
        Go Back
      </button>

      <button
        className={`resend-button ${cooldown > 0 ? 'disabled' : ''}`}
        onClick={handleResend}
        disabled={cooldown > 0}
      >
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
      </button>
    </div>
  );
}

export default Verify;