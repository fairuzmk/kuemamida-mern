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
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item,index)=> {
          if(cartItems[item._id]>0){
            return(
              <div>
              <div className="cart-items-title cart-items-item">
                <img src={url+ "/images/" + item.image} alt="" />
                <p>{item.name}</p>
                <p>Rp. {item.price.toLocaleString("id-ID")}</p>
                <p>{cartItems[item._id]}</p>
                <p className='price-item'>Rp. {(item.price * cartItems[item._id]).toLocaleString("id-ID")}</p>
                <p onClick={()=>removeFromCart(item._id)} className='delete-item'><FontAwesomeIcon icon={faTrash}/></p>

              </div>
              <hr />
              
              </div>
              
            )
            
          }

        })
        
        }

       
      </div>
       <div className="cart-items-total">

        <p>Total </p>
        <p>Rp. {getTotalCartAmount().toLocaleString("id-ID")}</p>
        <p></p>

        </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Total Belanja</h2>
          <div className="cart-total-details">
            <p>Sub Total ( {quantityItem()} items ) </p>
            <p>{getTotalCartAmount()}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Ongkos Kirim</p>
            <p>{getTotalCartAmount()===0?0:getShippingCost()}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <p>Rp. {getTotalCartAmount()===0?0:(getTotalCartAmount()+getShippingCost()).toLocaleString("id-ID")}</p>
          </div>
          <button onClick={() => navigate('/order')}
            disabled={isCartEmpty}
            style={{ opacity: isCartEmpty ? 0.5 : 1, cursor: isCartEmpty ? 'not-allowed' : 'pointer' }}><FontAwesomeIcon icon={faTruckFast}/> CHECKOUT</button>
        </div>
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
      
    </div>
  )
}

export default Cart