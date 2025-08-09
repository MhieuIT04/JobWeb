// src/components/PopularCategories.jsx

import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Card, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// Import các Icon (tùy chọn, để làm đẹp)
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import ComputerIcon from '@mui/icons-material/Computer';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// Ánh xạ tên ngành nghề với một icon cụ thể
const categoryIcons = {
    'công nghệ': <ComputerIcon fontSize="large" color="primary" />,
    'kinh tế': <AccountBalanceIcon fontSize="large" color="primary" />,
    'dược phẩm': <LocalHospitalIcon fontSize="large" color="primary" />,
    // Thêm các icon khác cho các ngành nghề khác
    'default': <BusinessCenterIcon fontSize="large" color="primary" />
};

const getCategoryIcon = (categoryName) => {
    const lowerCaseName = categoryName.toLowerCase();
    for (const key in categoryIcons) {
        if (lowerCaseName.includes(key)) {
            return categoryIcons[key];
        }
    }
    return categoryIcons['default'];
};


function PopularCategories() {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPopularCategories = async () => {
            try {
                const response = await axiosClient.get('/api/jobs/top-categories/');
                setCategories(response.data.slice(0, 8)); 
            } catch (error) { 
                console.error("Lỗi tải ngành nghề:", error); 
            }
        };
        fetchPopularCategories();
    }, []);

    const handleCategoryClick = (categoryId) => {
        // Khi người dùng nhấp vào, điều hướng đến trang chủ
        // và đặt tham số lọc 'category' trên URL
        navigate(`/?category=${categoryId}`);
    };

    if (categories.length === 0) {
        return null; // Ẩn section nếu không có dữ liệu
    }

    return (
        <Box sx={{ my: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                📖 Ngành nghề được quan tâm nhất
            </Typography>
            <Grid container spacing={2}>
                {categories.map(category => (
                    <Grid item key={category.id} xs={6} sm={4} md={3} lg={1.5}>
                        <Card 
                            sx={{ 
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 6,
                                }
                            }}
                        >
                            <CardActionArea 
                                onClick={() => handleCategoryClick(category.id)}
                                sx={{ 
                                    p: 2, 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    textAlign: 'center'
                                }}
                            >
                                {getCategoryIcon(category.name)}
                                <Typography variant="body1" sx={{ mt: 1, fontWeight: 'medium' }}>
                                    {category.name}
                                </Typography>
                                {/* Bạn có thể thêm API để đếm số công việc cho mỗi ngành */}
                                {/* <Typography variant="body2" color="text.secondary">
                                    {category.job_count} việc làm
                                </Typography> */}
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default PopularCategories;