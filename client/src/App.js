import logo from './logo.svg';
import './App.css';
import Chat from './components/Chat';
import Navbar from './components/NavBar';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Chat />
    </div>
  );
}

export default App;
