// src/components/Navbar.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import hook useAuth
import NotificationBell from './NotificationBell';
function Navbar() {
    // Lấy trạng thái và các hàm từ AuthContext
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Chuyển hướng về trang login sau khi đăng xuất
    };
    console.log('User in Navbar:', user);

    return (
        // AppBar là component chính cho thanh điều hướng
        <AppBar position="static">
            {/* Toolbar giúp sắp xếp các item bên trong */}
            <Toolbar>
                {/* Tên/Logo của trang web, nhấp vào sẽ về trang chủ */}
                <Typography
                    variant="h6"
                    component={RouterLink}
                    to="/"
                    sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
                >
                    JobBoard
                </Typography>

                {/* Dùng Box để nhóm các nút lại với nhau */}
                <Box>
                    {isAuthenticated ? (
                        // Giao diện khi người dùng đã đăng nhập
                        <>
                            {user && user.role === 'employer' && (
                                <Button color="inherit" component={RouterLink} to="/employer/dashboard">
                                    Quản lý
                                </Button>
                            )}
                            <Button color="inherit" component={RouterLink} to="/profile">
                                Chào, {user?.email}
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/my-applications">
                                Đã ứng tuyển
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/favorites">
                                Việc đã lưu
                            </Button>
                            <NotificationBell />
                            {/* Nút đăng xuất */}
                            <Button color="inherit" onClick={handleLogout}>
                                Đăng xuất
                            </Button>
                        </>
                    ) : (
                        // Giao diện khi người dùng chưa đăng nhập
                        <>
                            <Button color="inherit" component={RouterLink} to="/login">
                                Đăng nhập
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/register">
                                Đăng ký
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;