import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './VerifyPage.css';
import { StoreContext } from '../../context/StoreContext';

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

   const {url} = useContext(StoreContext);


  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${url}/api/order/${orderId}`);
        if (res.data.success) {
          setOrder(res.data.order);
        } else {
          setError("Gagal memuat detail pesanan.");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat detail pesanan.");
      } finally {
        setLoading(false);
      }
    };

    if (success && orderId) {
      fetchOrder();
    } else {
      setLoading(false);
      setError("Parameter tidak valid.");
    }
  }, [success, orderId]);

  if (loading) return <div className="verify-container">Memuat...</div>;
  if (error) return <div className="verify-container error">{error}</div>;

  return (
    <div className="verify-container">
      <h2>{success ? "Pesanan Berhasil Dibuat!" : "Pesanan Gagal"}</h2>
      {order && (
        <div className="order-summary">
          <p><strong>ID Pesanan:</strong> {order._id}</p>
          <p><strong>Nama Penerima:</strong> {order.address?.name}</p>
          <p><strong>Nomor HP:</strong> {order.address?.phone}</p>
          <p><strong>Alamat:</strong> {order.address?.detail}</p>
          <p><strong>Metode Pengiriman:</strong> {order.shipping_method}</p>
          <p><strong>Ongkir:</strong> Rp{order.shipping_fee.toLocaleString("id-ID")}</p>
          <p><strong>Total:</strong> Rp{(order.amount + order.shipping_fee).toLocaleString("id-ID")}</p>

          <h3>Rincian Item:</h3>
          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.name} ({item.variant || 'default'}) x {item.quantity} - Rp{item.price.toLocaleString("id-ID")}
              </li>
            ))}
          </ul>

          <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
            Silakan transfer manual sesuai total, lalu hubungi admin untuk konfirmasi pembayaran.
          </p>
        </div>
      )}
    </div>
  );
};

export default VerifyPage;
