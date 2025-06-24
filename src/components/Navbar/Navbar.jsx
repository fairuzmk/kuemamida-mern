import React, { useState } from 'react'
import './Navbar.css'



const Navbar = () => {

    const[menu,setMenu] = useState("home");
  return (
    <div className='navbar'>
    <img src="" alt="" />
    <ul className="navbar-menu">
        <li onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>Home</li>
        <li onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>Menu</li>
        <li onClick={()=>setMenu("mobile-app")} className={menu==="mobile-app"?"active":""}>Mobile App</li>
        <li onClick={()=>setMenu("contact-us")} className={menu==="contact-us"?"active":""}>Contact Us</li>
    </ul>
    <div className="navbar-right">
        <img src="" alt="" />
        <div className="navbar-search-icon">
            <img src="" alt="" />
            <div className="dot"></div>
        </div>
        <button>Sign In</button>
    </div>
    </div>
  )
}

export default Navbar