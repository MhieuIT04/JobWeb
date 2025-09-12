// src/components/Footer.jsx
import React from 'react';

function Footer() {
  return (
    <footer className="text-center mt-auto border-t border-gray-200 bg-cover bg-center relative min-h-[120px]" style={{ backgroundImage: "url(/images/footer-bg.jpg)" }}>
      <div className="bg-white/85 py-5 relative z-10">
        <p className="font-semibold text-lg font-montserrat">
          © {new Date().getFullYear()} Recruitment Project. All Rights Reserved.
        </p>
        <p>
          <a href="/about" className="hover:underline">About</a> | <a href="/contact" className="hover:underline">Contact</a> | <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;