// src/components/Header.jsx
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import { Button } from './ui/button';  const menuItems = [
    { label: 'Việc làm', to: '/' },
    user && user.role === 'employer' ? { label: 'Quản lý', to: '/employer/dashboard' } : null,
    isAuthenticated ? { label: 'Hồ sơ', to: '/profile' } : null,
    isAuthenticated ? { label: 'Đã ứng tuyển', to: '/my-applications' } : null,
    isAuthenticated ? { label: 'Việc đã lưu', to: '/favorites' } : null,
    !isAuthenticated ? { label: 'Đăng nhập', to: '/login' } : null,
    !isAuthenticated ? { label: 'Đăng ký', to: '/register' } : null,
  ].filter(Boolean);

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
              <RouterLink to="/" className="flex items-center gap-2 text-primary" style={{ border: '2px solid red' }}>
                    <img src="/logo192.png" alt="JobBoard Logo" className="h-8 w-8" /> 
                    {/* Giả sử bạn có file logo.svg trong public */}
                    <span className="text-xl font-bold tracking-wide">
                        JobBoard
                    </span>
                </RouterLink>

         <nav className="hidden md:flex items-center gap-4">
          {navLinkItems.map(item => (
            <RouterLink key={item.to} to={item.to} className={navLinkClasses}>
              {item.label}
            </RouterLink>
          ))}
          
          {isAuthenticated ? (
            <div className="flex items-center gap-2 border-l ml-4 pl-4">
              {menuItems.map(item => (
                 <RouterLink key={item.to} to={item.to} className={navLinkClasses}>
                    {item.label}
                 </RouterLink>
              ))}
              <NotificationBell />
              <Button onClick={handleLogout} variant="outline" size="sm">Đăng xuất</Button>
            </div>
          ) : (
             <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" asChild><RouterLink to="/login">Đăng nhập</RouterLink></Button>
                <Button asChild><RouterLink to="/register">Đăng ký</RouterLink></Button>
             </div>
          )}
        </nav>
          {/* mobile menu button */}
        <button className="md:hidden " onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>          <span className="block w-6 h-0.5 bg-primary mb-1" />
          <span className="block w-6 h-0.5 bg-primary mb-1" />
          <span className="block w-6 h-0.5 bg-primary" />
        </button>
        {/* mobile menu */}        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-md md:hidden z-50">
            <nav className="flex flex-col items-center py-2">
              {menuItems.map(item => (
                <RouterLink key={item.to} to={item.to} className="w-full px-4 py-3 text-primary font-semibold hover:bg-blue-50 text-center" onClick={() => setMobileMenuOpen(false)}>
                  {item.label}
                </RouterLink>
              ))}
              {isAuthenticated && (
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full px-4 py-3 text-primary font-semibold hover:bg-blue-50 text-center">Đăng xuất</button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
