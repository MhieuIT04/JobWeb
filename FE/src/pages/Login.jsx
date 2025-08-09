// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Import component từ MUI
import { 
    Container, 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Alert, 
    Paper, 
    Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError("Vui lòng nhập đầy đủ email và mật khẩu.");
            setLoading(false);
            return;
        }

        const result = await login(email, password);

        if (result.success) {
            navigate('/'); // Chuyển hướng về trang chủ sau khi đăng nhập thành công
        } else {
            setError(result.message);
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
                            Đăng nhập
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Địa chỉ Email"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Mật khẩu"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, borderRadius: 2, fontWeight: 700, fontSize: 18, py: 1.5, boxShadow: 2 }}
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                            </Button>
                            <Typography variant="body2" align="center">
                                Chưa có tài khoản?{' '}
                                <RouterLink to="/register" style={{ textDecoration: 'none', fontWeight: 600, color: '#1976d2' }}>
                                    Đăng ký ngay
                                </RouterLink>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default Login;