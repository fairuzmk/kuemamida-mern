import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const ProtectedRoute = ({ children }) => {
  const { cartItems, cartBundles } = useContext(StoreContext);

  // Snapshot bundling: pakai context dulu; kalau kosong, fallback localStorage
  const bundlesSnap = Array.isArray(cartBundles) && cartBundles.length
    ? cartBundles
    : (() => {
        try {
          const raw = localStorage.getItem('cartBundles');
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      })();

  const hasSingle = Object.values(cartItems || {}).some(qty => Number(qty) > 0);
  const hasBundle = bundlesSnap.length > 0;

  if (!(hasSingle || hasBundle)) {
    return <Navigate to="/cart" replace />;
  }

  return children;
};

export default ProtectedRoute;
