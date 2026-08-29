import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scroller } from 'react-scroll';
import './Footer.css';
import { FaFacebookF, FaInstagram, FaTwitter, FaPinterestP } from 'react-icons/fa';

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (target) => {
    if (location.pathname === '/') {
      // Scroll directly if on homepage
      scroller.scrollTo(target, {
        duration: 500,
        smooth: true,
        offset: -70,
      });
    } else {
      // Navigate to homepage and trigger scroll
      navigate('/', { state: { scrollTo: target } });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-col">
          <h2>Yon's Beauty Salon</h2>
          <p>Where beauty meets luxury for your hands and feet.</p>
        </div>
        <div className="footer-col">
          <h2>Quick Links</h2>
          <ul>
            <li><button onClick={() => handleScroll('services')} className="footer-link-btn">Services</button></li>
            <li><button onClick={() => handleScroll('gallery')} className="footer-link-btn">Gallery</button></li>
            <li><button onClick={() => navigate('/booking')} className="footer-link-btn">Book Appointment</button></li>
            <li><button onClick={() => handleScroll('contact')} className="footer-link-btn">Contact Us</button></li>
          </ul>
        </div>
        <div className="footer-col">
          <h2>Connect With Us</h2>
          <div className="footer-icons">
            <FaFacebookF />
            <FaInstagram />
            <FaTwitter />
            <FaPinterestP />
          </div>
        </div>
      </div>
      <hr className="footer-divider" />
      <div className="footer-bottom">
        <p>© 2026 Yon's Beauty. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;

