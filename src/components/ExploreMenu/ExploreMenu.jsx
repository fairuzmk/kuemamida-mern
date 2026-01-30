import React, { useEffect, useState, useContext } from 'react';
import './ExploreMenu.css';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const ExploreMenu = ({ category, setCategory }) => {
      const { url } = useContext(StoreContext);
      const [categories, setCategories] = useState([]);
    
      useEffect(() => {
        (async () => {
          try {
            const res = await axios.get(`${url}/api/categories/list`, { params: { activeOnly: 'true' } });
            if (res.data?.success) setCategories(res.data.data || []);
          } catch {
            // boleh di-toast kalau mau
          }
        })();
      }, [url]);


  return (
    <div className='explore-menu' id='explore-menu'>
        <h1>Explore our Menu</h1>
        <hr />
        
        <div className="explore-menu-list">
            {/* Tab: All Product */}
          <div
            onClick={() => setCategory('All Product')}
            className="explore-menu-list-item"
          >
            <div >
              <img
                src="https://res.cloudinary.com/diotafsul/image/upload/v1764819766/kuemamida_allproduct_gsglco.png"
                alt="All Product"
                className={['All', 'All Product'].includes(category) ? 'active' : ''}
              />
            </div>
            <p>All Product</p>
          </div>
          {/* Tab: Featured */}
          <div
            onClick={() => setCategory('Featured')}
           className="explore-menu-list-item"
          >
            <div >
              <img
                src="https://res.cloudinary.com/diotafsul/image/upload/v1764819766/kuemamida_featured_ogod7v.png"
                alt="Cookies Raya"
                className={category === 'Featured' ? 'active' : ''}
              />
            </div>
            <p>Cookies Raya</p>
          </div>

        
           {/* Tab: Featured */}
           <div
            onClick={() => setCategory('Bundling')}
           className="explore-menu-list-item"
          >
            <div >
              <img
                src="https://res.cloudinary.com/diotafsul/image/upload/v1764819765/kuemamida_Combo_manw09.png"
                alt="Featured"
                className={category === 'Bundling' ? 'active' : ''}
              />
            </div>
            <p>Hampers Raya</p>
          </div>

          {/* Tabs: Kategori dari DB (aktif saja) */}
          {categories.map((cat) => (
            <div
              key={cat._id}
              onClick={() => setCategory(cat._id)}                   
              
              className="explore-menu-list-item"
            >
              <img
                className={category === cat._id ? 'active' : ''}
                src={cat.image || 'https://dummyimage.com/120x120/ebebeb/555&text=Cat'}
                alt={cat.name}
              />
              <p>{cat.name}</p>
            </div>
          ))}

          
        </div>
    </div>
  )
}

export default ExploreMenu