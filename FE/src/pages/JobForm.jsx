<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// Import các component của shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
=======
// src/pages/JobForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import axiosClient from '../api/axiosClient';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a

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
<<<<<<< HEAD
    const [isPredicting, setIsPredicting] = useState(false);
=======
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
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
<<<<<<< HEAD
                categories: catRes.data, cities: cityRes.data, workTypes: workTypeRes.data
=======
                categories: catRes.data,
                cities: cityRes.data,
                workTypes: workTypeRes.data
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
            });
            if (isEditMode) {
                const response = await axiosClient.get(`/api/jobs/employer/jobs/${jobId}/`);
                const jobData = response.data;
                setFormData({
<<<<<<< HEAD
                    title: jobData.title || '', description: jobData.description || '',
                    min_salary: jobData.min_salary || '', max_salary: jobData.max_salary || '',
                    category: jobData.category?.id.toString() || '', // Chuyển ID sang string
                    city: jobData.city?.id.toString() || '',
                    work_type: jobData.work_type?.id.toString() || '',
=======
                    title: jobData.title || '',
                    description: jobData.description || '',
                    min_salary: jobData.min_salary || '',
                    max_salary: jobData.max_salary || '',
                    category: jobData.category?.id || '',
                    city: jobData.city?.id || '',
                    work_type: jobData.work_type?.id || '',
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                    expires_at: jobData.expires_at?.split('T')[0] || ''
                });
                setLogoPreview(jobData.logo || '');
            }
        } catch (err) {
<<<<<<< HEAD
=======
            console.error("Lỗi tải dữ liệu form:", err);
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
            setError("Không thể tải dữ liệu cần thiết. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }, [isEditMode, jobId]);

<<<<<<< HEAD
    useEffect(() => { fetchInitialData(); }, [fetchInitialData]);
=======
    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

<<<<<<< HEAD
    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

=======
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };
<<<<<<< HEAD
useEffect(() => {
        const title = formData.title;
        const description = formData.description;
        
        // Chỉ kích hoạt khi có đủ nội dung và chưa có category nào được người dùng chọn
        if ((title + description).length > 100 && !formData.category) {
            
            const debounceTimer = setTimeout(() => {
                const predictCategory = async () => {
                    if (isPredicting) return; // Tránh gọi lại khi đang dự đoán
                    
                    setIsPredicting(true);
                    try {
                        const response = await axiosClient.post('/api/jobs/predict-category/', { 
                            title,
                            description 
                        });
                        const { predicted_category_id, predicted_category_name } = response.data;
                        
                        // Sử dụng toast để gợi ý một cách tinh tế
                        toast.info(
                            <div>
                                <p>Gợi ý ngành nghề: <strong>{predicted_category_name}</strong></p>
                                <Button 
                                    size="sm" 
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, category: predicted_category_id }));
                                        toast.dismiss(); // Đóng toast sau khi chọn
                                    }}
                                >
                                    Chọn ngành này
                                </Button>
                            </div>, 
                            { autoClose: 10000, closeOnClick: false } // Tự đóng sau 10s
                        );

                    } catch (error) {
                        console.error("Lỗi khi dự đoán ngành nghề:", error);
                    } finally {
                        setIsPredicting(false);
                    }
                };
                predictCategory();
            }, 2000); // Đợi 2 giây sau khi người dùng ngừng gõ
            
            return () => clearTimeout(debounceTimer);
        }
    }, [formData.title, formData.description, formData.category, isPredicting]); // Thêm isPredicting vào dependency
=======
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const submitData = new FormData();
<<<<<<< HEAD
            Object.entries(formData).forEach(([key, value]) => {
                if(value) submitData.append(key, value);
            });
            if (logoFile) submitData.append('logo', logoFile);
            
            if (isEditMode) {
                await axiosClient.patch(`/api/jobs/employer/jobs/${jobId}/`, submitData);
            } else {
                await axiosClient.post('/api/jobs/employer/jobs/', submitData);
            }
            toast.success(isEditMode ? 'Cập nhật thành công!' : 'Đăng tin thành công!');
=======
            Object.entries(formData).forEach(([key, value]) => submitData.append(key, value));
            if (logoFile) submitData.append('logo', logoFile);
            if (isEditMode) {
                await axiosClient.patch(`/api/jobs/employer/jobs/${jobId}/`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await axiosClient.post('/api/jobs/employer/jobs/', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
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
<<<<<<< HEAD
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;
    }

    return (
        <Card className="max-w-3xl mx-auto my-8">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">
                    {isEditMode ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                    
                    <div className="space-y-2">
                        <Label htmlFor="title">Chức danh công việc</Label>
                        <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả công việc</Label>
                        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={8} />
                        {isPredicting && <p className="text-sm text-muted-foreground">Đang phân tích ngành nghề...</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Ngành nghề</Label><Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}><SelectTrigger><SelectValue placeholder="Chọn ngành nghề" /></SelectTrigger><SelectContent>{dropdownData.categories.map(cat => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2"><Label>Địa điểm</Label><Select name="city" value={formData.city} onValueChange={(value) => handleSelectChange('city', value)}><SelectTrigger><SelectValue placeholder="Chọn địa điểm" /></SelectTrigger><SelectContent>{dropdownData.cities.map(city => <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2"><Label>Loại hình công việc</Label><Select name="work_type" value={formData.work_type} onValueChange={(value) => handleSelectChange('work_type', value)}><SelectTrigger><SelectValue placeholder="Chọn loại hình" /></SelectTrigger><SelectContent>{dropdownData.workTypes.map(wt => <SelectItem key={wt.id} value={wt.id.toString()}>{wt.name}</SelectItem>)}</SelectContent></Select></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="min_salary">Lương tối thiểu</Label><Input id="min_salary" name="min_salary" type="number" value={formData.min_salary} onChange={handleChange} /></div>
                        <div className="space-y-2"><Label htmlFor="max_salary">Lương tối đa</Label><Input id="max_salary" name="max_salary" type="number" value={formData.max_salary} onChange={handleChange} /></div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="expires_at">Ngày hết hạn</Label>
                        <Input id="expires_at" name="expires_at" type="date" value={formData.expires_at} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label>Logo công việc/công ty</Label>
                        <Input type="file" accept="image/*" onChange={handleLogoChange} />
                        {logoPreview && <img src={logoPreview} alt="Logo preview" className="w-24 h-24 object-contain rounded mt-2 border p-1" />}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'Lưu thay đổi' : 'Đăng tin'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default JobForm;
=======
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
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
