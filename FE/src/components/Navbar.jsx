// src/components/Navbar.jsx
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            logout();
            // Đảm bảo state đã được clear trước khi chuyển hướng
            setTimeout(() => {
                navigate('/login');
            }, 100);
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        }
    };

    return (
    <nav className="bg-white text-gray-800 px-4 py-3 flex items-center justify-between shadow-sm fixed top-0 left-0 w-full z-50 border-b dark:bg-[hsl(var(--card))] dark:text-white">
            <div className="flex items-center gap-4">
                <RouterLink to="/" className="flex items-center gap-3 text-primary hover:opacity-90 transition-opacity dark:text-[hsl(var(--primary-foreground))]">
                    <img src="/logo192.png" alt="JobBoard Logo" className="h-10 w-10 rounded-full" /> 
                    <span className="text-2xl font-bold tracking-wide">JobBoard</span>
                </RouterLink>
                {/* Quick search shortcut */}
                <form onSubmit={(e) => { e.preventDefault(); navigate('/jobs'); }} className="hidden md:flex items-center">
                    <input
                        type="text"
                        placeholder="Tìm việc, vị trí, kỹ năng..."
                        className="px-3 py-1 rounded-md w-72 text-black focus-ring"
                        aria-label="Tìm kiếm công việc"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                // Tương lai: set query param
                            }
                        }}
                    />
                </form>
            </div>
            <div className="flex items-center gap-2">
                {isAuthenticated ? (
                    <>
                        <Button variant="secondary" asChild><RouterLink to="/">Gợi ý</RouterLink></Button>
                        <Button variant="secondary" asChild><RouterLink to="/cv-match">Phân tích CV</RouterLink></Button>
                        {user && user.role === 'employer' && (
                            <>
                                <Button variant="secondary" asChild><RouterLink to="/employer/dashboard">Quản lý</RouterLink></Button>
                                <Button variant="secondary" asChild><RouterLink to="/employer/analytics">Thống kê</RouterLink></Button>
                            </>
                        )}
                        <Button variant="secondary" asChild><RouterLink to="/profile">Hồ sơ</RouterLink></Button>
                        <Button variant="secondary" asChild><RouterLink to="/my-applications">Đã ứng tuyển</RouterLink></Button>
                        <Button variant="secondary" asChild><RouterLink to="/favorites">Việc đã lưu</RouterLink></Button>
                        <Button variant="secondary" asChild><RouterLink to="/messages">Tin nhắn</RouterLink></Button>
                        <NotificationBell />
                                <Button variant="ghost" size="icon" onClick={toggleTheme} title="Chuyển chế độ sáng/tối">
                                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative rounded-full">
                                    <User className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                                    Hồ sơ
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <>
                        <Button variant="secondary" asChild><RouterLink to="/login">Đăng nhập</RouterLink></Button>
                        <Button variant="secondary" asChild><RouterLink to="/register">Đăng ký</RouterLink></Button>
                    </>
                )}
            </div>
        </nav>
    );
}

                    
   


export default Navbar;