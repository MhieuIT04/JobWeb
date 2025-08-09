// src/components/ApplyModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Modal, Box, Typography, TextField, Button, CircularProgress, Paper, Avatar
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';

// Style cho Box modal
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: 480 },
    outline: 'none',
    border: 'none',
};

function ApplyModal({ open, jobTitle, userProfile, onSubmit, onClose, error, isLoading }) {
    // State riêng cho form trong modal
    const [applicantInfo, setApplicantInfo] = useState({
        fullName: '',
        email: '',
    });
    const [coverLetter, setCoverLetter] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [fileError, setFileError] = useState('');

    // Dùng useEffect để cập nhật form khi profile được tải
    useEffect(() => {
        if (userProfile) {
            setApplicantInfo({
                fullName: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim(),
                email: userProfile.email || '',
            });
        }
    }, [userProfile]); // Hook này sẽ chạy mỗi khi userProfile thay đổi

    const handleInfoChange = (e) => {
        setApplicantInfo({
            ...applicantInfo,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra kích thước file (10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                setFileError('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.');
                setCvFile(null);
                return;
            }
            
            // Kiểm tra loại file
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setFileError('Chỉ chấp nhận file PDF, DOC, DOCX.');
                setCvFile(null);
                return;
            }
            
            setCvFile(file);
            setFileError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Bây giờ chỉ cần truyền coverLetter và cvFile (cvFile có thể null)
        onSubmit(coverLetter, cvFile);
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Paper elevation={8} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, boxShadow: 8, background: 'rgba(255,255,255,0.98)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                            <WorkIcon />
                        </Avatar>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            Ứng tuyển: {jobTitle}
                        </Typography>
                    </Box>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>Thông tin của bạn</Typography>
                        <TextField
                            fullWidth
                            required
                            label="Họ và Tên"
                            name="fullName"
                            value={applicantInfo.fullName}
                            onChange={handleInfoChange}
                            margin="normal"
                            sx={{ background: '#f5faff', borderRadius: 2 }}
                        />
                        <TextField
                            fullWidth
                            required
                            label="Email"
                            name="email"
                            type="email"
                            value={applicantInfo.email}
                            onChange={handleInfoChange}
                            margin="normal"
                            sx={{ background: '#f5faff', borderRadius: 2 }}
                        />
                        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>Tải lên CV của bạn (tùy chọn)</Typography>
                        <Button variant="outlined" component="label" fullWidth sx={{ mt: 1, borderRadius: 2, fontWeight: 600 }}>
                            Chọn file CV (PDF, DOC, DOCX)
                            <input type="file" hidden onChange={handleFileChange} />
                        </Button>
                        {cvFile && <Typography variant="body2" sx={{ mt: 1 }}>Đã chọn: {cvFile.name}</Typography>}
                        {fileError && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{fileError}</Typography>}
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Thư giới thiệu (tùy chọn)"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            sx={{ mt: 2, background: '#f5faff', borderRadius: 2 }}
                        />
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button onClick={onClose} disabled={isLoading} color="inherit" sx={{ borderRadius: 2, fontWeight: 600 }}>
                                Hủy
                            </Button>
                            <Button type="submit" variant="contained" disabled={isLoading} sx={{ borderRadius: 2, fontWeight: 700, fontSize: 16, px: 3, py: 1.2, boxShadow: 2 }}>
                                {isLoading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={20} />
                                        <span>Đang gửi...</span>
                                    </Box>
                                ) : 'Gửi đơn ứng tuyển'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Modal>
    );
}

export default ApplyModal;