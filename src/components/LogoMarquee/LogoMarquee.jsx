import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "./LogoMarquee.css";

const LogoMarquee = () => {
  // Data logo asli
  const originalLogos = [
    { id: 1, img: "/Halal1.webp", name: "Halal ID" },
    { id: 2, img: "/Halal1.webp", name: "Halal ID 2" },
  ];

  // Trik duplikasi: Kita gandakan array agar Swiper tidak patah saat loop
  // Ini memastikan slide selalu cukup untuk memenuhi layar
  const duplicatedLogos = [...originalLogos, ...originalLogos, ...originalLogos, ...originalLogos];

  return (
    <section className="logo-marquee-section">
      <div className="logo-container">
        {/* <div className="logo-header">
          
          <h3>Halal Certified</h3>
        </div> */}

        <Swiper
          modules={[Autoplay]}
          loop={true}
          speed={5000} // Durasi geser (ms), makin besar makin lambat/halus
          autoplay={{
            delay: 0, // Wajib 0 agar jalan terus tanpa berhenti
            disableOnInteraction: false,
          }}
          slidesPerView={2}
          spaceBetween={20}
          breakpoints={{
            640: { slidesPerView: 3, spaceBetween: 30 },
            768: { slidesPerView: 4, spaceBetween: 40 },
            1024: { slidesPerView: 5, spaceBetween: 50 },
          }}
          allowTouchMove={false}
          className="logo-marquee-swiper"
        >
          {duplicatedLogos.map((logo, index) => (
            <SwiperSlide key={`${logo.id}-${index}`}>
              <div className="logo-card">
                <img src={logo.img} alt={logo.name} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default LogoMarquee;