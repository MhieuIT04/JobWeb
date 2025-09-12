// src/pages/JobForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import axiosClient from '../api/axiosClient';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        return <div className="flex justify-center items-center min-h-[60vh]"><span className="animate-spin w-12 h-12 border-4 border-blue-300 border-t-transparent rounded-full block" /></div>;
    }
    return (
        <Card className="p-6 max-w-2xl mx-auto bg-white/95 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <Input name="title" placeholder="Chức danh công việc" value={formData.title} onChange={handleChange} required />
                <textarea name="description" placeholder="Mô tả công việc" value={formData.description} onChange={handleChange} required rows={6} className="w-full rounded border border-gray-300 p-3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select name="category" value={formData.category} onChange={handleChange} required className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-primary">
                        <option value="">Ngành nghề</option>
                        {dropdownData.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <select name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-primary">
                        <option value="">Địa điểm</option>
                        {dropdownData.cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                    </select>
                    <select name="work_type" value={formData.work_type} onChange={handleChange} required className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-primary">
                        <option value="">Loại hình công việc</option>
                        {dropdownData.workTypes.map(wt => <option key={wt.id} value={wt.id}>{wt.name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input name="min_salary" placeholder="Lương tối thiểu" type="number" value={formData.min_salary} onChange={handleChange} />
                    <Input name="max_salary" placeholder="Lương tối đa" type="number" value={formData.max_salary} onChange={handleChange} />
                </div>
                <Input name="expires_at" type="date" value={formData.expires_at} onChange={handleChange} />
                <div>
                    <label className="block font-semibold mb-1">Logo công việc/công ty</label>
                    <Input type="file" accept="image/*" onChange={handleLogoChange} />
                    {logoPreview && <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-contain rounded mt-2 border" />}
                </div>
                <Button type="submit" className="w-full py-3 text-lg font-bold" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang xử lý...' : (isEditMode ? 'Lưu thay đổi' : 'Đăng tin')}
                </Button>
            </form>
        </Card>
    );
}
export default JobForm;