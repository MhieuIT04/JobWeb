// src/pages/FavoriteJobs.jsx

import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';

// Import Material-UI components
import {
    Container, Grid, Card, CardContent, CardActions, Button,
    Typography, CircularProgress, Box, IconButton, Chip, Avatar, Paper
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

function FavoriteJobs() {
    // State để lưu danh sách các công việc yêu thích
    const [favoriteJobs, setFavoriteJobs] = useState([]);
    // State cho trạng thái loading và lỗi
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lấy thông tin từ AuthContext
    const { isAuthenticated, toggleFavorite } = useAuth();

    useEffect(() => {
        const fetchFavoriteJobs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                console.log("Fetching favorite jobs...");
                // Gọi API để lấy danh sách các "favorite objects"
                // axiosClient đã tự động đính kèm token xác thực
                const response = await axiosClient.get('/api/jobs/favorites/');
                console.log("Favorite jobs response:", response.data);
                
                // Dữ liệu trả về là một mảng các object Favorite, 
                // mỗi object chứa một object 'job' bên trong.
                // Chúng ta chỉ cần lấy ra danh sách các 'job' đó.
                const jobs = response.data.map(favorite => favorite.job);
                setFavoriteJobs(jobs);
                console.log("Favorite jobs set:", jobs);

            } catch (err) {
                console.error("Lỗi khi tải danh sách công việc yêu thích:", err);
                console.error("Error details:", err.response?.data);
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavoriteJobs();
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần khi component được tải

    // Component JobCard cho favorite jobs
    const JobCard = ({ job }) => {
        const handleFavoriteClick = (e) => {
            e.preventDefault();
            if (!isAuthenticated) {
                alert('Vui lòng đăng nhập để sử dụng chức năng này.');
                return;
            }
            toggleFavorite(job.id);
        };

        // Badge "Mới" nếu job mới đăng (giả sử có trường created_at)
        const isNew = job.created_at && (Date.now() - new Date(job.created_at).getTime() < 1000 * 60 * 60 * 24 * 3);

        return (
            <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: 8,
                },
                position: 'relative',
                background: 'linear-gradient(135deg, #f8fafc 60%, #e3f2fd 100%)',
            }}>
                {isNew && (
                    <Chip label="Mới" color="primary" size="small" sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }} icon={<StarIcon />} />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                            variant="rounded"
                            src={job.employer?.logo}
                            sx={{ mr: 2, width: 48, height: 48, boxShadow: 2 }}
                        >
                            {job.employer?.company_name?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                                {job.title}
                            </Typography>
                            <Typography color="text.secondary" sx={{ fontSize: 15 }}>
                                {job.employer?.company_name || 'Tên công ty'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationOnIcon fontSize="small" color="primary" />
                        <Typography variant="body2">{job.city?.name || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <WorkIcon fontSize="small" color="secondary" />
                        <Typography variant="body2">{job.category?.name || 'Ngành nghề'}</Typography>
                    </Box>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold', fontSize: 16, mb: 1 }}>
                        💰 {job.min_salary && job.max_salary ? `${job.min_salary} - ${job.max_salary} ${job.currency}` : "Thương lượng"}
                    </Typography>
                    {/* Tag kỹ năng nếu có */}
                    {job.skills && job.skills.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {job.skills.slice(0, 4).map((skill, idx) => (
                                <Chip key={idx} label={skill} size="small" color="info" />
                            ))}
                        </Box>
                    )}
                </CardContent>
                <CardActions sx={{ mt: 'auto', px: 2, pb: 2 }}>
                    <Button size="small" component={RouterLink} to={`/jobs/${job.id}`} variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 600 }}>
                        Xem chi tiết
                    </Button>
                    <IconButton onClick={handleFavoriteClick} sx={{ marginLeft: 'auto' }} aria-label="remove from favorites">
                        <FavoriteIcon color="error" />
                    </IconButton>
                </CardActions>
            </Card>
        );
    };

    return (
        <Box sx={{ background: 'linear-gradient(120deg, #e3f2fd 60%, #fff 100%)', minHeight: '100vh', pb: 6 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 800, color: '#1976d2', letterSpacing: 1 }}>
                    Công việc yêu thích
                </Typography>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
                        <CircularProgress size={60} />
                    </Box>
                ) : error ? (
                    <Typography color="error" align="center">{error}</Typography>
                ) : favoriteJobs.length === 0 ? (
                    <Paper elevation={3} sx={{ textAlign: 'center', my: 6, p: 4, borderRadius: 4, background: 'rgba(255,255,255,0.95)' }}>
                        <SentimentDissatisfiedIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                            Bạn chưa có công việc yêu thích nào.
                        </Typography>
                        <Button component={RouterLink} to="/" variant="contained" size="large" sx={{ mt: 2, borderRadius: 2 }}>
                            Tìm kiếm công việc ngay!
                        </Button>
                    </Paper>
                ) : (
                    <>
                        <Typography variant="h6" color="primary" sx={{ mb: 3, fontWeight: 600 }}>
                            Tìm thấy {favoriteJobs.length} công việc yêu thích
                        </Typography>
                        <Grid container spacing={4}>
                            {favoriteJobs.map((job) => (
                                <Grid item key={job.id} xs={12} sm={6} md={4}>
                                    <JobCard job={job} />
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}
            </Container>
        </Box>
    );
}

export default FavoriteJobs;