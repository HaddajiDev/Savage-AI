import logo from './logo.svg';
import './App.css';
import Chat from './components/Chat';
import Navbar from './components/NavBar';
import { useDispatch } from 'react-redux';
import { currentUser } from './redux/userSlice';
import { useEffect } from 'react';

function App() { 
  const auth = localStorage.getItem('token');
  const dispatch = useDispatch();
  useEffect(() => {
    if(auth){
      dispatch(currentUser());
    }
  }, [auth]);

  return (
    <div className="app-container">
      <Navbar />
      <Chat />
    </div>
  );
}

export default App;
