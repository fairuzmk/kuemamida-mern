import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { StoreContext } from "../../context/StoreContext";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./TestimonialSlider.css";

const TestimonialSwiper = () => {
  const { url } = useContext(StoreContext);

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get(`${url}/api/testimonials`);
        if (res.data?.success) {
          setTestimonials(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load testimonials", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [url]);

  
  const MAX_LENGTH = 120;

  const getMessage = (text, id) => {
    if (expanded[id] || text.length <= MAX_LENGTH) {
      return text;
    }
    return text.slice(0, MAX_LENGTH) + "...";
  };

  return (
    <section className="testimonial-section">
      <div className="testimonial-header">
        <h2>Apa Kata Pelanggan Kami</h2>
        <p>
          Dipercaya oleh ratusan pelanggan karena dedikasi dan cinta yang
          diberikan dalam setiap potongan kue
        </p>
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="testimonial-swiper"
      >
        {loading ? (
          <SwiperSlide>
            <div className="text-center text-sm text-gray-500">
              Memuat testimonial...
            </div>
          </SwiperSlide>
        ) : testimonials.length === 0 ? (
          <SwiperSlide>
            <div className="text-center text-sm text-gray-500">
              Belum ada testimonial
            </div>
          </SwiperSlide>
        ) : (
          testimonials.map((item) => (
            <SwiperSlide key={item._id}>
              <article className="testimonial-card">
                <span className="quote">“</span>
                <div className="user">
                <img
                    src={`https://avatar.iran.liara.run/public/${item.gender === "male" ? "boy" : "girl"}?username=${item.avatarSeed}`}
                    alt={item.name}
                  />
                  <div className="user-info">
                    <span className="name">{item.name}</span>
                    <span className="role">{item.role}</span>
                  </div>
                </div>
                
                <p className="message-testimonial">
                  {getMessage(item.message, item._id)}
                  {item.message.length > MAX_LENGTH && (
                    <button
                      className="read-more"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [item._id]: !prev[item._id],
                        }))
                      }
                    >
                      {expanded[item._id] ? "Tutup" : "Read More"}
                    </button>
                  )}
                </p>

                
              </article>
            </SwiperSlide>
          ))
        )}
      </Swiper>
    </section>
  );
};

export default TestimonialSwiper;
