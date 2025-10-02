import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTruckFast } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
 import { useEffect, useState } from 'react';
 import axios from 'axios';

const Cart = () => {

  const {cartItems, food_list, addToCart,removeFromCart, getTotalCartAmount, getShippingCost, quantityItem, url, cartBundles, incBundleQty, decBundleQty} = useContext(StoreContext)

  const navigate = useNavigate();


   const [bundleAmounts, setBundleAmounts] = React.useState(0);
  useEffect(() => {
     let cancelled = false;
     (async () => {
       if (!cartBundles?.length) { if (!cancelled) setBundleAmounts({}); return; }
       try {
         const results = await Promise.all(
           cartBundles.map(b =>
             axios.post(`${url}/api/hamper/preview`, {
               bundleId: b.bundleId,
               quantity: b.quantity,
               selections: b.selections,
             }).then(r => ({ id: b.id, amount: r.data?.success && r.data?.valid ? Number(r.data.amount || 0) : 0 }))
           )
         );
         if (!cancelled) {
           const map = {};
           results.forEach(r => { map[r.id] = r.amount; });
           setBundleAmounts(map);
         }
       } catch {
         if (!cancelled) setBundleAmounts({});
       }
     })();
     return () => { cancelled = true; };
   }, [cartBundles, url]);

  const isCartEmpty = Object.values(cartItems).every(qty => qty === 0) && (!cartBundles || cartBundles.length === 0);

  const bundlesSubtotal = Object.values(bundleAmounts).reduce((a, n) => a + (n || 0), 0);

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
                    <p>Stock: {variant.varianStock}</p>
                    <div className='item-counter-cart-wrapper'>
                      <div className="item-counter-cart">
                        <FontAwesomeIcon icon={faMinus} onClick={() => removeFromCart(itemKey)} />
                        <p>{cartItems[itemKey] || 0}</p>
                        <FontAwesomeIcon icon={faPlus} onClick={() => addToCart(itemKey)} />
                        
                      </div>
                      
                    </div>

                    </div>
                    
                    <div className='cart-items-item-details'>
                    <p>Rp. {(price * qty).toLocaleString("id-ID")}</p>
                    
                    
                    
                    </div>
                    <ToastContainer position="bottom-center" autoClose={2000} />
                    {/* <p>{qty}</p>
                    <p className='price-item'>Rp. {(price * qty).toLocaleString("id-ID")}</p>
                    <p onClick={() => removeFromCart(itemKey)} className='delete-item'><FontAwesomeIcon icon={faTrash} /></p> */}
                  </div>
                  <hr />
                </div>
              );
            })}

 {/* === Bundles / Hampers === */}
{cartBundles && cartBundles.length > 0 && (
  <>
    <h3 style={{ marginTop: 12 }}>Paket Hampers</h3>
    <hr />
    {cartBundles.map((b) => {
      const perBundleAmount = bundleAmounts[b.id] ?? null; // total harga bundle (sudah x quantity)
      return (
        <div key={b.id}>
          <div className="cart-items-title cart-items-item">
            {/* Thumbnail/ikon */}
            <div style={{ width: 72, height: 72, background:"#f4f4f4", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
              🎁
            </div>

            <div className='cart-items-item-description'>
              <h3>Hampers #{String(b.bundleId).slice(-6)}</h3>

              <ul style={{ margin: "6px 0 8px", paddingLeft: "18px" }}>
                {b.selections.map((sel, i) => {
                  const prod = food_list.find(p => p._id === sel.foodId);
                  const vName = (sel.varianIndex != null && prod?.varians?.[sel.varianIndex]?.varianName)
                    ? ` (${prod.varians[sel.varianIndex].varianName})` : "";
                  return (
                    <li key={i}>
                      Slot {sel.slotIndex + 1}: {prod ? prod.name : sel.foodId}{vName}
                    </li>
                  );
                })}
              </ul>

              {/* Counter qty di bawah detail (seperti cartItems) */}
              <div className='item-counter-cart-wrapper'>
                <div className="item-counter-cart">
                  <button onClick={() => decBundleQty(b.id)}>-</button>
                  <p>{b.quantity}</p>
                  <button onClick={() => incBundleQty(b.id)}>+</button>
                </div>
              </div>
            </div>

            {/* Harga di sisi kanan */}
            <div className='cart-items-item-details'>
              {perBundleAmount == null ? (
                <p>menghitung...</p>
              ) : (
                <p>Rp. {perBundleAmount.toLocaleString("id-ID")}</p>
              )}
            </div>
          </div>
          <hr />
        </div>
      );
    })}
  </>
)}  

        
        </div>
        <div className="cart-total">
          <h2>Total Belanja</h2>
          <div className="cart-total-details">
            <p>Sub Total ( {quantityItem()} items ) </p>
            <p>Rp {(getTotalCartAmount() + bundlesSubtotal).toLocaleString("id-ID")}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Diskon</p>
            <p>{getTotalCartAmount()===0?0:0}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <p>Rp. {(getTotalCartAmount() + bundlesSubtotal).toLocaleString("id-ID")}</p>
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
          <p>Rp. {(getTotalCartAmount() + bundlesSubtotal).toLocaleString("id-ID")}</p>
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