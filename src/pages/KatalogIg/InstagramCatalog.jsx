import React, { useEffect, useState, useContext } from "react";
import "./InstagramCatalog.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

export default function InstagramCatalog() {
  const { url } = useContext(StoreContext); 
  // contoh url = https://kuemamida.milkioserver.my.id

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await axios.get(`${url}/api/catalog/ig`);
        setProducts(res.data); // ✅ axios pakai res.data
      } catch (err) {
        console.error("Failed to fetch IG catalog", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [url]);

  return (
    <section className="ig-catalog">
      <h2 className="ig-title">Katalog Produk</h2>

      {loading && <p className="ig-loading">Memuat katalog...</p>}

      <div className="ig-grid">
        {!loading && products.length === 0 && (
          <p className="ig-empty">Tidak ada produk.</p>
        )}

        {products.map((p) => (
          <div className="ig-card" key={p.id}>
            <div className="ig-image-wrapper">
              <img src={p.image} alt="Instagram Post" />
            </div>

            <div className="ig-content">
              <p className="ig-caption">
                {p.caption?.slice(0, 90)}
                {p.caption?.length > 90 && "..."}
              </p>

              <div className="ig-actions">
                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline"
                >
                  Instagram
                </a>

                <a
                  href={`https://wa.me/628xxxx?text=${encodeURIComponent(
                    "Halo, saya mau pesan produk ini:\n" + p.link
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  Pesan
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
