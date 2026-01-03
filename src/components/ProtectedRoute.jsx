import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';


import { useLocation } from "react-router-dom";


const ProtectedRoute = ({ children }) => {
  const { cartItems, cartBundles,token,setShowLogin, user, userLoading } = useContext(StoreContext);
  const location = useLocation();
  const isNameIncomplete = (name) =>
    !name || name.trim() === "" || name === "Pengguna WA";
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
  if (userLoading) return null;
  if (!(hasSingle || hasBundle)) {
    return <Navigate to="/cart" replace />;
  }

  useEffect(() => {
    if (!token) {
      setShowLogin(true);
    }
  }, [token, setShowLogin]);

  if (!token) {
    return null; // ⛔ tahan halaman, popup login yang tampil
  }

  if (
    isNameIncomplete(user?.name) &&
    location.pathname !== "/my-account"
  ) {
    return (
      <Navigate
        to="/my-account"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
