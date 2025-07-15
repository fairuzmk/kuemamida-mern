import React, { useContext, useState } from 'react'
import './PlaceOrder.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../../context/StoreContext'




  const shippingOptions = [
  { value: 'pickup', label: '', jarak:'Ambil di Tempat', cost: 0 },
  { value: 'cod-0', label: 'Kurir Custom : ', jarak:'< 2km' , cost: 0 },
  { value: 'cod-20', label: 'Kurir Custom : ',jarak:'2-4km', cost: 20000 },
  { value: 'cod-35', label: 'Kurir Custom : ', jarak:'> 4km', cost: 35000 },
  ];


const PlaceOrder = () => {

const {getShippingCost, getTotalCartAmount, quantityItem} = useContext(StoreContext);

  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);


  return (
    <form action="" className="place-order">
      <div className="place-order-left">
        <p className="title">Informasi Pengiriman</p>
        
        <div className="multi-fields">
          <input type="text" placeholder='Nama Penerima' />
        </div>
        <input type="text" placeholder='Nomor HP (Whatsapp)'/>
        <div className="form-select">
          
          <select
            placeholder="Pilih Metode Pengiriman"
            value={selectedShipping.value}
            onChange={(e) => {
              const selected = shippingOptions.find(opt => opt.value === e.target.value);
              setSelectedShipping(selected);
            }}
          >
            {shippingOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} {option.jarak} - Rp{option.cost.toLocaleString("id-ID")}
              </option>
            ))}
          </select>
        </div>
        <textarea type="text" placeholder='Alamat Lengkap'/>
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Total Belanja</h2>
          <div className="cart-total-details">
            <p>Sub Total ( {quantityItem()} items ) </p>
            <p>Rp {getTotalCartAmount().toLocaleString("id-ID")}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Ongkos Kirim ({selectedShipping.jarak})</p>
            <p>Rp. {selectedShipping.cost.toLocaleString("id-ID")}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <p>Rp. {(getTotalCartAmount()+selectedShipping.cost).toLocaleString("id-ID")}</p>
          </div>
          <button ><FontAwesomeIcon icon={faCreditCard}/> PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder