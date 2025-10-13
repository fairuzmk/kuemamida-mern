import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, useLocation } from "react-router-dom";
import StoreContextProvider from "./context/StoreContext.jsx";

/* === NProgress + Axios (global, sekali pasang di sini) === */
import axios from "axios";
import NProgress from "nprogress";
import "nprogress/nprogress.css";   // default styles
import "./nprogress-theme.css";     // overrides, harus setelahnya
import React from "react";

NProgress.configure({ showSpinner: false, trickleSpeed: 120, minimum: 0.08 });

let __pending = 0;
const start = () => { if (__pending === 0) NProgress.start(); __pending++; };
const done  = () => { __pending = Math.max(0, __pending - 1); if (__pending === 0) NProgress.done(); };

axios.interceptors.request.use(
  (cfg) => { start(); return cfg; },
  (err) => { done(); return Promise.reject(err); }
);
axios.interceptors.response.use(
  (res) => { done(); return res; },
  (err) => { done(); return Promise.reject(err); }
);

// Pastikan kalau ada axios.create() di mana pun, ikut terpasang
const _create = axios.create;
axios.create = function patchedCreate(cfg) {
  const inst = _create(cfg);
  inst.interceptors.request.use(
    (c) => { start(); return c; },
    (e) => { done(); return Promise.reject(e); }
  );
  inst.interceptors.response.use(
    (r) => { done(); return r; },
    (e) => { done(); return Promise.reject(e); }
  );
  return inst;
};
/* === selesai setup NProgress === */

/* (Opsional) Progress saat ganti halaman tanpa data router */
function RouteChangeNProgress() {
  const { pathname } = useLocation();
  // Mulai ketika path berubah; auto-selesai cepat.
  React.useEffect(() => {
    NProgress.start();
    const t = setTimeout(() => NProgress.done(), 220);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StoreContextProvider>
      {/* Opsional: tampilkan bar saat pindah route */}
      <RouteChangeNProgress />
      <App />
    </StoreContextProvider>
  </BrowserRouter>
);
