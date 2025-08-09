// src/components/Header.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Menu, MenuItem, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

function Header() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Logo VietnamWorks style
    const logo = (
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: 4 }} component={RouterLink} to="/">
            <img src="/images/vnw-logo.png" alt="Logo" style={{ height: 36, marginRight: 8 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#005baa', letterSpacing: 1, textShadow: '0 1px 2px #fff' }}>
                JobBoard
            </Typography>
        </Box>
    );

    // Menu items
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
        <AppBar position="sticky" elevation={0} sx={{ background: '#fff', borderBottom: '1px solid #e3e3e3', zIndex: 1201 }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ minHeight: 64, px: 2 }}>
                    {logo}
                    {isMobile ? (
                        <>
                            <IconButton edge="end" color="inherit" onClick={handleMenu}>
                                <MenuIcon />
                            </IconButton>
                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                                {menuItems.map(item => (
                                    <MenuItem key={item.to} component={RouterLink} to={item.to} onClick={handleClose}>
                                        {item.label}
                                    </MenuItem>
                                ))}
                                {isAuthenticated && (
                                    <MenuItem onClick={() => { handleLogout(); handleClose(); }}>Đăng xuất</MenuItem>
                                )}
                            </Menu>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                            {menuItems.map(item => (
                                <Button key={item.to} component={RouterLink} to={item.to} sx={{ color: '#005baa', fontWeight: 600, mx: 1, fontSize: 16 }}>
                                    {item.label}
                                </Button>
                            ))}
                            {isAuthenticated && <NotificationBell />}
                            {isAuthenticated && (
                                <Button onClick={handleLogout} sx={{ color: '#005baa', fontWeight: 600, ml: 2 }}>Đăng xuất</Button>
                            )}
                        </Box>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Header;
