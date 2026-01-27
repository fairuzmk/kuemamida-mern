import React from 'react'
import './Footer.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
library.add(faInstagram);

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
          <div className="footer-logo"><img src="/Logo1.png" alt="" /></div>
          
          <div className="footer-social-icons">
            <div className="social-item">
              <span className="circle-social">
                <FontAwesomeIcon icon={faWhatsapp} className="svg-social-icon" />
              </span>
              <a className="social-label" href='https://wa.me/6287888624508'>Chat us on WhatsApp</a>
            </div>

            <div className="social-item">
              <span className="circle-social">
                <FontAwesomeIcon icon={faInstagram} className="svg-social-icon" />
              </span>
              <a className="social-label" href="https://instagram.com/kue.mamida">Follow us on Instagram</a>
            </div>
          </div>
        </div>
        <div className="footer-content-center">
          <h2>Company</h2>
          <ul>
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>

        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          
          <div className="contact-info">
            <div className="contact-item">
                <FontAwesomeIcon
                    icon={faPhone}
                    
                    className="svg-contact-icon"
                    />
              <span>+6287 8886-24508</span>
            </div>
            <div className="contact-item">
            <FontAwesomeIcon
                icon={faEnvelope}
                
                className="svg-contact-icon"
                />
              <span>kuemamida@gmail.com</span>
            </div>
            <div className="contact-item">
              <FontAwesomeIcon
                  icon={faLocationDot}
                  className="svg-contact-icon"
                  />
              <span>Gunung Sindur, Kabupaten Bogor Jawa Barat</span>
            </div>
          </div>

        </div>
      </div>
      <hr />
      <p className="footer-copyright">Copyright &copy; 2025 Kue Mamida | <a href='https://fzmilky.my.id'>Design by FairuzMK&trade;</a></p>
    </div>
  )
}

export default Footer