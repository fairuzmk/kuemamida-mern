import React, { useContext, useState } from 'react';
import './FoodItem.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { faStarHalfAlt, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const FoodItem = ({ id, name, price, varians, image, rating, inStock, category }) => {
  const navigate = useNavigate();
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);
  const [showAll, setShowAll] = useState(false);

  const visibleVarians = showAll ? varians : varians.slice(0, 1);
  const hiddenCount = varians.length - 1;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} className="svg-star-icon" />);
      } else if (rating >= i - 0.5) {
        stars.push(<FontAwesomeIcon key={i} icon={faStarHalfAlt} className="svg-star-icon" />);
      } else {
        stars.push(<FontAwesomeIcon key={i} icon={faStarRegular} className="svg-star-icon" />);
      }
    }
    return stars;
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img className="food-item-image" src={image} alt={name} onClick={() => navigate(`/detail/${slug}-${id}`)} />
        {!cartItems[id] ? null : (
          <div className="food-item-counter">
            <FontAwesomeIcon icon={faMinus} className="svg-minus-icon" onClick={() => removeFromCart(id)} />
            <p>{cartItems[id]}</p>
            <FontAwesomeIcon icon={faPlus} className="svg-plus-icon" onClick={() => addToCart(id)} />
          </div>
        )}

        {!inStock && (
          <div className="out-of-stock-overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p onClick={() => navigate(`/detail/${slug}-${id}`)}>{name}</p>
        </div>

        <div className="food-item-varian">
          {visibleVarians.map((item, index) => (
            <span key={index} className="food-item-varian-badge">{item.varianName}</span>
          ))}
          {!showAll && hiddenCount > 0 && (
            <span className="food-item-varian-more" >
              +{hiddenCount} more
            </span>
          )}
        </div>

        <p className="food-item-price">Rp. {price.toLocaleString("id-ID")}</p>
      </div>
    </div>
  );
};

export default FoodItem;
