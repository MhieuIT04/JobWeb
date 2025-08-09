// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import {
    Container, Box, TextField, Button, Typography, 
    CircularProgress, Grid, Avatar, Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify'; // Sử dụng toast cho thông báo

function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const response = await axiosClient.get('/api/users/profile/');
                const profileData = response.data;
                setProfile(profileData);
                setAvatarPreview(profileData.avatar);
                setLogoPreview(profileData.logo);
            } catch (error) {
                toast.error("Không thể tải thông tin hồ sơ.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        
        // --- LOGIC ĐÃ ĐƯỢC ĐƠN GIẢN HÓA ---
        // Gửi tất cả các trường text, backend sẽ tự xử lý
        formData.append('first_name', profile.first_name || '');
        formData.append('last_name', profile.last_name || '');
        formData.append('phone_number', profile.phone_number || '');
        formData.append('bio', profile.bio || '');
        if (user?.role === 'employer') {
            formData.append('company_name', profile.company_name || '');
        }

        // Thêm file nếu có
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }
        if (logoFile) {
            formData.append('logo', logoFile);
        }
        
        try {
            const response = await axiosClient.patch('/api/users/profile/', formData);
            const updatedProfile = response.data;
            
            // Cập nhật lại state sau khi lưu thành công
            setProfile(updatedProfile);

            // Reset các file state
            setAvatarFile(null);
            setLogoFile(null);
            
            // Hiển thị URL ảnh mới từ server
            setAvatarPreview(updatedProfile.avatar);
            setLogoPreview(updatedProfile.logo);
            
            toast.success('Cập nhật hồ sơ thành công!');
        } catch (err) {
            toast.error("Lỗi khi cập nhật hồ sơ. Vui lòng thử lại.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress size={60} /></Box>;
    }

    return (
        <Box sx={{ background: 'linear-gradient(120deg, #e3f2fd 60%, #fff 100%)', minHeight: '100vh', pb: 6 }}>
            <Container component="main" maxWidth="md" sx={{ pt: 6, pb: 6 }}>
                <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, boxShadow: 6, background: 'rgba(255,255,255,0.97)' }}>
                    <Typography component="h1" variant="h4" align="center" sx={{ mb: 4, fontWeight: 800, color: '#1976d2', letterSpacing: 1 }}>
                        Hồ sơ của bạn
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                            <Avatar sx={{ width: 140, height: 140, mb: 2, boxShadow: 3, border: '4px solid #e3f2fd' }} src={avatarPreview} />
                            <Button variant="outlined" component="label" sx={{ borderRadius: 2, fontWeight: 600 }}>
                                Thay đổi ảnh đại diện
                                <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                            </Button>
                        </Box>
                        {user?.role === 'employer' && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, border: '1.5px dashed #90caf9', p: 2, borderRadius: 3, background: '#f5faff' }}>
                                <Typography sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>Logo công ty</Typography>
                                <Avatar variant="rounded" sx={{ width: 150, height: 150, mb: 2, boxShadow: 2, border: '3px solid #e3f2fd' }} src={logoPreview} />
                                <Button variant="outlined" component="label" sx={{ borderRadius: 2, fontWeight: 600 }}>
                                    Thay đổi Logo
                                    <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
                                </Button>
                            </Box>
                        )}
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField label="Địa chỉ Email" fullWidth value={profile.email || ''} disabled />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField name="first_name" label="Tên" fullWidth value={profile.first_name || ''} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField name="last_name" label="Họ" fullWidth value={profile.last_name || ''} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField name="phone_number" label="Số điện thoại" fullWidth value={profile.phone_number || ''} onChange={handleChange} />
                            </Grid>
                            {user?.role === 'employer' && (
                                <Grid item xs={12}>
                                    <TextField name="company_name" label="Tên công ty" fullWidth value={profile.company_name || ''} onChange={handleChange} />
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <TextField name="bio" label="Giới thiệu" fullWidth multiline rows={4} value={profile.bio || ''} onChange={handleChange} />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 4, mb: 2, borderRadius: 2, fontWeight: 700, fontSize: 18, py: 1.5, boxShadow: 2 }}
                            disabled={isSaving}
                        >
                            {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Lưu thay đổi'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default Profile;