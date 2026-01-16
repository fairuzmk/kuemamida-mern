import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './MyOrders.css';
import { StoreContext } from '../../context/StoreContext';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const { url } = useContext(StoreContext);

  // --- TAMBAHAN STATE UNTUK SHOW MORE ---
  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };
  // --------------------------------------

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${url}/api/order/user`, { headers: { token } });
        if (res.data.success) {
          setOrders(res.data.orders || []);
        } else {
          setError(res.data.message || 'Gagal memuat riwayat pesanan');
        }
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan saat memuat data');
      }
    })();
  }, [url]);

  const getStatusClass = (status) => {
    if (status === 'Selesai') return 'order-status success';
    if (status === 'Pesanan Baru') return 'order-status pending';
    if (status === 'Diproses') return 'order-status process';
    if (status === 'Dibatalkan') return 'order-status failed';
    return 'order-status';
  };

  const getPaymentStatus = (paid) => {
    if (paid === true) return 'order-status success';
    if (paid === false) return 'order-status failed';
    return 'order-status';
  };

  const idr = (n) => `Rp ${(Number(n) || 0).toLocaleString('id-ID')}`;

  const getThumb = (order) =>
    order?.items?.[0]?.image ||
    order?.bundles?.[0]?.image ||
    order?.bundles?.[0]?.selections?.[0]?.image ||
    '/food-package.png';

  return (
    <div className="my-orders">
      <h1>My Orders</h1>
      {error && <p className="error">{error}</p>}
      {(!orders || orders.length === 0) && <p>Belum ada pesanan.</p>}

      {orders.map((order) => {
        // --- LOGIKA HITUNG JUMLAH ITEM ---
        const totalItems = (order.items || []).length + (order.bundles || []).length;
        const isExpanded = expandedOrders[order._id];
        // ---------------------------------

        return (
          <div key={order._id} className="order-card">
            <div className="order-id">
              <p>
                <strong>{order.invoiceCode ? order.invoiceCode : order._id}</strong>{' '}
                ({new Date(order.date || order.createdAt).toLocaleDateString('id-ID')})
              </p>
            </div>

            <div className="order-details">
              <div className="order-left">
                <img src={getThumb(order)} alt="produk" />

                <div className="order-info">
                  <p><strong>Pesanan:</strong></p>

                  {/* ===== Daftar Produk Single ===== */}
                  {(order.items || []).length > 0 && (
                    <ul className="order-lines">
                      {/* Hanya tampilkan jika expanded atau index < 2 */}
                      {order.items.slice(0, isExpanded ? order.items.length : 2).map((it, idx) => (
                        <li key={`i-${idx}`}>
                          {it.name} ({it.variant || 'Original'}) x {it.quantity}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* ===== Daftar Bundles / Hampers ===== */}
                  {(order.bundles || []).length > 0 && (
                    <ul className="order-lines">
                      {/* Logika: Jika items sudah ada 2, bundle jangan tampil kecuali expanded */}
                      {(isExpanded ? order.bundles : ((order.items || []).length < 2 ? order.bundles.slice(0, 2 - (order.items || []).length) : [])).map((b, bIdx) => {
                        const picks = b.selections || [];
                        const maxPreview = 3; 
                        return (
                          <li key={`b-${bIdx}`}>
                            <strong>[Bundling] {b.name}</strong>   x {b.quantity}
                            <ul className="order-bundle-items">
                              {picks.slice(0, maxPreview).map((s, sIdx) => (
                                <li key={`bs-${sIdx}`}>
                                  {s.foodName || s.foodId}
                                  {s.variant ? ` (${s.variant})` : ''} x {s.quantity}
                                </li>
                              ))}
                              {picks.length > maxPreview && (
                                <li>+{picks.length - maxPreview} item lainnya</li>
                              )}
                            </ul>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* --- TOMBOL SHOW MORE --- */}
                  {totalItems > 2 && (
                    <p 
                      className="show-more"
                      onClick={() => toggleExpand(order._id)}
                    >
                      {isExpanded ? "Less" : `+${totalItems - 2} item more...`}
                    </p>
                  )}

                  <p>
                    <strong>Status Pesanan:</strong>{' '}
                    <span className={getStatusClass(order.status || 'Pending')}>
                      {order.status || 'Pending'}
                    </span>
                  </p>

                  <p>
                    <strong>Status Pembayaran:</strong>{' '}
                    <span className={getPaymentStatus(order.payment)}>
                      {order.payment === true
                        ? 'Sudah Dibayar'
                        : order.payment === false
                        ? 'Menunggu Pembayaran'
                        : 'Tidak Diketahui'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="order-right">
                <div className="order-actions">
                  <div className="order-total">
                    {idr((order.amount || 0) + (order.shipping_fee || 0))}
                  </div>
                </div>
                <div>
                  <button
                    className="primary"
                    onClick={() =>
                      (window.location.href = `/verify?success=true&orderId=${order._id}`)
                    }
                  >
                    Detail Transaksi
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyOrders;