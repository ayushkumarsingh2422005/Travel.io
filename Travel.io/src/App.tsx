import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './screens/landing';
import './App.css';
import Prices from './screens/prices';
import Cabs from './screens/cabs';
import Login from './screens/login';
import Signup from './screens/signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/cabs" element={<Cabs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
