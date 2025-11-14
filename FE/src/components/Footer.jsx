// src/components/Footer.jsx
import React from 'react';

function Footer() {
  return (
<<<<<<< HEAD
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <h4 className="font-semibold mb-2">Về chúng tôi</h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-blue-200">
            <li><a href="/about" className="hover:underline">Giới thiệu</a></li>
            <li><a href="/contact" className="hover:underline">Liên hệ</a></li>
            <li><a href="/privacy-policy" className="hover:underline">Chính sách bảo mật</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Dành cho ứng viên</h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-blue-200">
            <li><a href="/cv-match" className="hover:underline">CV Match</a></li>
            <li><a href="/favorites" className="hover:underline">Việc đã lưu</a></li>
            <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Dành cho nhà tuyển dụng</h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-blue-200">
            <li><a href="/employer/dashboard" className="hover:underline">Quản lý tuyển dụng</a></li>
            <li><a href="/employer/analytics" className="hover:underline">Analytics</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Kết nối</h4>
          <p className="text-sm text-gray-600 dark:text-blue-200">Email: support@example.com</p>
          <p className="text-sm text-gray-600 dark:text-blue-200">© {new Date().getFullYear()} Recruitment Project</p>
        </div>
=======
    <footer className="text-center mt-auto border-t border-gray-200 bg-cover bg-center relative min-h-[120px]" style={{ backgroundImage: "url(/images/footer-bg.jpg)" }}>
      <div className="bg-white/85 py-5 relative z-10">
        <p className="font-semibold text-lg font-montserrat">
          © {new Date().getFullYear()} Recruitment Project. All Rights Reserved.
        </p>
        <p>
          <a href="/about" className="hover:underline">About</a> | <a href="/contact" className="hover:underline">Contact</a> | <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
        </p>
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
      </div>
    </footer>
  );
}

export default Footer;