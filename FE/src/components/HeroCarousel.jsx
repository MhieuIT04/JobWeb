import React, { useEffect, useState } from 'react';

const slides = [
  { img: '/images/hero1.jpg', title: 'Cơ hội mới mỗi ngày', subtitle: 'Khám phá việc làm nổi bật từ các công ty hàng đầu' },
  { img: '/images/hero2.jpg', title: 'Sẵn sàng bứt phá', subtitle: 'Nâng cấp hồ sơ và chinh phục vị trí mơ ước' },
  { img: '/images/hero3.jpg', title: 'Kết nối nhanh chóng', subtitle: 'Ứng tuyển chỉ với một cú nhấp' },
];

export default function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(()=>{
    const t = setInterval(()=> setIdx(i => (i+1)%slides.length), 4000);
    return ()=> clearInterval(t);
  }, []);
  const s = slides[idx];
  return (
    <div className="relative h-56 md:h-72 overflow-hidden rounded-xl shadow-sm">
      <img src={s.img} alt="banner" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/10" />
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white">
        <h2 className="text-2xl md:text-4xl font-bold drop-shadow">{s.title}</h2>
        <p className="mt-2 text-sm md:text-base opacity-90">{s.subtitle}</p>
      </div>
      <div className="absolute bottom-3 right-4 flex gap-2">
        {slides.map((_,i)=>(
          <span key={i} className={`w-2 h-2 rounded-full ${i===idx?'bg-white':'bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
}


