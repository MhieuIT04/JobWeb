// src/components/JobItem.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
// Import icon trái tim, ví dụ từ react-icons
import { FaHeart, FaRegHeart } from 'react-icons/fa'; 

function JobItem({ job }) {
    const { isAuthenticated, favorites, toggleFavorite } = useAuth();
    const isFavorited = favorites.includes(job.id);

    const handleFavoriteClick = (e) => {
        e.preventDefault(); // Ngăn việc chuyển trang khi nhấn nút
        e.stopPropagation();
        if (isAuthenticated) {
            toggleFavorite(job.id);
        } else {
            // Yêu cầu đăng nhập
            alert('Vui lòng đăng nhập để sử dụng chức năng này.');
        }
    };

    return (
        <li className="job-item">
            <Link to={`/jobs/${job.id}`}>
                {/* ... thông tin job ... */}
            </Link>
            <button onClick={handleFavoriteClick} className="favorite-button">
                {isFavorited ? <FaHeart color="red" /> : <FaRegHeart />}
            </button>
        </li>
    );
}