import React, { useState } from 'react'
import './Navbar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {

    const[menu,setMenu] = useState("home");
  return (
    <div className="navbar">
    <div className="logo"><img src="/Logo1.png" alt="" /></div>
    <ul className="navbar-menu">
        <li onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>Home</li>
        <li onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>Menu</li>
        <li onClick={()=>setMenu("mobile-app")} className={menu==="mobile-app"?"active":""}>Mobile App</li>
        <li onClick={()=>setMenu("contact-us")} className={menu==="contact-us"?"active":""}>Contact Us</li>
    </ul>
    <div className="navbar-right">
        <img src="" alt="" />
        <div className="navbar-search-icon">
        <FontAwesomeIcon icon={faMagnifyingGlass} 
        className="svg-navbar-icon"
        size="lg"/>
          <FontAwesomeIcon
              icon={faCartShopping}
              size="lg"
              className="svg-navbar-icon"
              onClick={() => alert("Diklik!")}
            />
        <div className="dot"></div>
        </div>
        
        <button>Sign In</button>
    </div>
    </div>
  )
}

export default Navbar