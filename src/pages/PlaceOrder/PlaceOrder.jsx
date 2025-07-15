import React, { useContext, useState } from 'react'
import './PlaceOrder.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';





  const shippingOptions = [
  { value: 'pickup', label: '', jarak:'Ambil di Tempat', cost: 0 },
  { value: 'cod-0', label: 'Kurir Custom : ', jarak:'< 2km' , cost: 0 },
  { value: 'cod-20', label: 'Kurir Custom : ',jarak:'2-4km', cost: 20000 },
  { value: 'cod-35', label: 'Kurir Custom : ', jarak:'> 4km', cost: 35000 },
  ];


const PlaceOrder = () => {
  const navigate = useNavigate();

  const {getTotalCartAmount, quantityItem, cartItems, food_list, url} = useContext(StoreContext);

  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handlePlaceOrder = async (e) => {
      e.preventDefault();
    
      const token = localStorage.getItem("token"); // asumsinya token disimpan di localStorage
    
      const payload = {
        items: Object.entries(cartItems).map(([key, qty]) => {
          const [productId, variant] = key.split('_');
          const product = food_list.find(p => p._id === productId);
          const selectedVar = product?.varians?.find(v => v.varianName === variant);
    
          return {
            itemId: productId,
            name: product.name,
            quantity: qty,
            price: selectedVar ? selectedVar.varianPrice : product.price,
            variant: selectedVar?.varianName || null,
          };
        }),
        amount: getTotalCartAmount(),
        shipping_fee: selectedShipping.cost,
        shipping_method: selectedShipping.value,
        payment_method: "manual_transfer",
        address: {
          name,
          phone,
          detail: address,
        }
      };
    
      try {
        const res = await axios.post(`${url}/api/order/place`, payload, {
          headers: { token }
        });
    
        if (res.data.success) {
          navigate(`/verify?success=true&orderId=${res.data.orderId}`);
        } else {
          alert("Gagal membuat order");
        }
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan");
      }
    };

  return (
    <form action="" className="place-order" onSubmit={handlePlaceOrder}>
      <div className="place-order-left">
        <p className="title">Informasi Pengiriman</p>
        
        <div className="multi-fields">
        <input
            type="text"
            placeholder='Nama Penerima'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <input
            type="text"
            placeholder='Nomor HP (Whatsapp)'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
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
        <textarea
          placeholder='Alamat Lengkap'
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
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
          <div className='cart-total-button'>
          <button type='submit'><FontAwesomeIcon icon={faCreditCard}/> PROCEED TO PAYMENT</button>
          </div>
          
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder