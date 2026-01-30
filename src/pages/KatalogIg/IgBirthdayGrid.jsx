import React, { useEffect, useState, useContext } from "react";
import "./InstagramCatalog.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

const ITEMS_PER_PAGE = 8;

export default function IgBirthdayGrid() {
  const { url } = useContext(StoreContext);

  const [customcake, setCustomcake] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${url}/api/catalog/ig/customcake`
        );
        setCustomcake(res.data || []);
      } catch {
        setCustomcake([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [url]);

  const totalPages = Math.ceil(customcake.length / ITEMS_PER_PAGE);
  const paginated = customcake.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="ig-catalog">
      <div className="ig-grid">
        {loading ? (
          <p className="ig-loading">Memuat katalog…</p>
        ) : paginated.length === 0 ? (
          <p className="ig-empty">Tidak ada katalog.</p>
        ) : (
          paginated.map((p) => (
            <div className="ig-card" key={p._id || p.id}>
              <div className="ig-image-wrapper">
                <img src={p.image} alt="Birthday Cake" />
              </div>

              <div className="ig-content">
                <div className="ig-caption">
                  {p.caption?.slice(0, 30)}
                  {p.caption?.length > 30 && "…"}
                </div>

                <div className="ig-actions">
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ig"
                  >
                    <span>View on</span>
                    <FontAwesomeIcon
                      icon={faInstagram}
                      className="viewonig"
                    />
                  </a>

                  <a
                    href={`https://wa.me/6287888624508?text=${encodeURIComponent(
                      "Halo, saya mau pesan kue ulang tahun ini:\n" + p.link
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
          ))
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <a
            onClick={() =>
              currentPage > 1 &&
              setCurrentPage((p) => p - 1)
            }
          >
            «
          </a>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (p) => (
              <a
                key={p}
                className={p === currentPage ? "active" : ""}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </a>
            )
          )}

          <a
            onClick={() =>
              currentPage < totalPages &&
              setCurrentPage((p) => p + 1)
            }
          >
            »
          </a>
        </div>
      )}
    </div>
  );
}
