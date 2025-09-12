// src/components/HeroBanner.jsx
import React from 'react';

const HeroBanner = ({ children }) => (
  <div className="w-full min-h-[40vh] md:min-h-[55vh] bg-cover bg-center flex items-center justify-center text-white text-center relative" style={{ backgroundImage: "url(/images/hero-background.jpg)" }}>
    <div className="container max-w-2xl mx-auto flex flex-col items-center justify-center h-full z-10">
      <h1 className="font-extrabold mb-2 font-montserrat tracking-wide text-2xl md:text-4xl drop-shadow">Khám phá Cơ hội, Kiến tạo Tương lai</h1>
      <p className="mb-4 font-medium font-montserrat text-base md:text-2xl drop-shadow">Nền tảng tuyển dụng hàng đầu dành cho bạn.</p>
      {children}
    </div>
    <div className="absolute inset-0 bg-black/30 z-0" />
  </div>
);

export default HeroBanner;