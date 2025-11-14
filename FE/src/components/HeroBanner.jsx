<<<<<<< HEAD
import React from 'react';

const HeroBanner = () => {
    return (
        <div className="relative rounded-xl overflow-hidden mb-8">
            {/* Ảnh nền */}
            <img 
                src="/images/hero-background.jpg" // Đảm bảo bạn có ảnh này trong public/images
                alt="Job search banner"
                className="w-full h-72 sm:h-80 object-cover"
            />
            {/* Lớp phủ gradient nhẹ với opacity thấp hơn để tránh chói */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/18 to-transparent backdrop-blur-sm" />
            
            {/* Nội dung text: thêm khung mờ nhẹ phía sau chữ để tăng khả năng đọc */}
            <div className="absolute inset-0 flex flex-col items-start justify-center text-white p-6 md:p-12">
                <div className="bg-black/35 backdrop-blur-sm rounded-md p-4 max-w-2xl">
                  <h1 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight drop-shadow-sm">
                      Khám phá cơ hội nghề nghiệp — Bắt đầu tương lai của bạn
                  </h1>
                  <p className="text-sm md:text-base text-white/90 mb-4">
                      Tìm việc theo ngành, địa điểm và mức lương. Đăng hồ sơ, ứng tuyển nhanh chóng và theo dõi trạng thái.
                  </p>
                  <div className="flex items-center gap-3">
                      <a href="/jobs" className="inline-block bg-[var(--primary)] text-white px-4 py-2 rounded-md shadow hover:shadow-md transition transform hover:-translate-y-0.5 focus-ring" aria-label="Tìm việc ngay">Tìm việc ngay</a>
                      <a href="/register" className="inline-block bg-white/20 text-white px-4 py-2 rounded-md hover:bg-white/30 transition transform hover:-translate-y-0.5 focus-ring" aria-label="Tạo hồ sơ">Tạo hồ sơ</a>
                  </div>
                </div>
            </div>
        </div>
    );
};
=======
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
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a

export default HeroBanner;