// src/pages/JobForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import axiosClient from '../api/axiosClient';
import {
    Container, Typography, Box, TextField, Button, Grid,
    FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Paper
} from '@mui/material';

function JobForm() {
    const { jobId } = useParams();
    const isEditMode = !!jobId;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '', description: '', min_salary: '', max_salary: '',
        category: '', city: '', work_type: '', expires_at: '',
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [dropdownData, setDropdownData] = useState({ categories: [], cities: [], workTypes: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [catRes, cityRes, workTypeRes] = await Promise.all([
                axiosClient.get('/api/jobs/categories/'),
                axiosClient.get('/api/users/cities/'),
                axiosClient.get('/api/jobs/work-types/')
            ]);
            setDropdownData({
                categories: catRes.data,
                cities: cityRes.data,
                workTypes: workTypeRes.data
            });
            if (isEditMode) {
                const response = await axiosClient.get(`/api/jobs/employer/jobs/${jobId}/`);
                const jobData = response.data;
                setFormData({
                    title: jobData.title || '',
                    description: jobData.description || '',
                    min_salary: jobData.min_salary || '',
                    max_salary: jobData.max_salary || '',
                    category: jobData.category?.id || '',
                    city: jobData.city?.id || '',
                    work_type: jobData.work_type?.id || '',
                    expires_at: jobData.expires_at?.split('T')[0] || ''
                });
                setLogoPreview(jobData.logo || '');
            }
        } catch (err) {
            console.error("Lỗi tải dữ liệu form:", err);
            setError("Không thể tải dữ liệu cần thiết. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }, [isEditMode, jobId]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
        setIsSubmitting(true);
        setError('');
        try {
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => submitData.append(key, value));
            if (logoFile) submitData.append('logo', logoFile);
            if (isEditMode) {
                await axiosClient.patch(`/api/jobs/employer/jobs/${jobId}/`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await axiosClient.post('/api/jobs/employer/jobs/', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            navigate('/employer/dashboard');
        } catch (err) {
            const errorData = err.response?.data;
            const errorMessages = errorData ? Object.values(errorData).flat().join(' ') : "Lỗi không xác định.";
            setError(errorMessages || "Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                {isEditMode ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}
            </Typography>
            <Paper sx={{ p: 4 }}>
                <Box component="form" onSubmit={handleSubmit} encType="multipart/form-data">
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={3}>
                        <Grid item xs={12}><TextField name="title" label="Chức danh công việc" value={formData.title} onChange={handleChange} fullWidth required /></Grid>
                        <Grid item xs={12}><TextField name="description" label="Mô tả công việc" value={formData.description} onChange={handleChange} fullWidth required multiline rows={6} /></Grid>
                        <Grid item xs={12} sm={4}><FormControl fullWidth required><InputLabel>Ngành nghề</InputLabel><Select name="category" value={formData.category} label="Ngành nghề" onChange={handleChange}>{dropdownData.categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={4}><FormControl fullWidth required><InputLabel>Địa điểm</InputLabel><Select name="city" value={formData.city} label="Địa điểm" onChange={handleChange}>{dropdownData.cities.map(city => <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={4}><FormControl fullWidth required><InputLabel>Loại hình công việc</InputLabel><Select name="work_type" value={formData.work_type} label="Loại hình công việc" onChange={handleChange}>{dropdownData.workTypes.map(wt => <MenuItem key={wt.id} value={wt.id}>{wt.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField name="min_salary" label="Lương tối thiểu" type="number" value={formData.min_salary} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="max_salary" label="Lương tối đa" type="number" value={formData.max_salary} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="expires_at" label="Ngày hết hạn" type="date" value={formData.expires_at} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                        {/* Thêm upload logo công ty/công việc */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                <Button variant="outlined" component="label" fullWidth sx={{ borderRadius: 2, fontWeight: 600 }}>
                                    {logoPreview ? 'Thay đổi logo công việc/công ty' : 'Tải lên logo công việc/công ty'}
                                    <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
                                </Button>
                                {logoPreview && (
                                    <img src={logoPreview} alt="Logo preview" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8, marginTop: 8, border: '1px solid #eee', background: '#fff' }} />
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth sx={{ mt: 2 }}>
                                {isSubmitting ? <CircularProgress size={24} /> : (isEditMode ? 'Lưu thay đổi' : 'Đăng tin')}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}
export default JobForm;