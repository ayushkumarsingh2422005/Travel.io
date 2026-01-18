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
import CancellationPolicy from './screens/CancellationPolicy';
import TermsOfUse from './screens/TermsOfUse';
import PrivacyPolicy from './screens/PrivacyPolicy';
import BookingDetails from './screens/BookingDetails'; // Import the new component

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: '',
          style: {
            border: '1px solid #E0E7FF', // indigo-100
            padding: '16px',
            color: '#1F2937', // gray-800
            background: '#FFFFFF',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-xl
            borderRadius: '1rem', // rounded-2xl
            fontSize: '14px',
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: '#4F46E5', // indigo-600
              secondary: '#EEF2FF', // indigo-50
            },
            duration: 4000,
            style: {
              borderLeft: '4px solid #4F46E5', // indigo-600
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444', // red-500
              secondary: '#FEF2F2', // red-50
            },
            duration: 5000,
            style: {
              borderLeft: '4px solid #EF4444', // red-500
            },
          },
          loading: {
            style: {
              borderLeft: '4px solid #6366F1', // indigo-500
            },
          }
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/prices" element={<Prices />} /> */}
          {/* <Route path="/cabs" element={<Cabs/>} /> */}
          <Route path="/previous-bookings" element={<PreviousBookings />} />
        </Route>
        <Route path="/booking-details/:bookingId" element={<BookingDetails />} /> {/* Add new route */}
        <Route path="/prices" element={<Prices />} />
        <Route path="/cabs" element={<Cabs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}

export default App;
