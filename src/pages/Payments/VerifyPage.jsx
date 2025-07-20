import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './VerifyPage.css';
import { StoreContext } from '../../context/StoreContext';
import { FaFileInvoiceDollar, FaCopy } from "react-icons/fa";
import { IoBagCheck } from "react-icons/io5";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Lottie from 'lottie-react';
import checkCart from '../../assets/checkCart.json';
import loadingOrder from '../../assets/loadingOrder.json';


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

   const nomerRek = "8010763836";

   const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(nomerRek);
      
      toast.success("Nomer Rekening berhasil disalin!");
    } catch (err) {
      toast.error("Gagal menyalin: " + err.message);
    }
  };

  const handleCopyNominal = async () => {
    try {
      await navigator.clipboard.writeText(order.amount + order.shipping_fee);
      
      toast.success("Nominal berhasil disalin!");
    } catch (err) {
      toast.error("Gagal menyalin: " + err.message);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = order.invoiceImage;
    const fileName = `invoice_${order.invoiceCode}.jpg`;
    link.download = fileName; // atau .png, sesuai ekstensi
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="verify-container">
      <div className="verify-box">
      <div className="badge-verify">
        {order.status === "Pesanan Baru" ? (
          <Lottie animationData={loadingOrder} loop={true} style={{ width: '200px', height: '200px' }}/>
        ) : (
          <Lottie animationData={checkCart} loop={true} style={{ width: '200px', height: '200px' }}/>
        )}
        
       
        {/* <img src="/food-package.png" alt="Order Status" /> */}
      </div>
      <div className="paragraph-verify">
      <h2>{success ? "Pesanan Berhasil Dibuat!" : "Pesanan Gagal"}</h2>
      {order && (
        <div className="order-summary">
          <p><strong>ID Pesanan:</strong> {order.invoiceCode ? order.invoiceCode : order._id}</p>
          <p><strong>Nama Pemesan:</strong> {order.address?.name}</p>
          
          

          
          {order.status === "Pesanan Baru"
          ? (
            <>
          
          <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
            Silakan Menunggu Admin mengkonfirmasi pesanan anda
          </p>
          </> ) 
          : ( 
          <>
          <p className='total-order-verif'><strong>Total:</strong> Rp{(order.amount + order.shipping_fee).toLocaleString("id-ID")}</p>
          <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
            Silakan transfer via bank BCA dengan detail sebagai berikut :
          </p>

          <div className="bank-card">
            <img src="/logo-bca.png" alt="" />
            <table>
              <tbody>
              <tr>
                <td>Nama</td>
                <td>:</td>
                <td>Dini Rizkita Sari</td>
              </tr>
              <tr>
                <td>Rekening</td>
                <td>:</td>
                <td>{nomerRek} </td>
              </tr>
              <tr>
                <td>Nominal</td>
                <td>:</td>
                <td className='total-order-verif'>Rp {(order.amount + order.shipping_fee).toLocaleString("id-ID")}</td>
              </tr>
              </tbody>
            </table>
            <div className="copy-verify">
            <button className='button-blue' onClick={handleCopy}> <FaCopy/>  Rekening</button>
            <ToastContainer position="bottom-center" autoClose={2000} />
            <button className='button-green' onClick={handleCopyNominal}> <FaCopy/> Nominal</button>
                <ToastContainer position="bottom-center" autoClose={2000} />
                </div>
          </div>
          
          <div className="verify-end">
            <button className='button-blue' onClick={handleDownload}><FaFileInvoiceDollar/> Lihat Invoice</button>
            <button className="button-primary" onClick={() => { window.location.href = "/my-orders"}}><IoBagCheck/> My Orders</button>
          </div>
          </>
          
          )}
          

          
          
        </div>
      )}
      </div>
      
      

      </div>
      
    </div>
  );
};

export default VerifyPage;
