import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './MyOrders.css';
import { StoreContext } from '../../context/StoreContext';

const MyOrders = () => {
  const [invoice, setInvoice] = useState([])
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

 


  const getStatusClass = (value) => {
    const status = value;
  
    if (status === 'Selesai' || status === 'Selesai') return 'order-status success';
    if (status === 'Pesanan Baru' || status === 'Pesanan Baru') return 'order-status pending';
    if (status === 'Diproses' || status === 'Diproses') return 'order-status process';
    if (status === 'Dibatalkan' || status === 'Dibatalkan') return 'order-status failed';
  
    return 'order-status ';
  };

  const getPaymentStatus = (value) => {

    const payment = value;
  
    if (payment === true) 
      return 'order-status success';
    
    if (payment === false) 
      return 'order-status failed';
  
    return 'order-status ';

  };
  

  return (
    <div className="my-orders">
      <h1>My Orders</h1>
      {error && <p className="error">{error}</p>}
      {orders.length === 0 && <p>Belum ada pesanan.</p>}
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          
          <div className="order-id">
          <p><strong>{order.invoiceCode? order.invoiceCode: order._id} </strong> ({new Date(order.date).toLocaleDateString('id-ID')})</p>

          </div>
          <div className="order-details">
          <div className="order-left">
            <img src={order.items[0]?.image || '/food-package.png'} alt="produk" />
            <div className="order-info">
              
              <p><strong>Pesanan: </strong></p>
              <ul>
              {order.items.map((item, idx) => (
              <li key={idx}>{item.name} ({item.variant || 'Original'}) x {item.quantity}</li>
              ))}
              </ul>
                           
              <p>
                <strong>Status Pesanan:</strong> 
                <span className={getStatusClass(order.status || 'Pending')}>
                  {order.status || 'Pending'}
                </span>
              </p>

              <p>
                <strong>Status Pembayaran:</strong> 
                <span className={getPaymentStatus(order.payment)}>{order.payment === true ? 'Sudah Dibayar' :
                order.payment === false ? 'Menunggu Pembayaran' :
                'Tidak Diketahui'}</span>
              </p>

                    
            </div>
          </div>

          <div className='order-right'>
            <div className="order-actions">
              <div className="order-total">Rp {(order.amount + order.shipping_fee).toLocaleString("id-ID")}</div>
              
              
            </div>
            <div>
              <button className="primary">Detail Transaksi</button>
            </div>
            
          </div>
          </div>
          
        </div>
      ))}

    </div>
  );
};

export default MyOrders;
