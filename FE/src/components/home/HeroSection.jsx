// src/components/HeroSection.jsx

import React from 'react';
import HeroSearch from './HeroSearch';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function HeroSection({ cities, onSearch }) {
  return (
    <section className="relative bg-gradient-to-br from-primary to-blue-600 py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20 z-0" />
        <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
                <motion.h1 
                    className="text-4xl md:text-6xl font-extrabold text-white mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Tìm kiếm. Ứng tuyển. Thành công.
                </motion.h1>
                <motion.p 
                    className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    Nền tảng tuyển dụng hàng đầu, kết nối tài năng với cơ hội vàng.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <HeroSearch cities={cities} onSearch={onSearch} />
                </motion.div>
                <motion.div 
                    className="mt-6 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-white/80 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <span>Gợi ý:</span>
                    <Button variant="link" className="text-white/80 h-auto p-1">Designer</Button>
                    <Button variant="link" className="text-white/80 h-auto p-1">Developer</Button>
                    <Button variant="link" className="text-white/80 h-auto p-1">Tester</Button>
                </motion.div>
            </div>
        </div>
    </section>
  );
}

export default HeroSection;