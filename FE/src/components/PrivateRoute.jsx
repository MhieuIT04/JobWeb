// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    // Nếu người dùng chưa được xác thực, chuyển hướng họ đến trang đăng nhập
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Nếu đã xác thực, hiển thị component con (Profile, MyApplications,...)
    return children;
};

export default PrivateRoute;