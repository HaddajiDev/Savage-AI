import logo from './logo.svg';
import './App.css';
import Chat from './components/Chat';
import Navbar from './components/NavBar';
import { useDispatch } from 'react-redux';
import { currentUser } from './redux/userSlice';
import { useEffect } from 'react';
import axios from 'axios';

function App() {
  axios.defaults.withCredentials = true;
  const auth = localStorage.getItem('token');
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          if (!token.startsWith('bearer ')) {
            console.error('Invalid token format');
            localStorage.removeItem('token');
            return;
          }
          
          axios.defaults.headers.common.Authorization = token;
          
          await dispatch(currentUser()).unwrap();
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common.Authorization;
        }
      }
    };

    checkAuth();
  }, [dispatch]);

  return (
    <div className="app-container">
      <Navbar />
      <Chat />
    </div>
  );
}

export default App;
