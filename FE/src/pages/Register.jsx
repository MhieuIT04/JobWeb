// src/pages/Register.jsx

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// Import các component từ MUI
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Grid,
    Link,
    CircularProgress,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Avatar,Paper
} from '@mui/material';

// Import Icon
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

function Register() {
    // State cho form data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        role: 'candidate', // Giá trị mặc định là 'Ứng viên'
    });

    // State cho lỗi, thành công, và loading
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Hàm chung để xử lý khi input thay đổi
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Hàm xử lý khi submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Reset trạng thái trước mỗi lần submit
        setError('');
        setSuccess('');
        setLoading(true);

        // --- Validation phía client ---
        if (formData.password !== formData.passwordConfirm) {
            setError("Mật khẩu xác nhận không khớp.");
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError("Mật khẩu phải có ít nhất 8 ký tự.");
            setLoading(false);
            return;
        }

        try {
            // Chuẩn bị dữ liệu gửi lên server
            const payload = {
                email: formData.email,
                password: formData.password,
                role: formData.role,
            };

            // Gọi API
            await axiosClient.post('/api/users/register/', payload);
            
            setSuccess('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập sau 2 giây.');

            // Tự động chuyển hướng người dùng đến trang đăng nhập sau 2 giây
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            // Xử lý lỗi từ server
            const errorMessage = err.response?.data?.email?.[0]
                || err.response?.data?.password?.[0]
                || 'Email đã tồn tại hoặc đã có lỗi xảy ra khi đăng ký.';
            setError(errorMessage);
        } finally {
            // Dừng trạng thái loading dù thành công hay thất bại
            setLoading(false);
        }
    };

    return (
        <Box sx={{ background: 'linear-gradient(120deg, #e3f2fd 60%, #fff 100%)', minHeight: '100vh', pb: 6 }}>
            <Container component="main" maxWidth="xs" sx={{ pt: 8, pb: 8 }}>
                <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, boxShadow: 6, background: 'rgba(255,255,255,0.97)' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 64, height: 64 }}>
                            <LockOutlinedIcon fontSize="large" />
                        </Avatar>
                        <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                            Đăng ký tài khoản
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
                            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                            {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl component="fieldset" sx={{ width: '100%' }}>
                                        <FormLabel component="legend" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>Bạn là?</FormLabel>
                                        <RadioGroup
                                            row
                                            aria-label="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                        >
                                            <FormControlLabel value="candidate" control={<Radio color="primary" />} label="Ứng viên" />
                                            <FormControlLabel value="employer" control={<Radio color="primary" />} label="Nhà tuyển dụng" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Địa chỉ Email"
                                        name="email"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Mật khẩu (tối thiểu 8 ký tự)"
                                        type="password"
                                        id="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="passwordConfirm"
                                        label="Xác nhận mật khẩu"
                                        type="password"
                                        id="passwordConfirm"
                                        error={formData.passwordConfirm !== '' && formData.password !== formData.passwordConfirm}
                                        helperText={formData.passwordConfirm !== '' && formData.password !== formData.passwordConfirm ? "Mật khẩu không khớp" : ""}
                                        value={formData.passwordConfirm}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 4, mb: 2, borderRadius: 2, fontWeight: 700, fontSize: 18, py: 1.5, boxShadow: 2 }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng ký'}
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link component={RouterLink} to="/login" variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                        Đã có tài khoản? Đăng nhập
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default Register;