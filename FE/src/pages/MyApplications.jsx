import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
    Container, Typography, Box, CircularProgress, Alert,
    Paper, List, ListItem, ListItemText, Divider, Chip
} from '@mui/material';

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            setIsLoading(true);
            try {
                const response = await axiosClient.get('/api/jobs/applications/');
                setApplications(response.data.results || response.data);
            } catch (err) {
                console.error("Lỗi tải danh sách ứng tuyển:", err);
                setError("Không thể tải dữ liệu.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'accepted': return 'success';
            case 'rejected': return 'error';
            default: return 'info'; // 'pending' sẽ có màu mặc định
        }
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ background: 'linear-gradient(120deg, #e3f2fd 60%, #fff 100%)', minHeight: '100vh', pb: 6 }}>
            <Container maxWidth="md" sx={{ pt: 6, pb: 6 }}>
                <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, boxShadow: 6, background: 'rgba(255,255,255,0.97)' }}>
                    <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 800, color: '#1976d2', letterSpacing: 1 }}>
                        Lịch sử ứng tuyển
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    <List sx={{ padding: 0 }}>
                        {applications.length > 0 ? applications.map((app, index) => (
                            <React.Fragment key={app.id}>
                                <ListItem
                                    button
                                    component={RouterLink}
                                    to={`/jobs/${app.job_id}`}
                                    sx={{ py: 2.5, borderRadius: 3, mb: 1, transition: 'background 0.2s', '&:hover': { background: '#e3f2fd33' } }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6" component="p" sx={{ fontWeight: 700 }}>
                                                {app.job_title}
                                            </Typography>
                                        }
                                        secondary={
                                            `Ngày nộp: ${new Date(app.applied_at).toLocaleDateString('vi-VN')}`
                                        }
                                    />
                                    <Chip label={app.status} color={getStatusChipColor(app.status)} sx={{ textTransform: 'capitalize', fontWeight: 600, fontSize: 15, ml: 2 }} />
                                </ListItem>
                                {index < applications.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        )) : (
                            <ListItem>
                                <ListItemText primary="Bạn chưa ứng tuyển vào công việc nào." />
                            </ListItem>
                        )}
                    </List>
                </Paper>
            </Container>
        </Box>
    );
}

export default MyApplications;