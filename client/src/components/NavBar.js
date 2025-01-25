import React, { useState } from 'react';
import '../App.css';
import { useDispatch, useSelector } from 'react-redux';
import { userLogin, userRegister } from '../redux/userSlice';

const Navbar = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const dispatch = useDispatch();
  
  const user = useSelector(state => state.user.user);

  const [userSignUp, setUserSignUp] = useState({
      email: "",
      username: "",
      password: "",
  });

  const [user_Login, setUser_Login] = useState({
      email: "",    
      password: "",
  });

  const handleLogin = () => {
    dispatch(userLogin(user_Login));
    setShowAuthModal(false);
  }

  const handleSignUp = () => {
    dispatch(userRegister(userSignUp));
    setShowAuthModal(false);
  }

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    console.log(`${authMode} submitted`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <div className="navbar-logo">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="24" width="24">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <span className="navbar-title">Savage AI</span>
        </div>
        <div className="navbar-right">
        {!user ? (
          <button 
            className="navbar-signup-btn"
            onClick={() => setShowAuthModal(true)}
          >
            Sign Up
          </button>
        ) : (
          <div className="user-info">
            <img 
              className="user-avatar"
              src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${user?.username}&flip=true&backgroundColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=solid,gradientLinear&backgroundRotation=0,10,20&shapeColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,transparent`}
              alt="User avatar"
            />
            <span className="username">{user?.username}</span>
          </div>
        )}          
          <button className="navbar-icon-btn" aria-label="GitHub Repository">
            <a style={{all: 'unset'}} href='https://github.com/HaddajiDev/Savage-AI' target='_blank' rel="noreferrer">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="20" width="20">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </button>
          <button className="navbar-icon-btn" aria-label="Settings">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="20" width="20">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </div>

      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <button
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </button>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="auth-form">
              {authMode === 'signup' ? (
                <>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" required onChange={(e) => setUserSignUp({...userSignUp, username: e.target.value})}/>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" required onChange={(e) => setUserSignUp({...userSignUp, email: e.target.value})}/>
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" required onChange={(e) => setUserSignUp({...userSignUp, password: e.target.value})}/>
                </div>
                </>
              ) : (
                <>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" required onChange={(e) => setUser_Login({...user_Login, email: e.target.value})}/>
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" required onChange={(e) => setUser_Login({...user_Login, password: e.target.value})}/>
                </div>
                </>
              )}

              {authMode === 'login' ? <button className="auth-submit-btn" onClick={handleLogin}>Login</button> : <button className="auth-submit-btn" onClick={handleSignUp}>Create Account</button>}
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;