import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faMagnifyingGlass, faCartShopping, faUser } from "@fortawesome/free-solid-svg-icons";
import "./BottomNavMobile.css";
import { Link } from "react-router-dom";

export default function BottomNavMobile() {
  return (
    <div className="bottom-nav-mobile">
      <Link to="/">
        <FontAwesomeIcon icon={faHouse} />
        <span>Home</span>
      </Link>
      <Link to="/search">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        <span>Search</span>
      </Link>
      <Link to="/cart">
        <FontAwesomeIcon icon={faCartShopping} />
        <span>Cart</span>
      </Link>
      <Link to="/my-account">
        <FontAwesomeIcon icon={faUser} />
        <span>Account</span>
      </Link>
    </div>
  );
}
