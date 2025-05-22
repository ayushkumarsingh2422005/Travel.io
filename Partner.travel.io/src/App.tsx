import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import Landing from './screens/landing';
import './App.css';
import PartnerProfile from './screens/PartnerProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Landing />} />
        <Route path="/" element={<PartnerProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
