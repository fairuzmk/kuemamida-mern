import React, { useContext, useMemo, useState, useEffect } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import axios from 'axios';
import HamperItemLebaran from '../FoodItem/HamperItemLebaran';

const FoodDisplay = ({ category }) => {
  const { food_list, url } = useContext(StoreContext);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Bisa kamu ubah sesuai desain
  const [hampers, setHampers] = useState([]);
  const [loadingHampers, setLoadingHampers] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoadingHampers(true);
        const res = await axios.get(`${url}/api/hamper/list`);
        if (res.data?.success) setHampers(res.data.data || []);
      } catch {
        // boleh di-toast kalau mau
      } finally {
        setLoadingHampers(false);
      }
    })();
  }, [url]);

  const bundlingList = useMemo(
    () => (hampers || []).filter(h => h?.isActive),
    [hampers]
  );
  
  // Filter sesuai kategori
    // Normalisasi "All"
  const isAll = ['All', 'All Product'].includes(category);

  // Ekstrak categoryId dari item (bisa ObjectId string atau populated object)
  const getCategoryId = (item) =>
    typeof item.category === 'object' && item.category?._id
      ? item.category._id
      : item.category;

  // 1) Hanya produk aktif
  // 2) Filter Featured atau kategori tertentu (pakai _id)
  const filteredList = useMemo(() => {
    const base = (food_list || []).filter((it) => it?.isActive);
    let arr;  
    if (category === 'Featured') {
      arr = base.filter((it) => it?.isFeatured);
    } else if (isAll) {
      arr = base;
    } else {
      arr = base.filter((it) => String(getCategoryId(it)) === String(category));
    }
    // 3) Urutkan: yang inStock=true di atas, yang out-of-stock ke bawah
    //    (tetap stabil by name sebagai tie-breaker kecil)
    return [...arr].sort((a, b) => {
      const aIn = a?.inStock ? 1 : 0;
      const bIn = b?.inStock ? 1 : 0;
      if (aIn !== bIn) return bIn - aIn; // true duluan
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }, [food_list, category, isAll]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const currentItems = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (category === 'Bundling') {
    return (
      <div className="food-display" id="food-display">
        {loadingHampers ? (
          <div className="p-6 text-center text-gray-500">Memuat bundling…</div>
        ) : bundlingList.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Belum ada bundling aktif</div>
        ) : (
          <div className="food-display-list">
            {bundlingList.map((h) => (
              <HamperItemLebaran key={h._id} hamper={h} />
            ))}
          </div>
        )}
      </div>
    );
  }
  

  return (
    <div className='food-display' id='food-display'>
      
      <div className="food-display-list">
        {currentItems.map((item) => (
          <FoodItem
            key={item._id}
            id={item._id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
            rating={item.rating}
            inStock={item.inStock}
            category={item.category}
            varians={item.varians}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <a
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </a>
          {Array.from({ length: totalPages }, (_, i) => (
            <a
              key={i}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </a>
          ))}
          <a
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </a>
        </div>
      )}

      
    </div>
  );
};

export default FoodDisplay;
