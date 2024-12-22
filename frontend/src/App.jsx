import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" 
               element={
                   <PrivateRoute>
                       <Home />
                   </PrivateRoute>} 
        />
        <Route path="/" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;