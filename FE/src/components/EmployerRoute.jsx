// src/components/EmployerRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const EmployerRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    // 1. Kiểm tra đã đăng nhập chưa
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // 2. Kiểm tra có phải là nhà tuyển dụng không
    if (user && user.role !== 'employer') {
        // Nếu không phải, chuyển hướng về trang chủ hoặc trang "không có quyền"
        return <Navigate to="/" />; 
    }

    // 3. Nếu đủ điều kiện, hiển thị trang
    return children;
};

export default EmployerRoute;