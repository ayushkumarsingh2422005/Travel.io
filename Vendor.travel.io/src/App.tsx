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
function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<VendorLogin />} />
        <Route path="/signup" element={<VendorSignup />} />
        <Route path="/register" element={<VendorRegistration />} />
        <Route path="/forget-password" element={<ResetPasswordMail/>} />
        <Route path="/vendor/reset-password" element={<ResetPassword />} />

          <Route path="/profile" element={<VendorProfile />} />
        {/* Protected routes - wrapped in Layout */}
        <Route element={<Layout />}>
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