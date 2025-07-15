import React, { useContext, useEffect, useState } from 'react'
import './DetailPage.css'
import { StoreContext } from '../../context/StoreContext'
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'




const DetailPage = () => {
    const { slugAndId } = useParams();
    const id = slugAndId.split('-').slice(-1)[0]; // ID tetap lengkap (24 karakter)
    const { food_list, cartItems,addToCart,removeFromCart,url } = useContext(StoreContext);
    
    const product = food_list.find((item) => item._id === id);
    


    console.log("Semua produk:", food_list);
    console.log("ID dari URL:", id);

    console.log("Produk ditemukan:", product);

    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);

    const itemKey = selectedVariant
    ? `${product._id}_${selectedVariant.varianName}`
    : null;
    useEffect(() => {
    // set varian default saat produk ready
    if (product && product.varians && product.varians.length > 0) {
        setSelectedVariant(product.varians[0]);
    }
    }, [product]);

    const handleVariantChange = (varianName) => {
    const variant = product.varians.find(v => v.varianName === varianName);
    if (variant) setSelectedVariant(variant);
    };

    const handleQuantityChange = (amount) => {
        setQuantity(prev => Math.max(1, prev + amount));
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
        <p className="product-price">Rp{(selectedVariant?.varianPrice || product.price).toLocaleString()}</p>

        <div className="product-rating">
          <span className="stars">★★★★★</span>
          <span className="reviews">(150 ulasan)</span>
        </div>

        {/* Varian */}
        <div className="form-group">
          <label>Pilih Variant:</label>
          <div className="radio-group">
            {product.varians.map((variant) => (
            <label key={variant.varianName} className={`radio-option ${selectedVariant?.varianName === variant.varianName ? 'active' : ''}`}>
                <input
                type="radio"
                name="variant"
                value={variant.varianName}
                checked={selectedVariant?.value === variant.varianName}
                onChange={() => handleVariantChange(variant.varianName)}
                />
                {variant.varianName}
            </label>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="form-group">
          <label>Jumlah:</label>
          <div className="item-counter">
            <FontAwesomeIcon icon={faMinus} onClick={() => removeFromCart(itemKey)} />
            <p>{cartItems[itemKey] || 0}</p>
            <FontAwesomeIcon icon={faPlus} onClick={() => addToCart(itemKey)} />
          </div>
        </div>


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