// Header.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './Header.css';

const Header = ({ slides = [] }) => {
  const defaultSlides = [
    {
      id: 1,
      imageUrl:
        'https://res.cloudinary.com/diotafsul/image/upload/v1769766840/hampers_mamida_zgfiw1.jpg',
      title: 'Hampers Lebaran Kue Mamida',
      description:
        'Sempurnakan momen fitrah bersama keluarga tercinta. Kue Kering Mamida hadir dengan bahan-bahan berkualitas untuk menciptakan kehangatan di setiap gigitan. Sajian nyaman, hati pun bahagia.',
      buttonText: 'Lihat Menu Kue',
      buttonLink: '#food-display',
    },
    {
      id: 2,
      imageUrl:
        'https://res.cloudinary.com/diotafsul/image/upload/v1769766761/GreetingCard_waa2qk.png',
      title: 'Ramadhan Kareem',
      description:
        'Selamat menunaikan ibadah puasa 1447 H. Semoga Ramadhan kali ini membawa berkah dan kebahagiaan bagi kita semua.',
      buttonText: 'Pesan Kue Custom',
      buttonLink: '/custom-order',
    },
    {
      id: 3,
      imageUrl:
        'https://res.cloudinary.com/diotafsul/image/upload/v1769729965/WhatsApp_Image_2026-01-29_at_21.02.04_h1rl8n.jpg',
      title: 'Fresh from the Oven',
      description:
        'Semua kue dibuat fresh dengan bahan berkualitas',
      buttonText: 'Hubungi Kami',
      buttonLink: '/contact',
    },
    {
      id: 4,
      imageUrl:
        'https://res.cloudinary.com/diotafsul/image/upload/v1769729965/WhatsApp_Image_2026-01-29_at_21.03.51_cd6rtl.jpg',
      title: 'Order your favourite cake here',
      description:
        'Di balik setiap kue yang kami sajikan, ada proses yang penuh cinta dan perhatian. Kami percaya bahwa kue yang baik bukan hanya soal rasa—tetapi juga soal pengalaman dan kehangatan yang menyertainya.',
      buttonText: 'Lihat Menu Kue',
      buttonLink: '#food-display',
    },
    {
      id: 5,
      imageUrl:
        'https://res.cloudinary.com/diotafsul/image/upload/v1766226490/Cover_Birthday_jj8bji.png',
      title: 'Kue Ulang Tahun untuk Momen Spesial',
      description:
        'Rayakan ulang tahun, anniversary, atau acara keluarga dengan kue ulang tahun sesuai keinginanmu',
      buttonText: 'Pesan Kue Custom',
      buttonLink: '/custom-order',
    },
    {
      id: 6,
      imageUrl:
        'https://res.cloudinary.com/diotafsul/image/upload/v1769729965/WhatsApp_Image_2026-01-29_at_21.02.04_h1rl8n.jpg',
      title: 'Fresh from the Oven',
      description:
        'Semua kue dibuat fresh dengan bahan berkualitas',
      buttonText: 'Hubungi Kami',
      buttonLink: '/contact',
    },
  ];

  const dataToUse = slides.length ? slides : defaultSlides;

  const handleButtonClick = (slide) => {
    if (!slide.buttonLink) return;

    if (slide.buttonLink.startsWith('#')) {
      const el = document.querySelector(slide.buttonLink);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = slide.buttonLink;
    }
  };

  return (
    <div className="header" id="header-section">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation={false} // bisa kamu ubah ke true kalau mau next/prev button
        speed={800}
        className="header-swiper"
      >
        {dataToUse.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="header-slide"
              style={{
                backgroundImage: `url(${slide.imageUrl})`,
              }}
            >
              <div className="header-overlay" />
              <div className="header-content">
                <h2>{slide.title}</h2>
                {slide.description && <p>{slide.description}</p>}
                {/* {slide.buttonText && (
                  <button onClick={() => handleButtonClick(slide)}>
                    {slide.buttonText}
                  </button>
                )} */}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Header;
