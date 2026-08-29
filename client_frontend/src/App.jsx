import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import Home from './components/pages/home/Home';
import Booking from './components/pages/booking/Booking';
import NotFound from './components/pages/notFound/NotFound';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

