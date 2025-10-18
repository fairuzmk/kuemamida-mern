import React, { useContext, useEffect, useMemo, useState } from "react";
import "./DetailPage.css";
import { StoreContext } from "../../context/StoreContext";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCartPlus } from "react-icons/fa6";

const DetailPage = () => {
  const { slugAndId } = useParams();
  const id = slugAndId.split("-").slice(-1)[0];
  const { food_list, cartItems, addToCart, getRemainingQty } = useContext(StoreContext);

  const product = food_list.find((item) => item._id === id);

  
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1); // counter lokal (tidak langsung ke cart)

   // index varian yang sedang dipilih (untuk helper stok realtime)
 const selectedVarIdx = useMemo(() => {
   if (!product || !selectedVariant) return undefined;
   return (product.varians || []).findIndex(v => v.varianName === selectedVariant.varianName);
 }, [product, selectedVariant]);
  // itemKey untuk cart single product
  const itemKey = useMemo(() => {
    if (!product) return null;
    if (selectedVariant) return `${product._id}_${selectedVariant.varianName}`;
    return null;
  }, [product, selectedVariant]);

  // set varian default saat product ready
  useEffect(() => {
    if (product?.varians?.length > 0) {
      setSelectedVariant(product.varians[0]);
      setQty(1);
    }
  }, [product]);

  // stok & sisa stok realtime (dikurangi cart single + bundling)
   const availableStock = selectedVariant?.varianStock ?? 0; // tampilkan stok varian mentah
   const remaining = getRemainingQty(product?._id, selectedVarIdx);

  const handleVariantChange = (varianName) => {
    const variant = product.varians.find((v) => v.varianName === varianName);
    if (variant) {
      setSelectedVariant(variant);
      setQty(1); // reset qty saat ganti varian
    }
  };

  const decQty = () => setQty((v) => Math.max(1, v - 1));
  const incQty = () => setQty((v) => (remaining > 0 ? Math.min(remaining, v + 1) : v));

  const handleAddToCart = async () => {
    if (!itemKey) return;
    if (remaining <= 0) return toast.warn("Stok varian habis atau sudah maksimal di keranjang");
  
    const toAdd = Math.min(qty, remaining);
    try {
      await addToCart(itemKey, toAdd);   // <-- cukup sekali, bukan loop 3x
      toast.success(`Ditambahkan ${toAdd} item ke keranjang`);
    } catch {
      toast.error("Gagal menambahkan ke keranjang");
    }
  };

  if (!food_list.length) return <div>Memuat produk...</div>;
  if (!product) return <div>Produk tidak ditemukan.</div>;

  const displayPrice = (selectedVariant?.varianPrice ?? product.price) || 0;

  return (
    <div className="product-container">
      <ToastContainer position="bottom-center" autoClose={2000} />
      {/* Gambar */}
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>

      {/* Detail */}
      <div className="product-details">
        <h1 className="product-title">{product.name}</h1>
        <p className="product-price">Rp{Number(displayPrice).toLocaleString("id-ID")}</p>

        <p>
           Stok varian: {availableStock}{" "}
           <small style={{ color: "#777" }}>(sisa: {remaining})</small>
         </p>

        {/* Varian */}
        {!!product.varians?.length && (
          <div className="form-group">
            <label>Pilih Varian:</label>
            <div className="radio-group">
              {product.varians.map((variant) => (
                <label
                  key={variant.varianName}
                  className={`radio-option ${
                    selectedVariant?.varianName === variant.varianName ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="variant"
                    value={variant.varianName}
                    checked={selectedVariant?.varianName === variant.varianName} // <-- fix checked
                    onChange={() => handleVariantChange(variant.varianName)}
                  />
                  {variant.varianName}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Qty counter (lokal, bukan cart) */}
        <div className="form-group">
        <label>Jumlah:</label>

            <div className="qty-actions">
              {/* Counter */}
              <div className="item-counter">
                <FontAwesomeIcon icon={faMinus} onClick={decQty} />
                <p>{qty}</p>
                <FontAwesomeIcon icon={faPlus} onClick={incQty} />
              </div>

              {/* Tombol tambah ke keranjang */}
              <button
                type="button"
                className="btn primary add-to-cart"
                onClick={handleAddToCart}
                disabled={!itemKey || remaining <= 0}
              >
                <FaCartPlus className="icon" />
                <span>Masukkan Keranjang</span>
              </button>
            </div>
          <small className="hint">
            Maksimal bisa ditambah: {remaining} (berdasarkan stok & isi keranjang saat ini)
          </small>
        </div>

        

        {/* Deskripsi */}
        <div className="product-description">
          <h2>Deskripsi</h2>
          <p>{product.description}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
