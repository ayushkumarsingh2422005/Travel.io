import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './screens/landing';
import './App.css';
import Prices from './screens/prices';
import Cabs from './screens/cabs';
import Login from './screens/login';
import Signup from './screens/signup';
import Profile from './screens/Profile';
import PreviousBookings from './screens/PreviousBookings';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes - wrapped in Layout */}
        <Route element={<Layout />}>
          {/* Main booking flow */}
          <Route path="/cabs" element={<Cabs />} />
          <Route path="/prices" element={<Prices />} />
          
          {/* User dashboard and profile section */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/previous-bookings" element={<PreviousBookings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
