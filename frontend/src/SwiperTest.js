import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

const SwiperTest = () => {
  return (
    <div style={{ width: "400px", margin: "auto", textAlign: "center" }}>
      <h2>Test Swiper</h2>
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        className="swiper-container"
      >
        <SwiperSlide>
          <div className="slide">Slide 1</div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="slide">Slide 2</div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="slide">Slide 3</div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default SwiperTest;
