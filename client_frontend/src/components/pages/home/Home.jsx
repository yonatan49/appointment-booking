import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { scroller } from 'react-scroll';
import './Home.css';
import Navbar from '../../ui/navbar/Navbar.jsx';
import heroImage from './../../../assets/hero.jpg';
import img1 from './../../../assets/img1.jpg';
import img2 from './../../../assets/img2.jpg';
import img3 from './../../../assets/img3.jpg';
import Card from '../../ui/card/Card.jsx';
import { FaPaintBrush, FaHandSparkles, FaSpa, FaAirFreshener, FaFeatherAlt, FaGem, FaInstagram, FaFacebookF, FaTelegramPlane, FaStar, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';
import Footer from '../../ui/footer/Footer.jsx';

const services = [
  {
    icon: <FaPaintBrush />,
    title: 'Makeup',
    description: 'Flawless makeup for any occasion.'
  },
  {
    icon: <FaHandSparkles />,
    title: 'Manicure',
    description: 'Our classic manicure includes nail shaping, cuticle care, hand massage, and polish application.'
  },
  {
    icon: <FaSpa />,
    title: 'Pedicure',
    description: 'Revitalize your feet with our pedicure including foot soak, exfoliation, callus removal, and polish.'
  },
  {
    icon: <FaAirFreshener />,
    title: 'Facial',
    description: 'Refresh and revitalize your skin.'
  },
  {
    icon: <FaFeatherAlt />,
    title: 'Eyelash',
    description: 'Natural-looking lash enhancements.'
  },
  {
    icon: <FaGem />,
    title: 'Nail Art',
    description: 'Express yourself with custom nail art designs from our talented nail technicians.'
  },
];

const testimonials = [
  {
    rating: 5,
    comment: 'Amazing service! My nails have never looked better.',
    user: 'Liya M.'
  },
  {
    rating: 4,
    comment: 'Very professional and friendly staff. Loved my makeup!',
    user: 'Sofia A.'
  },
  {
    rating: 5,
    comment: 'Absolutely loved the pedicure. Relaxing and clean!',
    user: 'Helen G.'
  }
];

const Home = () => {
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      scroller.scrollTo(location.state.scrollTo, {
        duration: 500,
        smooth: true,
        offset: -70,
      });
    }
  }, [location.state]);

  return (
    <div className="app-container">
      <Navbar />
      <div className="hero" id="hero" style={{ backgroundImage: `url(${heroImage})` }} >
        <div className="hero-overlay">
          <h1 className="hero-title">Welcome to Yon's Beauty</h1>
          <p className="hero-subtitle">
            Where beauty meets luxury for your hands and feet
          </p>
          <button className="hero-btn" onClick={() => navigate('/booking')} >
            Book Appointment
          </button>
        </div>
      </div>
      <div className="services" id="service">
        <h2 className="section-title">Our Services</h2>
        <p className="section-subtitle">
          Discover our range of premium nail care services designed to pamper and perfect your nails.
        </p>
        <div className="services-grid">
          {services.map((service, index) => (
            <Card
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              price={service.price}
            />
          ))}
        </div>
        <div className="book-service-btn-wrapper">
          <button className="hero-btn" onClick={() => navigate('/booking')}>
            Book a Service
          </button>
        </div>
      </div>
      <div className="gallery" id="gallery">
        <h2 className="section-title">Nail Art Gallery</h2>
        <p className="section-subtitle">
          Browse our gallery to see examples of our nail technicians' artistry and get inspired for your next visit.
        </p>
        <div className="gallery-grid">
          <img src={img1} alt="gallery 1" className="gallery-img" />
          <img src={img2} alt="gallery 2" className="gallery-img" />
          <img src={img3} alt="gallery 3" className="gallery-img" />
          <img src={heroImage} alt="gallery 4" className="gallery-img" />
        </div>
        <p className="section-subtitle">
          Follow us on Instagram for daily nail inspiration
        </p>
        <div className="social-icons">
          <a href='https://www.instagram.com' target='_blank'><FaInstagram className="icon" /></a>
          <a href='https://www.facebook.com' target='_blank'><FaFacebookF className="icon" /></a>
          <a href='https://www.telegram.org' target='_blank'><FaTelegramPlane className="icon" /></a>
        </div>
      </div>
      <div className="testimonials" id="testimonials">
        <h2 className="section-title">What Our Clients Say</h2>
        <p className="section-subtitle">
          Our clients love their experience at Yon's Beauty. Here's what they have to say.
        </p>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <FaStar key={idx} className="star-icon" />
                ))}
              </div>
              <p className="testimonial-comment">"{t.comment}"</p>
              <p className="testimonial-user"><strong>{t.user}</strong></p>
            </div>
          ))}
        </div>
      </div>
      <div className="contact" id="contact">
        <h2 className="section-title">Visit Us</h2>
        <p className="section-subtitle">
          We'd love to see you in our salon. Book an appointment or just stop by!
        </p>
        <div className="contact-container">
          <div className="contact-info">
            <h3>Contact Information</h3>
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <div>
                <strong>Address:</strong><br />
                123 Beauty Lane, Glamour City, GC 12345
              </div>
            </div>
            <div className="contact-item">
              <FaPhoneAlt className="contact-icon" />
              <div>
                <strong>Phone:</strong><br />
                (555) 123-4567
              </div>
            </div>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <div>
                <strong>Email:</strong><br />
                info@yonsbeautysalon.com
              </div>
            </div>
            <div className="contact-item">
              <FaClock className="contact-icon" />
              <div>
                <strong>Hours:</strong><br />
                Monday - Saturday: 9am - 7pm<br />
                Sunday: 10am - 5pm
              </div>
            </div>
          </div>
          <form className="contact-form">
            <h3>Quick Contact</h3>
            <label>
              <span>Name</span>
              <input type="text" placeholder="Your Name" required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" placeholder="Your Email" required />
            </label>
            <label>
              <span>Message</span>
              <textarea rows="5" placeholder="Your Message" required></textarea>
            </label>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
