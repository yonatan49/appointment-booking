import React from 'react';
import './Card.css';

function Card({ icon, title, description, price }) {
  return (
    <div className="service-card">
      <div className="service-icon">{icon}</div>
      <h3 className="service-title">{title}</h3>
      <p className="service-desc">{description}</p>
      {price && <p className="service-price">{price}</p>}
    </div>
  );
}

export default Card;
