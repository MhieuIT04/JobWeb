// src/pages/JobApplicants.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

// Import các component MUI
import {
    Container, Typography, Box, CircularProgress, Alert, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Select, MenuItem, FormControl, Chip, Avatar
} from '@mui/material';

function JobApplicants() {
    const { jobId } = useParams();
    const [applications, setApplications] = useState([]);
    const [jobTitle, setJobTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error] = useState(null);

    const fetchApplicants = useCallback(async () => {
        setIsLoading(true);
        try {
            // Bây giờ chỉ cần gọi một API duy nhất
            const applicantsRes = await axiosClient.get(`/api/jobs/employer/jobs/${jobId}/applications/`);
            const data = applicantsRes.data.results || applicantsRes.data;
            setApplications(data);

            // Lấy job title từ application đầu tiên
            if (data?.[0]?.job_title) {
                setJobTitle(data[0].job_title);
            } else {
                // Fallback nếu không có ứng viên nào
                const jobRes = await axiosClient.get(`/api/jobs/${jobId}/`);
                setJobTitle(jobRes.data.title);
            }
        } catch (err) {
            // ...
        } finally {
            setIsLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    const handleStatusChange = async (applicationId, newStatus) => {
        // Cập nhật UI ngay lập tức để có trải nghiệm tốt hơn
        setApplications(apps => apps.map(app =>
            app.id === applicationId ? { ...app, status: newStatus } : app
        ));

        try {
            await axiosClient.patch(`/api/jobs/applications/${applicationId}/update/`, {
                status: newStatus
            });
            toast.success(`Đã cập nhật trạng thái thành "${newStatus}"`);
        } catch (err) {
            toast.error("Không thể cập nhật trạng thái.");
            // Nếu lỗi, rollback lại thay đổi trên UI
            fetchApplicants();
        }
    };

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'accepted': return 'success';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ background: 'linear-gradient(120deg, #e3f2fd 60%, #fff 100%)', minHeight: '100vh', pb: 6 }}>
            <Container maxWidth="lg" sx={{ pt: 6, pb: 6 }}>
                <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, boxShadow: 6, background: 'rgba(255,255,255,0.97)' }}>
                    <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 800, color: '#1976d2', letterSpacing: 1 }}>
                        Danh sách ứng viên cho: <strong>{jobTitle || `Công việc #${jobId}`}</strong>
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Ứng viên</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Ngày nộp</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>CV</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Trạng thái</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: 16 }}>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {applications.length > 0 ? applications.map(app => (
                                    <TableRow key={app.id} hover sx={{ transition: 'background 0.2s', '&:hover': { background: '#e3f2fd33' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar sx={{ mr: 2, width: 48, height: 48, boxShadow: 2 }} src={app.user_profile?.avatar} />
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 17 }}>
                                                        {`${app.user_profile?.first_name || ''} ${app.user_profile?.last_name || ''}`.trim() || 'Chưa cập nhật'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {app.user_profile?.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{new Date(app.applied_at).toLocaleDateString('vi-VN')}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                href={app.cv}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                disabled={!app.cv}
                                                sx={{ borderRadius: 2, fontWeight: 600 }}
                                            >
                                                Xem CV
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={app.status} color={getStatusChipColor(app.status)} size="medium" sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 15 }} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                <Select
                                                    value={app.status}
                                                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    <MenuItem value="pending">Chờ duyệt</MenuItem>
                                                    <MenuItem value="accepted">Chấp nhận</MenuItem>
                                                    <MenuItem value="rejected">Từ chối</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            Chưa có ứng viên nào cho công việc này.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </Box>
    );
}

export default JobApplicants;