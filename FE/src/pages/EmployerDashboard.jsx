// src/pages/EmployerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// Import các component từ MUI
import {
    Container,
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
    Paper,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    Tooltip // Thêm Tooltip để giải thích icon
} from '@mui/material';

// Import các Icon
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function EmployerDashboard() {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmployerJobs = async () => {
            setIsLoading(true);
            try {
                // Gọi API để lấy các công việc của nhà tuyển dụng
                const response = await axiosClient.get('/api/jobs/employer/jobs/');
                setJobs(response.data.results || response.data);
            } catch (err) {
                console.error("Lỗi tải công việc:", err);
                setError("Không thể tải danh sách công việc của bạn.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmployerJobs();
    }, []);

    const handleDelete = async (jobId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa công việc này? Thao tác này không thể hoàn tác.')) {
            try {
                await axiosClient.delete(`/api/jobs/employer/jobs/${jobId}/`);
                setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
            } catch (err) {
                console.error("Lỗi khi xóa công việc:", err);
                alert("Đã có lỗi xảy ra khi xóa công việc.");
            }
        }
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Quản lý tin tuyển dụng
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/employer/jobs/new')} // Sẽ làm chức năng này sau
                >
                    Đăng tin mới
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper elevation={3}>
                <List>
                    {jobs.length > 0 ? jobs.map((job, index) => (
                        <React.Fragment key={job.id}>
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <Typography variant="h6" component="p">
                                            {job.title}
                                        </Typography>
                                    }
                                    secondary={`Trạng thái: ${job.status} | Ngày tạo: ${new Date(job.created_at).toLocaleDateString('vi-VN')}`}
                                />
                                <Box>
                                    <Tooltip title="Xem các ứng viên">
                                        <IconButton edge="end" color="primary" onClick={() => navigate(`/employer/jobs/${job.id}/applicants`)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Chỉnh sửa">
                                        {/* KÍCH HOẠT NÚT NÀY */}
                                        <IconButton
                                            edge="end"
                                            sx={{ mx: 1 }}
                                            onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xóa">
                                        <IconButton edge="end" color="error" onClick={() => handleDelete(job.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </ListItem>
                            {index < jobs.length - 1 && <Divider />}
                        </React.Fragment>
                    )) : (
                        <ListItem>
                            <ListItemText primary="Bạn chưa đăng tin tuyển dụng nào." />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Container>
    );
}

export default EmployerDashboard;