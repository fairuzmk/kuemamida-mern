import React, { useContext, useEffect, useState } from 'react'
import './Navbar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faB, faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faBars, faXmark, faRightToBracket, faUser, faBagShopping, faCircleUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
library.add(faInstagram);

const Navbar = ({setShowLogin}) => {

    const[menu,setMenu] = useState("home");

    const [scrolled, setScrolled] = useState(false);

    const [showSidebar, setShowSidebar] = useState(false);

    const {getTotalCartAmount, token, setToken} = useContext(StoreContext);

    const navigate = useNavigate();

    const logout = () => {
       localStorage.removeItem('token')
       setToken("");
       navigate("/")

    }


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
  <div className={`navbar ${scrolled ? 'scrolled' : ''}`}>

    {/* HAMBURGER ICON */}
    <div className="hamburger" onClick={() => setShowSidebar(true)}>
        <FontAwesomeIcon icon={faBars} />
    </div>


    <div className="logo"><Link to='/'><img src="/Logo1.png" alt="" /></Link></div>
    <ul className="navbar-menu">
        <a href='/' onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>Home</a>
        <a href="/#explore-menu" onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>Menu</a>
        <li onClick={()=>setMenu("lebaran")} className={menu==="lebaran"?"active":""}>Special Lebaran</li>
        <Link to="/custom-cake"><li onClick={()=>setMenu("custom-order")} className={menu==="custom-order"?"active":""}>Custom Order</li></Link>
    </ul>

    {/* SIDEBAR MENU MOBILE */}
    <div className={`sidebar-menu ${showSidebar ? 'show' : ''}`}>
        <div className="sidebar-close" onClick={() => setShowSidebar(false)}>
          <FontAwesomeIcon icon={faXmark} />
        </div>
        <ul>
          <li onClick={() => { window.location.href = "/"; setMenu("home"); setShowSidebar(false); }}>Home</li>
          <li onClick={() => { window.location.href = "/#explore-menu"; setMenu("menu"); setShowSidebar(false); }}>Menu</li>
          <li onClick={() => { setMenu("lebaran"); setShowSidebar(false); }}>Special Lebaran</li>
          <Link to="/custom-cake"><li onClick={() => { setMenu("custom-order"); setShowSidebar(false); }}>Custom Order</li></Link>
        </ul>
        {/* SOCIAL ICONS AT BOTTOM */}
        <div className="sidebar-social">
          <ul>
            <li ><FontAwesomeIcon icon={faWhatsapp} className="svg-sidebar-icon" />Whatsapp</li>
            <li ><FontAwesomeIcon icon={faInstagram} className="svg-sidebar-icon" />Follow us</li>
            
            {!token
            ?<li onClick={() => { setShowLogin(true); setShowSidebar(false); }}>
            <FontAwesomeIcon icon={faRightToBracket} className="svg-sidebar-icon" />Sign In</li>
            :
            <>
            <li onClick={() => { setShowSidebar(false); }}>
            <FontAwesomeIcon icon={faUser} className="svg-sidebar-icon" />Hai, Full Name</li>
            <li onClick={() => { setShowSidebar(false); }}>
            <FontAwesomeIcon icon={faBagShopping} className="svg-sidebar-icon" />Your Order</li>
            <li onClick={() => { setShowLogin(false); setShowSidebar(false); }}>
            <FontAwesomeIcon icon={faRightFromBracket} className="svg-sidebar-icon" />Sign Out</li>
            </>
            }
          </ul>
          
        </div>
      </div>

    <div className="navbar-right">

        <div className="navbar-search-icon">
        <FontAwesomeIcon icon={faMagnifyingGlass} 
        className="svg-navbar-icon"
        />
          <Link to="/cart"><FontAwesomeIcon
              icon={faCartShopping}
              
              className="svg-navbar-icon"
              
            /></Link>
        <div className={getTotalCartAmount()===0?"":"dot"}></div>
        </div>

        {!token
        ?<button onClick={()=>setShowLogin(true)}>Sign In</button>
        :
        <div className="navbar-profile">
          <FontAwesomeIcon icon={faCircleUser} 
              className="svg-navbar-icon"
        />
        <ul className="nav-profile-dropdown">
          <li><FontAwesomeIcon icon={faUser} 
              className="svg-navbar-icon"/>
          <div className='account-dropdown'>
          <p>Account Setting</p>
          <span>(Full Name)</span>
          </div>
          
          </li>

          <li><FontAwesomeIcon icon={faBagShopping} className='svg-navbar-icon'/><p>Orders</p></li>
          <hr />
          <li onClick={logout}><FontAwesomeIcon icon={faRightFromBracket} className='svg-navbar-icon'/><p>Logout</p></li>
        </ul>
        </div>
       }
        
    </div>
  </div>
  )
}

export default Navbar