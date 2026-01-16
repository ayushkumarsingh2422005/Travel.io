import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './screens/Landing';
import VendorLogin from './screens/VendorLogin';
import VendorSignup from './screens/VendorSignup';
import VendorRegistration from './screens/VendorRegistration';
import Booking from './screens/Booking';
import Car from './screens/Car';
import Driver from './screens/Driver';
import DriverRewards from './screens/DriverRewards';
import Inventory from './screens/Inventory';
import Penalty from './screens/Penalty';
import Trips from './screens/Trips';
import VendorProfile from './screens/VendorProfile';
import Wallet from './screens/Wallet';
import Dashboard from './screens/Dashboard';
import ResetPasswordMail from './screens/ResetPasswordMail';
import ResetPassword from './screens/ResetPassword';
import DriverTracking from './screens/DriverTracking';
import VerifyEmail from './screens/VerifyEmail';
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
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<VendorLogin />} />
        <Route path="/signup" element={<VendorSignup />} />
        <Route path="/register" element={<VendorRegistration />} />
        <Route path="/forget-password" element={<ResetPasswordMail />} />
        <Route path="/vendor/reset-password" element={<ResetPassword />} />
        <Route path="/driver-tracking/:bookingId" element={<DriverTracking />} />
        <Route path="/vendor/verify-email" element={<VerifyEmail />} />

        {/* Protected routes - wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/profile" element={<VendorProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/car" element={<Car />} />
          <Route path="/driver" element={<Driver />} />
          <Route path="/driver-rewards" element={<DriverRewards />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/penalty" element={<Penalty />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/wallet" element={<Wallet />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;