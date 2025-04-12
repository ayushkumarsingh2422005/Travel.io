import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './screens/Landing'
import VendorRegistration from './screens/VendorRegistration'
import './App.css';
import VendorProfile from './screens/VendorProfile';




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VendorProfile />} />
        <Route path="/register" element={<VendorRegistration />} />
        <Route path="/dashboard" element={<Landing />} />
      
       
      </Routes>
    </Router>
  );
}

export default App;
