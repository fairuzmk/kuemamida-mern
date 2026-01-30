import React, { useEffect, useState, useContext } from "react";
import "./InstagramCatalog.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

const ITEMS_PER_PAGE = 8;

export default function InstagramCatalog() {
  const { url } = useContext(StoreContext);

  const [products, setProducts] = useState([]);
  const [customcake, setCustomcake] = useState([]);
  const [category, setCategory] = useState("catalog-birthday");
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [resAll, resCustom] = await Promise.all([
          axios.get(`${url}/api/catalog/ig`),
          axios.get(`${url}/api/catalog/ig/customcake`)
        ]);

        setProducts(resAll.data);
        setCustomcake(resCustom.data);
      } catch (err) {
        console.error("Failed to fetch IG catalog", err);
        setProducts([]);
        setCustomcake([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [url]);

  // RESET PAGE saat ganti TAB
  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  const displayData =
    category === "catalog-birthday" ? customcake : products;

  // ===== PAGINATION LOGIC =====
  const totalPages = Math.ceil(displayData.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginatedData = displayData.slice(start, end);

  return (
    <section className="ig-catalog">
      <h1 className="ig-title">Katalog Produk</h1>
      <hr />

      {/* ===== TAB MENU ===== */}
      <div className="catalog-menu-list">
        <div
          onClick={() => setCategory("catalog-birthday")}
          className={`catalog-menu-list-item ${
            category === "catalog-birthday" ? "active" : ""
          }`}
        >
          <img
            src="https://res.cloudinary.com/diotafsul/image/upload/v1764819934/kuemamida/wbq6q2uzzmtlgdgx1cs0.png"
            alt="Birthday Cake"
          />
          <p>Birthday Cake</p>
        </div>

        <div
          onClick={() => setCategory("all")}
          className={`catalog-menu-list-item ${
            category === "all" ? "active" : ""
          }`}
        >
          <img
            src="https://res.cloudinary.com/diotafsul/image/upload/v1764819766/kuemamida_allproduct_gsglco.png"
            alt="All Product"
          />
          <p>Lainnya</p>
        </div>
      </div>

      {/* ===== LOADING ===== */}
      {loading && <p className="ig-loading">Memuat katalog...</p>}

      {/* ===== GRID ===== */}
      <div className="ig-grid">
        {!loading && paginatedData.length === 0 && (
          <p className="ig-empty">Tidak ada produk.</p>
        )}

        {paginatedData.map((p) => (
          <div className="ig-card" key={p._id || p.id}>
            <div className="ig-image-wrapper">
              <img src={p.image} alt="Instagram Post" />
            </div>

            <div className="ig-content">
              <div className="ig-caption">
                {p.caption?.slice(0, 30)}
                {p.caption?.length > 30 && "..."}
              </div>

              <div className="ig-actions">
                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ig"
                >
                  <span>View on</span>
                  <FontAwesomeIcon icon={faInstagram} className="viewonig" />
                </a>

                <a
                  href={`https://wa.me/6287888624508?text=${encodeURIComponent(
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

      {/* ===== PAGINATION ===== */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          <a
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            style={{ pointerEvents: currentPage === 1 ? "none" : "auto" }}
          >
            «
          </a>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (page) => (
              <a
                key={page}
                className={page === currentPage ? "active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </a>
            )
          )}

          <a
            onClick={() =>
              currentPage < totalPages &&
              setCurrentPage(currentPage + 1)
            }
            style={{
              pointerEvents:
                currentPage === totalPages ? "none" : "auto"
            }}
          >
            »
          </a>
        </div>
      )}
    </section>
  );
}
