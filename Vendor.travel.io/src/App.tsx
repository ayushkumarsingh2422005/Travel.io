import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './screens/Landing'
import VendorRegistration from './components/VendorRegistration'
import './App.css';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/vendor" element={<VendorRegistration />} />
      
       
      </Routes>
    </Router>
  );
}

export default App;
