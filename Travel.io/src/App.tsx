import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './screens/landing';
import './App.css';
import Prices from './screens/prices';
import Cabs from './screens/cabs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/cabs" element={<Cabs />} />
      </Routes>
    </Router>
  );
}

export default App;
