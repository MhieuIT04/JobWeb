// src/pages/JobDetail.jsx

import React, { useState, useEffect } from 'react'; // <--- ĐÃ SỬA: Import đầy đủ các hook
import { useParams, Link as RouterLink } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';

// Import Modal
import ApplyModal from '../components/ApplyModal';
import { toast } from 'react-toastify';

// Import các component từ MUI
import {
    Container,
    Grid,
    Typography,
    Box,
    CircularProgress,
    Button,
    Paper,
    Divider,
    Chip,
    Avatar
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';

function JobDetail() {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();

    // Sử dụng hook trực tiếp, không cần "React."
    const [userProfile, setUserProfile] = useState(null);
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    // const [applyError, setApplyError] = useState('');

    // Hook để lấy profile người dùng chỉ khi cần thiết
    useEffect(() => {
        const fetchProfile = async () => {
            if (isAuthenticated && showApplyModal) {
                try {
                    const response = await axiosClient.get('/api/users/profile/');
                    setUserProfile(response.data);
                } catch (error) {
                    console.error("Không thể tải profile cho modal ứng tuyển:", error);
                }
            }
        };
        fetchProfile();
    }, [isAuthenticated, showApplyModal]);

    // Hook để tải dữ liệu chi tiết công việc
    useEffect(() => {
        const fetchJobDetail = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axiosClient.get(`/api/jobs/${id}/`);
                setJob(response.data);
            } catch (err) {
                console.error("Lỗi khi tải chi tiết công việc:", err);
                setError("Không tìm thấy công việc hoặc đã có lỗi xảy ra.");
            } finally {
                setIsLoading(false);
            }
        };

        // Chỉ fetch khi có id hợp lệ
        if (id) {
            fetchJobDetail();
        }
    }, [id]);

    // Hàm xử lý khi người dùng nộp đơn từ modal
    const handleApplySubmit = async (coverLetter, cvFile) => {
        setIsApplying(true);

        const formData = new FormData();
        formData.append('job', id);
        formData.append('cover_letter', coverLetter);
        formData.append('cv', cvFile);

        try {
            await axiosClient.post('/api/jobs/applications/', formData);
            
            // Hiển thị thông báo thành công
            toast.success('Ứng tuyển thành công!');
            
            setShowApplyModal(false);

        } catch (err) {
            console.error("Lỗi khi ứng tuyển:", err.response);
            
            // Lấy thông báo lỗi từ backend
            const errorMessage = err.response?.data?.detail 
                              || (err.response?.data?.non_field_errors?.[0])
                              || "Đã có lỗi xảy ra khi nộp đơn.";

            // Hiển thị thông báo lỗi
            toast.error(errorMessage);
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error" align="center">{error}</Typography>
            </Container>
        );
    }

    if (!job) return null;


    // Badge "Mới" nếu job mới đăng (giả sử có trường created_at)
    const isNew = job.created_at && (Date.now() - new Date(job.created_at).getTime() < 1000 * 60 * 60 * 24 * 3);

    // Ưu tiên logo công việc, nếu không có thì lấy logo công ty
    const logoUrl = job.logo || job.employer?.logo;
    return (
        <Box sx={{ background: 'linear-gradient(120deg, #e3f2fd 60%, #fff 100%)', minHeight: '100vh', pb: 6 }}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={4} sx={{ p: { xs: 2, sm: 4, md: 6 }, borderRadius: 4, background: 'rgba(255,255,255,0.97)' }}>
                    {/* HEADER CÔNG VIỆC */}
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar
                            variant="rounded"
                            src={logoUrl}
                            sx={{ width: 72, height: 72, boxShadow: 2, mr: 2, bgcolor: '#e3f2fd', fontSize: 32 }}
                        >
                            {job.employer?.company_name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800, color: '#1976d2', letterSpacing: 1 }}>
                                {job.title}
                                {isNew && <Chip label="Mới" color="primary" size="small" sx={{ ml: 2, fontWeight: 600 }} icon={<StarIcon />} />}
                            </Typography>
                            <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                                {job.employer?.company_name || 'Tên công ty'}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, color: 'text.secondary', mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocationOnIcon fontSize="small" />
                                    <Typography variant="body2">{job.city?.name || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CategoryIcon fontSize="small" />
                                    <Typography variant="body2">{job.category?.name || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <WorkIcon fontSize="small" />
                                    <Typography variant="body2">{job.work_type?.name || 'N/A'}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Divider sx={{ my: 3 }} />
                    {/* PHẦN THÂN BÀI ĐĂNG - BỐ CỤC 2 CỘT */}
                    <Grid container spacing={{ xs: 3, md: 5 }}>
                        {/* CỘT BÊN TRÁI - NỘI DUNG CHÍNH */}
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Mô tả công việc</Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: 17, color: 'text.primary' }}>
                                {job.description}
                            </Typography>
                        </Grid>
                        {/* CỘT BÊN PHẢI - TÓM TẮT & HÀNH ĐỘNG */}
                        <Grid item xs={12} md={4}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, position: 'sticky', top: '20px', boxShadow: 2, background: '#f5faff' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Thông tin chung</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <AttachMoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 18 }}>
                                        {job.min_salary && job.max_salary ? `${job.min_salary} - ${job.max_salary} ${job.currency}` : "Mức lương: Thương lượng"}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                                    Ngày hết hạn: {job.expires_at ? new Date(job.expires_at).toLocaleDateString('vi-VN') : 'N/A'}
                                </Typography>
                                {isAuthenticated ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        size="large"
                                        sx={{ borderRadius: 2, fontWeight: 700, fontSize: 18, py: 1.5, boxShadow: 2 }}
                                        onClick={() => setShowApplyModal(true)}
                                    >
                                        Ứng tuyển ngay
                                    </Button>
                                ) : (
                                    <Button variant="contained" color="primary" fullWidth size="large" component={RouterLink} to="/login" sx={{ borderRadius: 2, fontWeight: 700, fontSize: 18, py: 1.5, boxShadow: 2 }}>
                                        Đăng nhập để ứng tuyển
                                    </Button>
                                )}
                            </Paper>
                            {/* Phần kỹ năng */}
                            {job.skills && job.skills.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Kỹ năng yêu cầu</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {job.skills.map(skill => (
                                            <Chip key={skill.id} label={skill.name} color="info" size="medium" sx={{ fontWeight: 600 }} />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
            {/* Render Modal */}
            {job && (
                <ApplyModal
                    open={showApplyModal}
                    jobTitle={job.title}
                    userProfile={userProfile}
                    onClose={() => setShowApplyModal(false)}
                    onSubmit={handleApplySubmit}
                    isLoading={isApplying}
                />
            )}
        </Box>
    );
}

export default JobDetail;