import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const ProtectedRoute = ({ children }) => {
  const { cartItems } = useContext(StoreContext);

  // Cek apakah ada item di cart dengan quantity > 0
  const hasItemInCart = Object.values(cartItems).some(qty => qty > 0);

  if (!hasItemInCart) {
    // Redirect ke halaman /cart kalau keranjang kosong
    return <Navigate to="/cart" replace />;
  }

  return children;
};

export default ProtectedRoute;