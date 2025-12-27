import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCreditCard, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaMoneyBill, FaMoneyCheck, FaTruck } from 'react-icons/fa';







const PlaceOrder = () => {
  const navigate = useNavigate();

  const {getTotalCartAmount, quantityItem, cartItems, food_list, url, options, fetchOptions, setCartItems, token, cartBundles, voucher,
    getDiscount, setCartBundles, loadCartData} = useContext(StoreContext);

  
   const [user, setUser] = useState({ name: "", address: "", phone:"" });

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
  
      try {
        const res = await axios.get(`${url}/api/user-new/account`, {
          headers: { token }
        });
  
        if (res.data.success && res.data.user?.name) {
          setUser(res.data.user);
        } else {
          throw new Error("INVALID_USER");
        }
      } catch (err) {
        console.warn("User not authenticated, clearing token");
  
        // 🔥 TOKEN TIDAK VALID → ANGKAT STATUS LOGIN
        localStorage.removeItem("token");
        localStorage.removeItem("cartItems");
        setUser({ name: "", address: "", phone: "" });
  
        alert("Silahkan login terlebih dahulu");
        setShowLogin(true);
      }
    };
    fetchUser();
  }, [token]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState( {value: "", label: "", price: 0});

  const [payment_method, setPaymentMethod] = useState({ value: "Transfer" });

  const [deliveryDate, setDeliveryDate] = useState("");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState('');

  

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true); // mulai loading
  
    const token = localStorage.getItem("token");
    if (!token || !user?.name) {
      alert("Silahkan login terlebih dahulu");
      setShowLogin(true);
      return;
    }
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
  
    // Langkah 2: Buat payload hanya dari item valid (produk biasa)
      const items = Object.entries(cleanedCartItems)
      .map(([key, qty]) => {
        const [productId, variantName] = key.split('_');
        const product = food_list.find(p => p._id === productId);
        if (!product) return null;

        // cari index varian numerik (biar backend bisa akses v[varianIndex])
        const varianIndex = product.varians?.findIndex(v => v.varianName === variantName);
        const hasVarian = typeof varianIndex === "number" && varianIndex >= 0;

        return {
          type: "single",
          productId,                          // <-- WAJIB: kirim ObjectId asli
          quantity: qty,
          ...(hasVarian ? { varianIndex } : {}) // opsional; kirim hanya jika varian ada
        };
      })
      .filter(Boolean);
  
      const bundles = (cartBundles || []).map(({ _key, id, ...b }) => ({
        bundleId: b.bundleId,
        name: b.name,
        image: b.image,
        quantity: b.quantity,
        selections: b.selections,
      }));
      
      if (items.length === 0 && bundles.length === 0) {
        alert("Tidak ada item valid di keranjang.");
        setIsLoading(false);
        return;
      }

    // NEW: validasi tanggal pengiriman (opsional tapi disarankan)
    if (!deliveryDate) {
      alert("Silakan pilih tanggal pengiriman.");
      setIsLoading(false);
      return;
    }

    // NEW: VOUCHER — hitung subtotal & diskon dari context
    const subtotal = Number(getTotalCartAmount() || 0);
    const discount = Number(getDiscount ? getDiscount() : 0);
    const ship = Number(selectedShipping.price || 0);


    const payload = {
      items,
      bundles,
      amount: subtotal,               // subtotal sebelum ongkir & diskon (kalau kamu memang memakainya)
      shipping_fee: ship,
      shipping_method: selectedShipping.value,
      payment_method: payment_method.value,
      address: {
        name: user.name,
        phone: user.phone,
        detail: user.address,
      },
      delivery_date: deliveryDate,
      note,
      // NEW: VOUCHER — sertakan voucher ke payload
      voucherCode: voucher?.code || null,
      voucherDiscount: discount || 0, // opsional; server sebaiknya tetap re-validate
      clientSubtotal: subtotal,       // opsional; untuk logging/diagnostik
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
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



  const paymentMethod = [
    { value: "Transfer", label: "Transfer Bank", icon: <FaMoneyCheck /> },
    { value: "COD", label: "Bayar di tempat", icon: <FaMoneyBill /> }
  ];

  

  return (
    <form action="" className="place-order" onSubmit={handlePlaceOrder}>
      <div className="place-order-left">
        <p className="title">Informasi Pengiriman</p>
        
        <div className="multi-fields">
        <h4 className="label">Nama Pemesan</h4>
        <input
            required
            type="text"
            placeholder='Nama Penerima'
            value={user.name??""}
            onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <h4 className="label">Nomor HP</h4>
        <input
            type="text"
            placeholder='Nomor HP (Whatsapp)'
            value={user.phone??""}
            onChange={(e) => setUser(prev => ({ ...prev, phone: e.target.value }))}
          />

        {/* Metode Pembayaran */}
          <div className="payment-method">
            <h4 className="label">Pilih Metode Pembayaran</h4>
            <div className="radio-group">
              {paymentMethod.map((method) => (
                <label
                  key={method.value}
                  className={`radio-card ${
                    payment_method.value === method.value ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={payment_method.value === method.value}
                    onChange={() => setPaymentMethod({ value: method.value })}
                  />
                  <div className="icon">{method.icon}</div>
                  <span className="method-label">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Metode Pengiriman */}
          <h4 className="label">Pilih Metode Pengiriman</h4>
          <div className="form-select"> <select required placeholder="Pilih Metode Pengiriman" value={selectedShipping.value} onChange={(e) => { const selected = options.shipping.find(opt => opt.value === e.target.value); if (selected) setSelectedShipping(selected); }} > <option value="" disabled> Pilih Metode Pengiriman </option> {options.shipping.map((option) => ( <option key={option.value} value={option.value}> {option.label} - Rp{option.price ? option.price.toLocaleString("id-ID") : 0} </option> ))} </select> </div>
        {/* NEW: Tanggal Pengiriman */}
          <h4 className="label">Tanggal Pengiriman</h4>
          <input
            type="date"
            required
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]} // supaya tidak bisa pilih tanggal sebelum hari ini
          />
          <h4 className="label">Alamat Lengkap</h4>
        <textarea
          placeholder='Alamat Lengkap'
          value={user.address??""}
          onChange={(e) => setUser({ ...user, address: e.target.value })}
        />
        {/* NEW: Catatan Tambahan */}
        <h4 className="label">Catatan Tambahan</h4>
        <textarea
          placeholder="Masukkan Request atau Catatan untuk Pesanan Anda"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Total Belanja</h2>

          <div className="cart-total-details">
            <p>Sub Total ({quantityItem()} items)</p>
            <p>Rp {getTotalCartAmount().toLocaleString("id-ID")}</p>
          </div>

          {/* NEW: VOUCHER — tampilkan jika ada diskon */}
          {Number(getDiscount ? getDiscount() : 0) > 0 && (
            <>
              <hr />
              <div className="cart-total-details">
                <p>Diskon Voucher {voucher?.code ? `(${voucher.code})` : ""}</p>
                <p>- Rp {Number(getDiscount()).toLocaleString("id-ID")}</p>
              </div>
            </>
          )}

          <hr />
          <div className="cart-total-details">
            <p>Ongkos Kirim</p>
            <p>Rp {Number(selectedShipping.price || 0).toLocaleString("id-ID")}</p>
          </div>

          <div className="cart-total-details">
            <span style={{ color: "#666", fontSize: 12 }}>{selectedShipping.value}</span>
          </div>

          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <p>
              Rp{" "}
              {(
                Number(getTotalCartAmount() || 0) -
                Number(getDiscount ? getDiscount() : 0) +
                Number(selectedShipping.price || 0)
              ).toLocaleString("id-ID")}
            </p>
          </div>

          <div className='cart-total-button'>
            <button type='submit' disabled={isLoading}>
              <FontAwesomeIcon icon={faCreditCard}/> {isLoading ? "Processing.." : "PROCEED TO PAYMENT"}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder