import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="app-container">
      <div className="not-found">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Oops! Page not found.</h1>
        <p className="not-found-description">
          We couldn’t find the page you’re looking for. It might have been moved or doesn’t exist anymore.
        </p>
        <div className="not-found-buttons">
          <Link to="/" className="btn-primary">
            Back to homepage
          </Link>
          <a href="/help" className="btn-link">Visit our Help Center</a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
