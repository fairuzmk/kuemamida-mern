import React, { useContext, useEffect, useRef, useState } from 'react'
import './Navbar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faBars, faXmark, faRightToBracket, faUser, faBagShopping, faCircleUser, faRightFromBracket, faHouse } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import "./BottomNavMobile.css";

library.add(faInstagram);


const Navbar = ({setShowLogin}) => {

    const[menu,setMenu] = useState("home");

    const [scrolled, setScrolled] = useState(false);

    const [showSidebar, setShowSidebar] = useState(false);

    const {getTotalCartAmount, token, setToken, url, setCartItems, setCartBundles, user, setUser} = useContext(StoreContext);

    

    const navigate = useNavigate();

    const suppressLocalPersist = useRef(false);

    const logout = () => {
      // hentikan persist cart lokal
      // (ref ini di Navbar tidak berefek ke StoreContext; aman dihapus kalau mau)
      // suppressLocalPersist.current = true;
    
      // bersihkan cart state & storage
      setCartItems && setCartItems({});
      setCartBundles && setCartBundles([]);
      localStorage.removeItem("cartItems");
      localStorage.removeItem("cartBundles");
    
     // HAPUS TOKEN PERSISTEN
     localStorage.removeItem("token");   // <<< PENTING
     // kalau kamu simpan di cookie juga, hapus cookie-nya:
     document.cookie = "token=; Max-Age=0; path=/";
    
      // reset token state
      setToken("");
    
     // (opsional) bersihkan default header axios kalau pernah diset global
     delete axios.defaults.headers.common["token"];
    };

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`${url}/api/user-new/account`, {
            headers: { token }
          });
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error(err);
        } 
      };
      fetchUser();
    }, [token]);
  

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <>
  <div className={`navbar ${scrolled ? 'scrolled' : ''}`}>

    {/* HAMBURGER ICON */}
    <div className="hamburger" onClick={() => setShowSidebar(true)}>
        <FontAwesomeIcon icon={faBars} />
    </div>


    <div className="logo"><Link to='/'><img src="/Logo1.png" alt="" /></Link></div>
    <ul className="navbar-menu">
        <a href='/' onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>Home</a>
        <a href="/#explore-menu" onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>Menu</a>
        <Link to ="/katalog-ig"><li onClick={()=>setMenu("katalogig")} className={menu==="katalogig"?"active":""}>Katalog Produk</li></Link>
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
          <Link to ="/katalog-ig"><li onClick={() => { setMenu("katalogig"); setShowSidebar(false); }}>Katalog Produk</li></Link>
          <Link to="/custom-cake"><li onClick={() => { setMenu("custom-order"); setShowSidebar(false); }}>Custom Order</li></Link>
        </ul>
        {/* SOCIAL ICONS AT BOTTOM */}
        <div className="sidebar-social">
          <ul>
            <li onClick={() => { window.location.href = "https://wa.me/6287888624508"; setMenu("home"); setShowSidebar(false); }}><FontAwesomeIcon icon={faWhatsapp} className="svg-sidebar-icon" />Whatsapp</li>
            <li onClick={() => { window.location.href = "https://instagram.com/kue.mamida"; setMenu("home"); setShowSidebar(false); }}><FontAwesomeIcon icon={faInstagram} className="svg-sidebar-icon" />Follow us</li>
            
            {!token
            ?<li onClick={() => { setShowLogin(true); setShowSidebar(false); }}>
            <FontAwesomeIcon icon={faRightToBracket} className="svg-sidebar-icon" />Sign In</li>
            :
            <>
            <li onClick={() => { setShowSidebar(false); }}>
            <FontAwesomeIcon icon={faUser} className="svg-sidebar-icon" />Hai, {user?.name ?? ""}</li>
            <li onClick={() => { logout(); setShowLogin(false); setShowSidebar(false); }}>
            <FontAwesomeIcon icon={faRightFromBracket} className="svg-sidebar-icon" />Sign Out</li>
            </>
            }
          </ul>
          
        </div>
      </div>

    <div className="navbar-right">

        <div className="navbar-search-icon">
          <div><FontAwesomeIcon icon={faMagnifyingGlass} 
          className="svg-navbar-icon"
          /></div>

          <div className='cart-icon-wrapper'> 
            <Link to="/cart"><FontAwesomeIcon
                icon={faCartShopping}
                
                className="svg-navbar-icon"
                
              /></Link>
            <div className={getTotalCartAmount()===0?"":"dot"}>

            </div>
          </div>
         
          
        </div>

        {!token
        ?<button onClick={()=>setShowLogin(true)}>Sign In</button>
        :
        <div className="navbar-profile">
          <FontAwesomeIcon icon={faUser} 
              className="svg-navbar-icon"
        />
        <ul className="nav-profile-dropdown">
          <li onClick={() => { window.location.href = "/my-account" }}><FontAwesomeIcon icon={faUser} 
              className="svg-navbar-icon"/>
          <div className='account-dropdown'>
          <p>My Profile</p>
          <span>({user?.name})</span>
          </div>
          
          </li>

          <li onClick={() => { window.location.href = "/my-orders" }}><FontAwesomeIcon icon={faBagShopping} className='svg-navbar-icon'/><p>My Orders</p></li>

          <hr />
          <li onClick={logout}><FontAwesomeIcon icon={faRightFromBracket} className='svg-navbar-icon'/><p>Logout</p></li>
        </ul>
        </div>
       }
        
    </div>
    
  </div>
  
        <div className="bottom-nav-mobile">
          
          <Link>
            <FontAwesomeIcon icon={faBars} onClick={() => setShowSidebar(prev => !prev)}className='bottom-nav-icon'/>
            <span>Menu</span>
          </Link>
          
          <Link to="/cart">
            <div className="cart-icon-navbot">
            <FontAwesomeIcon icon={faCartShopping} className='bottom-nav-icon' />
            
            <div className={getTotalCartAmount()===0?"":"dot"}></div>

            </div>
            <span>Cart</span>
          </Link>
          
          <Link to="/">
            <FontAwesomeIcon icon={faHouse} className='bottom-nav-icon'/>
            <span>Home</span>
          </Link>
          <Link to="/my-orders">
            <FontAwesomeIcon icon={faBagShopping} className='bottom-nav-icon'/>
            <span>Order</span>
          </Link>
          
          {!token
            ?
            <Link>
            <FontAwesomeIcon icon={faRightToBracket} onClick={() => { setShowLogin(true); setShowSidebar(false); }} className='bottom-nav-icon'/>

            <span>Sign In</span>
            </Link>
            :
            
            <Link to="/my-account">
            <FontAwesomeIcon icon={faUser} className='bottom-nav-icon'/>
            <span>Account</span>
            </Link>
            
            }
          
        </div>
  </>
  )
}

export default Navbar