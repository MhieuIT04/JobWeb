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
import { User } from 'lucide-react';

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

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
        <nav className="bg-primary text-white px-4 py-2 flex items-center justify-between shadow">
            <RouterLink to="/" className="font-bold text-xl text-white no-underline">JobBoard</RouterLink>
            <div className="flex items-center gap-2">
                {isAuthenticated ? (
                    <>
                        {user && user.role === 'employer' && (
                            <Button variant="secondary" asChild>
                                <RouterLink to="/employer/dashboard">Quản lý</RouterLink>
                            </Button>
                        )}
                        <Button variant="secondary" asChild>
                            <RouterLink to="/profile">Hồ sơ</RouterLink>
                        </Button>
                        <Button variant="secondary" asChild>
                            <RouterLink to="/my-applications">Đã ứng tuyển</RouterLink>
                        </Button>
                        <Button variant="secondary" asChild>
                            <RouterLink to="/favorites">Việc đã lưu</RouterLink>
                        </Button>
                        <NotificationBell />
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
                        <Button variant="secondary" asChild>
                            <RouterLink to="/login">Đăng nhập</RouterLink>
                        </Button>
                        <Button variant="secondary" asChild>
                            <RouterLink to="/register">Đăng ký</RouterLink>
                        </Button>
                    </>
                )}
            </div>
        </nav>
    );
}

                    
   


export default Navbar;