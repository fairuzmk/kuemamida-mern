import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'
import { food_list } from '../../assets/assets'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTruckFast } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Cart = () => {

  const {cartItems, food_list, removeFromCart, getTotalCartAmount, getShippingCost, quantityItem, url} = useContext(StoreContext)

  const navigate = useNavigate();

  const isCartEmpty = Object.values(cartItems).every(qty => qty === 0);

  return (
    <div className='cart'>
      <h1>Keranjang Saya</h1>
      <div className="cart-grid">
        <div className="cart-items">
          
          <hr />
          {Object.entries(cartItems).map(([itemKey, qty]) => {
              if (qty <= 0) return null;

              const [id, varianName] = itemKey.split('_');
              const product = food_list.find(item => item._id === id);
              if (!product) return null;

              const variant = product.varians?.find(v => v.varianName === varianName);
              const price = variant?.varianPrice || product.price;

              return (
                <div key={itemKey}>
                  <div className="cart-items-title cart-items-item">
                    <img src={product.image} alt="" />
                    <div className='cart-items-item-description'>
                    <h3>{product.name} </h3>
                    <p>{variant ? `Varian: ${variant.varianName}` : ''}</p>
                    <p>{qty} x {price.toLocaleString("id-ID")}</p>
                    
                    </div>
                    <div className='cart-items-item-details'>
                    <p>Rp. {(price * qty).toLocaleString("id-ID")}</p>
                    
                    
                    </div>
                    
                    {/* <p>{qty}</p>
                    <p className='price-item'>Rp. {(price * qty).toLocaleString("id-ID")}</p>
                    <p onClick={() => removeFromCart(itemKey)} className='delete-item'><FontAwesomeIcon icon={faTrash} /></p> */}
                  </div>
                  <hr />
                </div>
              );
            })}


        
        </div>
        <div className="cart-total">
          <h2>Total Belanja</h2>
          <div className="cart-total-details">
            <p>Sub Total ( {quantityItem()} items ) </p>
            <p>{getTotalCartAmount()}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Diskon</p>
            <p>{getTotalCartAmount()===0?0:0}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <p>Rp. {getTotalCartAmount()===0?0:(getTotalCartAmount()- 0).toLocaleString("id-ID")}</p>
          </div>
          <div className='cart-total-button'>
          <button onClick={() => navigate('/order')}
            disabled={isCartEmpty}
            style={{ opacity: isCartEmpty ? 0.5 : 1, cursor: isCartEmpty ? 'not-allowed' : 'pointer' }}><FontAwesomeIcon icon={faTruckFast}/> CHECKOUT</button>
          </div>
          
        </div>
      </div>
      
       
      <div className="cart-bottom">
        
        {/* VOUCHER DISKON */}
        <div className="cart-promocode">
          
          <div>
            <p>VOUCHER DISKON</p>
            <div>
              <div className="cart-promocode-input">
                <input type="text" placeholder='Kode Voucher' />
                <button>Apply</button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      <div className="cart-total-float">
        <div>
          <p>Total ({quantityItem()} items):</p>
          <p>Rp. {getTotalCartAmount().toLocaleString("id-ID")}</p>
        </div>
        <div className='cart-total-button'>
        <button
          
          onClick={() => navigate('/order')}
          disabled={isCartEmpty}
          style={{
            opacity: isCartEmpty ? 0.5 : 1, cursor: isCartEmpty ? 'not-allowed' : 'pointer'
          }}
        >
          <FontAwesomeIcon icon={faTruckFast}/> CHECKOUT
        </button>
        </div>
        
      </div>
    </div>
  )
}

export default Cart