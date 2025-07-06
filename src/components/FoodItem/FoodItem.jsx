import React, { useContext } from 'react'

import './FoodItem.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'
import { faStarHalfAlt } from '@fortawesome/free-solid-svg-icons'; 
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faMinus } from '@fortawesome/free-solid-svg-icons'

import { StoreContext } from '../../context/StoreContext'

const FoodItem = ({id, name, price, description, image, rating, inStock, category}) => {

    


    // Rating
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

      const{cartItems,addToCart,removeFromCart,url} = 
      useContext(StoreContext);
     



  return (
    <div className='food-item'>
        <div className="food-item-img-container">
            <img className='food-item-image' src={url + "/images/" + image} alt="" />
            {!cartItems[id]
                ?<div className="addIcon"><FontAwesomeIcon icon={faPlus} className="svg-add-icon" onClick={()=>addToCart(id)}/></div>
                
                :<div className="food-item-counter">
                    <FontAwesomeIcon icon={faMinus} className="svg-minus-icon" onClick={()=>removeFromCart(id)}/>
                    <p>{cartItems[id]}</p>
                    <FontAwesomeIcon icon={faPlus} className="svg-plus-icon" onClick={()=>addToCart(id)}/>
                </div>

            }
            {/* Out of stock overlay */}
            {!inStock && (
                <div className="out-of-stock-overlay">
                <span>Out of Stock</span>
                </div>
            )}
        </div>
        <div className="food-item-info">
            <div className="food-item-name-rating">
                <p>{name}</p>
                <div className="star">
                    {renderStars(rating)}
                </div>
                

            </div>
            <p className="food-item-price">Rp. {price.toLocaleString("id-ID")}</p>
            <p className="food-item-desc">{description}</p>
            <p className="food-item-desc">{category}</p>
            
        </div>
    </div>
  )
}

export default FoodItem