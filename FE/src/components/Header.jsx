// src/components/Header.jsx
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Việc làm', to: '/' },
    user && user.role === 'employer' ? { label: 'Quản lý', to: '/employer/dashboard' } : null,
    isAuthenticated ? { label: 'Hồ sơ', to: '/profile' } : null,
    isAuthenticated ? { label: 'Đã ứng tuyển', to: '/my-applications' } : null,
    isAuthenticated ? { label: 'Việc đã lưu', to: '/favorites' } : null,
    !isAuthenticated ? { label: 'Đăng nhập', to: '/login' } : null,
    !isAuthenticated ? { label: 'Đăng ký', to: '/register' } : null,
  ].filter(Boolean);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <RouterLink to="/" className="flex items-center gap-2 font-bold text-primary text-xl">
          <img src="/images/vnw-logo.png" alt="Logo" className="h-9" />
          <span className="tracking-wide drop-shadow">JobBoard</span>
        </RouterLink>
        <nav className="hidden md:flex items-center gap-2 flex-1 justify-end">
          {menuItems.map(item => (
            <RouterLink key={item.to} to={item.to} className="px-3 py-2 font-semibold text-primary hover:underline">
              {item.label}
            </RouterLink>
          ))}
          {isAuthenticated && <NotificationBell />}
          {isAuthenticated && (
            <button onClick={handleLogout} className="ml-2 px-3 py-2 font-semibold text-primary hover:underline">Đăng xuất</button>
          )}
        </nav>
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className="block w-6 h-0.5 bg-primary mb-1" />
          <span className="block w-6 h-0.5 bg-primary mb-1" />
          <span className="block w-6 h-0.5 bg-primary" />
        </button>
        
        {mobileMenuOpen && (
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
