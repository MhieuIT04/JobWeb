// src/components/NotificationBell.jsx
import React, { useState } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../contexts/AuthContext';

function NotificationBell() {
    const { notifications, unreadCount } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <MenuItem key={notif.id} onClick={handleClose}>
                            <Typography variant="body2">{notif.message}</Typography>
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem onClick={handleClose}>Không có thông báo mới.</MenuItem>
                )}
            </Menu>
        </>
    );
}

export default NotificationBell;