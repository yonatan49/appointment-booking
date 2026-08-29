import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { scroller } from 'react-scroll';
import './Navbar.css';

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (target) => {
    setOpen(false);
    if (location.pathname === '/') {
      scroller.scrollTo(target, {
        duration: 500,
        smooth: true,
        offset: -70,
      });
    } else {
      navigate('/', { state: { scrollTo: target } });
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">Yon's Beauty</div>
        <ul className={`nav-links ${open ? 'active' : ''}`}>
          <li onClick={() => handleNavClick('hero')}>Home</li>
          <li onClick={() => handleNavClick('services')}>Services</li>
          <li onClick={() => handleNavClick('gallery')}>Gallery</li>
          <li onClick={() => handleNavClick('testimonials')}>Testimonials</li>
          <li onClick={() => handleNavClick('contact')}>Contact</li>
        </ul>
        <div
          className={`hamburger ${open ? 'open' : ''}`}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
