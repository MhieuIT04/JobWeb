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
        try {
            const [catRes, cityRes, workTypeRes] = await Promise.all([
                axiosClient.get('/api/jobs/categories/'),
                axiosClient.get('/api/users/cities/'),
                axiosClient.get('/api/jobs/work-types/')
            ]);
            setDropdownData({
                categories: catRes.data, cities: cityRes.data, workTypes: workTypeRes.data
            });
            if (isEditMode) {
                const response = await axiosClient.get(`/api/jobs/employer/jobs/${jobId}/`);
                const jobData = response.data;
                setFormData({
                    title: jobData.title || '', description: jobData.description || '',
                    min_salary: jobData.min_salary || '', max_salary: jobData.max_salary || '',
                    category: jobData.category?.id.toString() || '', // Chuyển ID sang string
                    city: jobData.city?.id.toString() || '',
                    work_type: jobData.work_type?.id.toString() || '',                    expires_at: jobData.expires_at?.split('T')[0] || ''
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

    useEffect(() => { fetchInitialData(); }, [fetchInitialData]);
    
    // Debounce for predict category
    const [predictTimeout, setPredictTimeout] = useState(null);
    const [isPredicting, setIsPredicting] = useState(false);
    const [suggestedCategory, setSuggestedCategory] = useState(null);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // DISABLED: Auto-predict causing lag
        // Will implement manual predict button instead
    };
    
    const predictCategory = async (title, description) => {
        if (!title && !description) return;
        
        setIsPredicting(true);
        try {
            const response = await axiosClient.post('/api/jobs/predict-category/', {
                title: title || formData.title,
                description: description || formData.description
            });
            
            if (response.data.predicted_category_id) {
                setSuggestedCategory({
                    id: response.data.predicted_category_id,
                    name: response.data.predicted_category_name
                });
            }
        } catch (error) {
            console.error('Lỗi khi dự đoán ngành nghề:', error);
        } finally {
            setIsPredicting(false);
        }
    };
    
    const applySuggestedCategory = () => {
        if (suggestedCategory) {
            setFormData(prev => ({ ...prev, category: suggestedCategory.id.toString() }));
            setSuggestedCategory(null);
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if(value) submitData.append(key, value);
            });
            if (logoFile) submitData.append('logo', logoFile);
            
            if (isEditMode) {
                await axiosClient.patch(`/api/jobs/employer/jobs/${jobId}/`, submitData);
            } else {
                await axiosClient.post('/api/jobs/employer/jobs/', submitData);
            }
            toast.success(isEditMode ? 'Cập nhật thành công!' : 'Đăng tin thành công!');            navigate('/employer/dashboard');
        } catch (err) {
            const errorData = err.response?.data;
            const errorMessages = errorData ? Object.values(errorData).flat().join(' ') : "Lỗi không xác định.";
            setError(errorMessages || "Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
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
                    </div>

                    {/* AI Category Prediction */}
                    {!isEditMode && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">🤖 AI Gợi ý ngành nghề</h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">Hệ thống sẽ phân tích và gợi ý ngành nghề phù hợp</p>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="default" 
                                    onClick={() => predictCategory(formData.title, formData.description)}
                                    disabled={isPredicting || !formData.title || !formData.description}
                                >
                                    {isPredicting ? '🤖 Đang phân tích...' : '💡 Gợi ý ngay'}
                                </Button>
                            </div>
                            {suggestedCategory && (
                                <div className="mt-3 flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-800">
                                    <span className="text-sm text-green-700 dark:text-green-300 flex-1">
                                        ✅ Gợi ý: <strong>{suggestedCategory.name}</strong>
                                    </span>
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="outline"
                                        onClick={applySuggestedCategory}
                                    >
                                        Áp dụng
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Ngành nghề</Label>
                            <Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                                <SelectTrigger><SelectValue placeholder="Chọn ngành nghề" /></SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {dropdownData.categories.slice(0, 100).map(cat => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                    ))}
                                    {dropdownData.categories.length > 100 && (
                                        <SelectItem disabled value="more">... và {dropdownData.categories.length - 100} ngành nghề khác</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Địa điểm</Label>
                            <Select name="city" value={formData.city} onValueChange={(value) => handleSelectChange('city', value)}>
                                <SelectTrigger><SelectValue placeholder="Chọn địa điểm" /></SelectTrigger>
                                <SelectContent>
                                    {dropdownData.cities.map(city => (
                                        <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Loại hình công việc</Label>
                            <Select name="work_type" value={formData.work_type} onValueChange={(value) => handleSelectChange('work_type', value)}>
                                <SelectTrigger><SelectValue placeholder="Chọn loại hình" /></SelectTrigger>
                                <SelectContent>
                                    {dropdownData.workTypes.map(wt => (
                                        <SelectItem key={wt.id} value={wt.id.toString()}>{wt.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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