import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './screens/landing';
import './App.css';
import Prices from './screens/prices';
import Cabs from './screens/cabs';
import Login from './screens/login';
import Signup from './screens/signup';
import PreviousBookings from './screens/PreviousBookings';
import Dashboard from './screens/Dashboard';
import Layout from './components/Layout';
import Profile from './screens/Profile';
import Booking from './screens/booking';
import CancellationPolicy from './screens/CancellationPolicy';
import TermsOfUse from './screens/TermsOfUse';
import PrivacyPolicy from './screens/PrivacyPolicy';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/prices" element={<Prices />} /> */}
          {/* <Route path="/cabs" element={<Cabs/>} /> */}
          <Route path="/profile" element={<Profile />} />
           <Route path="/previous-bookings" element={<PreviousBookings/>} />
        </Route>
        <Route path="/prices" element={<Prices />} />
        <Route path="/cabs" element={<Cabs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/booking" element={<Booking />} />
      </Routes>
    </Router>
  );
}

export default App;
