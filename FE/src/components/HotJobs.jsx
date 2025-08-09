import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box } from '@mui/material';
import axiosClient from '../api/axiosClient';
import JobCard from './JobCard'; // Tái sử dụng JobCard
import { useAuth } from '../contexts/AuthContext';

function HotJobs() {
    const [jobs, setJobs] = useState([]);
    const { isAuthenticated, isJobFavorited, toggleFavorite } = useAuth();

    useEffect(() => {
        const fetchHotJobs = async () => {
            try {
                const response = await axiosClient.get('/api/jobs/hot/');
                setJobs(response.data);
            } catch (error) { console.error("Lỗi tải công việc hot:", error); }
        };
        fetchHotJobs();
    }, []);

    if (jobs.length === 0) return null; // Ẩn section nếu không có job hot

    return (
        <Box sx={{ my: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>🔥 Các công việc hot nhất</Typography>
            <Grid container spacing={4}>
                {jobs.map(job => (
                    <Grid item key={job.id} xs={12} sm={6} md={4} lg={3}>
                        <JobCard 
                            job={job}
                            isAuthenticated={isAuthenticated}
                            isFavorited={isJobFavorited(job.id)}
                            onToggleFavorite={toggleFavorite}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default HotJobs;