import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Card, Button, Avatar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function TopCompanies() {
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const fetchTopCompanies = async () => {
            try {
                const response = await axiosClient.get('/api/users/companies/top/');
                setCompanies(response.data);
            } catch (error) { console.error("Lỗi tải công ty hàng đầu:", error); }
        };
        fetchTopCompanies();
    }, []);

    if (companies.length === 0) return null;

    return (
        <Box sx={{ my: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>⭐ Các công ty hàng đầu</Typography>
            <Grid container spacing={4}>
                {companies.map(company => (
                    <Grid item key={company.id} xs={12} sm={6} md={4} lg={3}>
                        <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Avatar src={company.logo} sx={{ width: 80, height: 80, margin: 'auto', mb: 2 }}>
                                {company.company_name?.charAt(0)}
                            </Avatar>
                            <Typography variant="h6" noWrap>{company.company_name}</Typography>
                            <Typography color="text.secondary" variant="body2">{company.job_count} việc làm</Typography>
                            <Button component={RouterLink} to={`/companies/${company.id}`} sx={{ mt: 2 }}>
                                Xem công việc
                            </Button>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default TopCompanies;