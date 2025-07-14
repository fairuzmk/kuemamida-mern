import React, { useContext, useState } from 'react'
import './DetailPage.css'
import { StoreContext } from '../../context/StoreContext'
import { useParams } from 'react-router-dom';

const VARIANTS = [
  { value: '16', label: '16 cm', price: 150000 },
  { value: '18', label: '18 cm', price: 180000 },
  { value: '20', label: '20 cm', price: 210000 }
];

const DetailPage = () => {
    const { slugAndId } = useParams();
    const id = slugAndId.split('-').slice(-1)[0]; // ID tetap lengkap (24 karakter)
    const { food_list } = useContext(StoreContext);

    const product = food_list.find((item) => item._id === id);
    
    console.log("Semua produk:", food_list);
console.log("ID dari URL:", id);

console.log("Produk ditemukan:", product);

    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(VARIANTS[0]);

    const handleQuantityChange = (amount) => {
        setQuantity(prev => Math.max(1, prev + amount));
    };

    const handleVariantChange = (value) => {
        const variant = VARIANTS.find(v => v.value === value);
        setSelectedVariant(variant);
    };
    
    if (!food_list.length) return <div>Memuat produk...</div>;
    if (!product) return <div>Produk tidak ditemukan.</div>;
  
return (
    <div className="product-container">
      {/* Gambar */}
      <div className="product-image">
        <img src={product.image} alt="Produk" />
      </div>

      {/* Detail */}
      <div className="product-details">
        <h1 className="product-title">{product.name}</h1>
        <p className="product-price">Rp{selectedVariant.price.toLocaleString()}</p>

        <div className="product-rating">
          <span className="stars">★★★★★</span>
          <span className="reviews">(150 ulasan)</span>
        </div>

        {/* Varian */}
        <div className="form-group">
          <label>Pilih Diameter:</label>
          <div className="radio-group">
            {VARIANTS.map((variant) => (
              <label key={variant.value} className={`radio-option ${selectedVariant.value === variant.value ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="variant"
                  value={variant.value}
                  checked={selectedVariant.value === variant.value}
                  onChange={() => handleVariantChange(variant.value)}
                />
                {variant.label}
              </label>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="form-group">
          <label>Jumlah:</label>
          <div className="quantity-selector">
            <button onClick={() => handleQuantityChange(-1)}>-</button>
            <span>{quantity}</span>
            <button onClick={() => handleQuantityChange(1)}>+</button>
          </div>
        </div>

        <button className="add-to-cart">Tambah ke Keranjang</button>

        {/* Deskripsi */}
        <div className="product-description">
          <h2>Deskripsi</h2>
          <p>
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DetailPage