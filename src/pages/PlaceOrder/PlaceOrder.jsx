import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';








const PlaceOrder = () => {
  const navigate = useNavigate();

  const {getTotalCartAmount, quantityItem, cartItems, food_list, url, options, fetchOptions, setCartItems} = useContext(StoreContext);

  useEffect(() => {
    fetchOptions();
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState( {value: "", label: "", price: 0});
  const [payment_method, setPaymentMethod] = useState({ value: "" });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true); // mulai loading
  
    const token = localStorage.getItem("token");
  
    // Langkah 1: Bersihkan cart dari item yang tidak valid
    const cleanedCartItems = Object.fromEntries(
      Object.entries(cartItems).filter(([key]) => {
        const [productId] = key.split('_');
        return food_list.find(p => p._id === productId);
      })
    );
  
    // Update localStorage dan state (jika kamu pakai useState)
    localStorage.setItem("cartItems", JSON.stringify(cleanedCartItems));
    setCartItems(cleanedCartItems); // <-- pakai ini kalau pakai useState
  
    // Langkah 2: Buat payload hanya dari item valid
    const items = Object.entries(cleanedCartItems)
      .map(([key, qty]) => {
        const [productId, variant] = key.split('_');
        const product = food_list.find(p => p._id === productId);
        if (!product) return null;
  
        const selectedVar = product.varians?.find(v => v.varianName === variant);
  
        const varianIndex = product.varians?.findIndex(v => v.varianName === variant);

        return {
          _id: selectedVar ? `${productId}_${varianIndex}` : productId,
          itemId: productId,
          name: product.name,
          quantity: qty,
          price: selectedVar ? selectedVar.varianPrice : product.price,
          variant: selectedVar?.varianName || null,
        };
      })
      .filter(item => item !== null);
  
    if (items.length === 0) {
      alert("Tidak ada item valid di keranjang.");
      return;
    }
  
    const payload = {
      items,
      amount: getTotalCartAmount(),
      shipping_fee: selectedShipping.price,
      shipping_method: selectedShipping.value,
      payment_method: payment_method.value,
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
    finally {
      setIsLoading(false); // selesai loading
    }
  };
  

  return (
    <form action="" className="place-order" onSubmit={handlePlaceOrder}>
      <div className="place-order-left">
        <p className="title">Informasi Pengiriman</p>
        
        <div className="multi-fields">
        <input
            required
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
            required
            placeholder="Pilih Metode Pengiriman"
            value={payment_method.value}
            onChange={(e) => setPaymentMethod({ value: e.target.value })}
            
          >
            <option value="" disabled>
              Pilih Metode Pembayaran
            </option>
            <option value="Transfer">Transfer</option>
            <option value="COD">COD (Bayar di Tempat)</option>
            
          </select>


        </div>
        <div className="form-select">
          
          <select
            required
            placeholder="Pilih Metode Pengiriman"
            value={selectedShipping.value}
            onChange={(e) => {
              const selected = options.shipping.find(opt => opt.value === e.target.value);
              if (selected) setSelectedShipping(selected);
            }}
          >
            <option value="" disabled>
              Pilih Metode Pengiriman
            </option>
            {options.shipping.map((option) => (
              <option key={option.value} value={option.value}>
              {option.label} - Rp{option.price ? option.price.toLocaleString("id-ID") : 0}
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
            <p>Ongkos Kirim </p>
            <p>Rp. {selectedShipping.price.toLocaleString("id-ID")}</p>
          </div>
          <div className="cart-total-details">
          {selectedShipping.value}
          </div>
          
          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <p>Rp. {(getTotalCartAmount()+selectedShipping.price).toLocaleString("id-ID")}</p>
          </div>
          <div className='cart-total-button'>
          <button type='submit' disabled={isLoading}><FontAwesomeIcon icon={faCreditCard}/> {isLoading?("Processing.."):("PROCEED TO PAYMENT")} </button>
          </div>
          
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder