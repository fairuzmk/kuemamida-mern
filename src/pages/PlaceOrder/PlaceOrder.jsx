import React, { useContext } from 'react'
import './PlaceOrder.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../../context/StoreContext'

const PlaceOrder = () => {

  const {getShippingCost, getTotalCartAmount, quantityItem} = useContext(StoreContext);

  return (
    <form action="" className="place-order">
      <div className="place-order-left">
        <p className="title">Informasi Pengantaran</p>
        <div className="multi-fields">
          <input type="text" placeholder='Nama Penerima' />
        </div>
        <input type="text" placeholder='Nomor HP (Whatsapp)'/>

        <textarea type="text" placeholder='Alamat Lengkap'/>
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Total Belanja</h2>
          <div className="cart-total-details">
            <p>Sub Total ( {quantityItem()} items ) </p>
            <p>{getTotalCartAmount()}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Ongkos Kirim</p>
            <p>{getShippingCost()}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <p>Rp. {(getTotalCartAmount()+getShippingCost()).toLocaleString("id-ID")}</p>
          </div>
          <button ><FontAwesomeIcon icon={faCreditCard}/> PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder