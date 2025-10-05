// src/components/FoodDisplay/FoodDisplayLebaran.jsx
import React, { useContext, useMemo, useState } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItemLebaran from '../FoodItem/FoodItemLebaran';
import HamperItemLebaran from '../FoodItem/HamperItemLebaran';

const FoodDisplayLebaran = ({ category }) => {
  const { food_list, hampers, fetchHampers, hampersPagination } = useContext(StoreContext);

  // --- Kue Kering ---
  const kkAll = useMemo(
    () => food_list.filter((item) => item.category === 'Kue Kering'),
    [food_list]
  );
  const [pageKK, setPageKK] = useState(1);
  const kkPerPage = 10;
  const kkPages = Math.ceil(kkAll.length / kkPerPage);
  const kkItems = kkAll.slice((pageKK - 1) * kkPerPage, pageKK * kkPerPage);

  // --- Hampers ---
  const [pageH, setPageH] = useState(1);
  const hPerPage = 8;

  // kalau backend kamu NON-paginated, kita paginasi di FE:
  const hAll = hampers || [];
  const hPagesFE = Math.ceil(hAll.length / hPerPage);
  const hItemsFE = hAll.slice((pageH - 1) * hPerPage, pageH * hPerPage);

  // jika suatu saat backend-mu pagination, kamu bisa gunakan fetchHampers(page, limit)
  // dan membaca hampersPagination untuk total pages, dsb.

  return (
    <div className='food-display' id='food-display'>
      {category === 'Kue Kering' && (
        <>
          <div className="food-display-list">
            {kkItems.map((item) => (
              <FoodItemLebaran
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

          {kkPages > 1 && (
            <div className="pagination">
              <a onClick={() => setPageKK((p) => Math.max(p - 1, 1))}>Prev</a>
              {Array.from({ length: kkPages }, (_, i) => (
                <a
                  key={i}
                  className={pageKK === i + 1 ? 'active' : ''}
                  onClick={() => setPageKK(i + 1)}
                >
                  {i + 1}
                </a>
              ))}
              <a onClick={() => setPageKK((p) => Math.min(p + 1, kkPages))}>Next</a>
            </div>
          )}
        </>
      )}

      {category === 'Paket Hampers' && (
        <>
          <div className="food-display-list">
            {hItemsFE.map((h) => (
              <HamperItemLebaran key={h._id} hamper={h} />
            ))}
          </div>

          {hPagesFE > 1 && (
            <div className="pagination">
              <a onClick={() => setPageH((p) => Math.max(p - 1, 1))}>Prev</a>
              {Array.from({ length: hPagesFE }, (_, i) => (
                <a
                  key={i}
                  className={pageH === i + 1 ? 'active' : ''}
                  onClick={() => setPageH(i + 1)}
                >
                  {i + 1}
                </a>
              ))}
              <a onClick={() => setPageH((p) => Math.min(p + 1, hPagesFE))}>Next</a>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FoodDisplayLebaran;
