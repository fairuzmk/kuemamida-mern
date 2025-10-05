// src/components/FoodItem/HamperItemLebaran.jsx
import React from 'react';
import './FoodItem.css';
import { useNavigate } from 'react-router-dom';

const HamperItemLebaran = ({ hamper }) => {
  const navigate = useNavigate();
  const { _id, name, image, pricingMode, basePrice, discountAmount, description } = hamper;

  const renderPrice = () => {
    if (pricingMode === 'FIXED') {
      return `Rp. ${(Number(basePrice||0)).toLocaleString('id-ID')}`;
    }
    if (pricingMode === 'BASE_PLUS_ITEMS') {
      // base adalah biaya dasar sebelum item; tampilkan sebagai 'Mulai'
      return `Rp. ${(Number(basePrice||0)).toLocaleString('id-ID')}`;
    }
    // SUM_MINUS_DISCOUNT
    return `Dinamis (diskon Rp. ${(Number(discountAmount||0)).toLocaleString('id-ID')})`;
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container" onClick={() => navigate(`/hampers/${_id}`)}>
        <img className="food-item-image" src={image} alt={name} />
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p onClick={() => navigate(`/hampers/${_id}`)}>{name}</p>
        </div>
        <div className="food-item-varian">
            <span className='food-item-varian-badge'>{description}</span>
        </div>
        <p className="food-item-price">{renderPrice()}</p>
        
      </div>
    </div>
  );
};

export default HamperItemLebaran;
