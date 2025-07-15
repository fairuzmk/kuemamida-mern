import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './MyOrders.css';
import { StoreContext } from '../../context/StoreContext';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const {url} = useContext(StoreContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${url}/api/order/user`, {
          headers: { token }
        });
        if (res.data.success) {
          setOrders(res.data.orders);
        } else {
          setError(res.data.message || "Gagal memuat riwayat pesanan");
        }
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan saat memuat data");
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="my-orders">
      <h2>Riwayat Pesanan Saya</h2>
      {error && <p className="error">{error}</p>}
      {orders.length === 0 && <p>Belum ada pesanan.</p>}
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <p><strong>ID Pesanan:</strong> {order._id}</p>
          <p><strong>Status:</strong> {order.status || 'Menunggu Pembayaran'}</p>
          <p><strong>Total:</strong> Rp {(order.amount + order.shipping_fee).toLocaleString("id-ID")}</p>
          <p><strong>Tanggal:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <h4>Item:</h4>
          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>{item.name} ({item.variant || 'Original'}) x {item.quantity}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
