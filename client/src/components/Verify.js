import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setToken } from '../redux/userSlice';

function Verify() {
  const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [message, setMessage] = useState(null);

    useEffect(() => {
      if(localStorage.getItem("token")){
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
      }
    }, [location, navigate, dispatch]);
  

    return (
      <div>
        {message && <div style={{color: "white"}}>{message}</div>}
      </div>
    );
  

}

export default Verify