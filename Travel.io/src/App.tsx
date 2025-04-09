import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './screens/landing';
import './App.css';
import Prices from './screens/prices';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/prices" element={<Prices />} />
      </Routes>
    </Router>
  );
}

export default App;
