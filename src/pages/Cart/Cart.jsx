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

  const {cartItems, food_list, addToCart,removeFromCart, getTotalCartAmount, quantityItem, url, cartBundles, incBundleQty, decBundleQty, getRemainingQty, canIncreaseBundleOne} = useContext(StoreContext)

  const navigate = useNavigate();


  const [bundleAmounts, setBundleAmounts] = React.useState({});

  useEffect(() => {
    let cancelled = false;
  
    (async () => {
      if (!cartBundles?.length) {
        if (!cancelled) setBundleAmounts({});
        return;
      }
  
      try {
        const results = await Promise.all(
          cartBundles.map((b) => {
            const key = stableBundleKey(b);
            // ⬇️ RETURN the promise
            return axios
              .post(`${url}/api/hamper/preview`, {
                bundleId: b.bundleId,
                quantity: b.quantity,
                selections: b.selections,
              })
              .then((r) => ({
                key,
                amount:
                  r.data?.success && r.data?.valid
                    ? Number(r.data.amount || 0)
                    : 0,
              }))
              .catch(() => ({ key, amount: 0 })); // guard per request
          })
        );
  
        if (!cancelled) {
          const map = {};
          for (const r of results) map[r.key] = r.amount;
          setBundleAmounts(map);
        }
      } catch {
        if (!cancelled) setBundleAmounts({});
      }
    })();
  
    
    return () => {
      cancelled = true;
    };
  }, [cartBundles, url]);

  const isCartEmpty = Object.values(cartItems).every(qty => qty === 0) && (!cartBundles || cartBundles.length === 0);


// ==== KEY HELPERS (letakkan di atas function Cart) ====
const stableBundleKey = (b) => {
  const id = b?.bundleId || b?._id || "";
  const sig = (b?.selections || [])
    .map(sel => `${sel.foodId || sel.id}_${sel.varianIndex ?? ""}_${sel.slotIndex ?? ""}`)
    .sort()
    .join("|");
  // tidak memasukkan quantity agar key tidak berubah saat qty berubah
  return `bundle:${id}:${sig}`;
};

  

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
              // index varian & sisa stok realtime (single + bundling)
              const varIdx = variant
                ? (product.varians || []).findIndex(v => v.varianName === variant.varianName)
                 : undefined;
              const remaining = getRemainingQty(product._id, Number.isInteger(varIdx) ? varIdx : undefined);

              return (
                <div key={`item:${itemKey}`}>
                  <div className="cart-items-title cart-items-item">
                    <img src={product.image} alt="" />
                    <div className='cart-items-item-description'>
                    <h3>{product.name} </h3>
                    <p>{variant ? `Varian: ${variant.varianName}` : ''}</p>
                    <p>{qty} x {price.toLocaleString("id-ID")}</p>
                     <p>
                       Stock: {variant ? remaining : product.stock}
                       <span style={{ marginLeft: 8, color: "#888" }}></span>
                     </p>
                    <div className='item-counter-cart-wrapper'>
                      <div className="item-counter-cart">
                        <FontAwesomeIcon icon={faMinus} onClick={() => removeFromCart(itemKey)} />
                             <p>{cartItems[itemKey] || 0}</p>
                             <button
                               type="button"
                               onClick={() => addToCart(itemKey)}
                               disabled={remaining <= 0}
                               title={remaining <= 0 ? "Stok habis" : "Tambah 1"}
                               style={{ opacity: remaining <= 0 ? 0.5 : 1, cursor: remaining <= 0 ? "not-allowed" : "pointer", background: "transparent", border: "none", padding: 0 }}
                             >
                               <FontAwesomeIcon icon={faPlus} />
                             </button>
                        
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
                <h3 style={{ marginTop: 12 }}>Paket Bundling</h3>
                <hr />
                {(() => {
                  // counter per bundleId
                  const numbering = new Map();
                  return cartBundles.map((b) => {
                    const k = stableBundleKey(b);
                    const perBundleAmount = bundleAmounts[k] ?? null;
                    const current = (numbering.get(b.bundleId) || 0) + 1;
                    numbering.set(b.bundleId, current);

                    const displayName = `${b.name || "Hampers"} #${current}`;
                    const canInc = canIncreaseBundleOne(b);
                    return (
                      <div key={k}>
                        <div className="cart-items-title cart-items-item">
                          <div className='hamper-image-box'>
                            <img src={b.image} alt="" />
                          </div>

                          <div className='cart-items-item-description'>
                            <h3>{displayName}</h3>

                            <ul className='item-list-hampers'>
                              {b.selections.map((sel, i) => {
                                const prod = food_list.find(p => p._id === sel.foodId);
                                const vName = (sel.varianIndex != null && prod?.varians?.[sel.varianIndex]?.varianName)
                                  ? ` (${prod.varians[sel.varianIndex].varianName})` : "";
                                return (
                                  <li key={i}>
                                    Item {sel.slotIndex + 1} : {prod ? prod.name : sel.foodId}{vName}
                                  </li>
                                );
                              })}
                            </ul>

                            <div className='item-counter-cart-wrapper'>
                              <div className="item-counter-cart">
                              <FontAwesomeIcon icon={faMinus} onClick={() => decBundleQty(b.id)}/>
                                <p>{b.quantity}</p>
                                 <button
                                   type="button"
                                   onClick={() => incBundleQty(b.id)}
                                   disabled={!canInc}
                                   title={!canInc ? "Stok tidak mencukupi untuk menambah paket" : "Tambah 1"}
                                   style={{ opacity: !canInc ? 0.5 : 1, cursor: !canInc ? "not-allowed" : "pointer", background: "transparent", border: "none", padding: 0 }}
                                 >
                                   <FontAwesomeIcon icon={faPlus} />
                                 </button>
                              </div>
                            </div>
                          </div>

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
                  });
                })()}
              </>
            )}


        
        </div>
        <div className="cart-total">
          <h2>Total Belanja</h2>
          <div className="cart-total-details">
            <p>Sub Total ( {quantityItem()} items ) </p>
            {/* <p>Sub Total </p> */}
            <p>Rp {(getTotalCartAmount()).toLocaleString("id-ID")}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Diskon</p>
            <p>{getTotalCartAmount()===0?0:0}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <p>Rp. {(getTotalCartAmount()).toLocaleString("id-ID")}</p>
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
          <p>Rp. {(getTotalCartAmount()).toLocaleString("id-ID")}</p>
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