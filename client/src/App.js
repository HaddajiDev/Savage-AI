import logo from './logo.svg';
import { Route, Routes } from 'react-router-dom';

import './css/App.css';
import Chat from './components/Chat';
import Navbar from './components/NavBar';
import { useDispatch } from 'react-redux';
import { currentUser } from './redux/userSlice';
import { useEffect } from 'react';
import Verify from './components/Verify';
import ForgotPass from './components/ForgotPass';
import ChangePass from './components/ChangePass';

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
      <Routes>
        <Route path='/' element={<Chat />}/>
        <Route path='/verify' element={<Verify />}/>
        <Route path='/forgot' element={<ForgotPass />} />
        <Route path='/password' element={<ChangePass />} />
      </Routes>
    </div>
  );
}

export default App;
