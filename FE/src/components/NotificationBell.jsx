// src/components/NotificationBell.jsx
import React, { useState } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../contexts/AuthContext';

function NotificationBell() {
    const { notifications, unreadCount } = useAuth();

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