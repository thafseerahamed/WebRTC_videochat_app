import logo from './logo.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Lobby from './pages/Lobby';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Lobby/>}/>

   
      </Routes>
      
    </div>
  );
}

export default App;
