import logo from './logo.svg';
import './App.css';
import Mainpage from './Mainpage';
import { Routes, Route, Navigate } from "react-router-dom";
function App() {
  return (
   <Routes>
   
   <Route path="/" element={<Mainpage />}>
       
        
      </Route>
   </Routes>

  


  );
}

export default App;
