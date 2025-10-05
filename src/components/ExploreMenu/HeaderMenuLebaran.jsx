// src/components/ExploreMenu/HeaderMenuLebaran.jsx
import React from 'react'
import './ExploreMenu.css'
import { menu_lebaran } from '../../assets/assets'

const HeaderMenuLebaran = ({category, setCategory}) => {
  const tabs = [
    { key: 'Kue Kering', label: 'Kue Kering' },
    { key: 'Paket Hampers', label: 'Paket Hampers Lebaran' },
  ];

  return (
    <div className='explore-menu' id='explore-menu'>
      <h1>Menu Lebaran 2026</h1>
      <hr />
      <div className="lebaran-menu-list">
        {menu_lebaran.map(t => (
          <div
            key={t.key}
            onClick={() => setCategory(t.key)}
            className="explore-menu-list-item"
          >
             <img className={category===t.key?"active":""} src={t.menu_image} alt="" />
             <p>{t.label}</p>
            {/* <div className={`menu-chip ${category === t.key ? 'active' : ''}`}>
              {t.label}
            </div> */}
          </div>
        ))}
      </div>
    </div>
  )
}

export default HeaderMenuLebaran
