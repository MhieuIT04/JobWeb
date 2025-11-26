// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    User, Briefcase, GraduationCap, Award, Building, 
    Globe, Users, MapPin, Phone, Mail, Upload, X, Plus 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        bio: '',
        // Candidate fields
        current_position: '',
        years_of_experience: '',
        skills: [],
        education: [],
        work_experience: [],
        // Employer fields
        company_name: '',
        company_size: '',
        industry: '',
        website: '',
        company_description: ''
    });
    
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Temporary states for adding items
    const [newSkill, setNewSkill] = useState('');
    const [newEducation, setNewEducation] = useState({ school: '', degree: '', field: '', year: '' });
    const [newExperience, setNewExperience] = useState({ company: '', position: '', duration: '', description: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get('/api/users/profile/');
            const profileData = response.data;
            setProfile({
                ...profileData,
                skills: profileData.skills || [],
                education: profileData.education || [],
                work_experience: profileData.work_experience || []
            });
            setAvatarPreview(profileData.avatar);
            setLogoPreview(profileData.logo);
        } catch (error) {
            toast.error("Không thể tải thông tin hồ sơ.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setProfile({ ...profile, [name]: value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File ảnh không được vượt quá 5MB');
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File ảnh không được vượt quá 5MB');
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    // Skills management
    const addSkill = () => {
        if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
            setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setProfile({ ...profile, skills: profile.skills.filter(s => s !== skillToRemove) });
    };

    // Education management
    const addEducation = () => {
        if (newEducation.school && newEducation.degree) {
            setProfile({ ...profile, education: [...profile.education, { ...newEducation, id: Date.now() }] });
            setNewEducation({ school: '', degree: '', field: '', year: '' });
        }
    };

    const removeEducation = (id) => {
        setProfile({ ...profile, education: profile.education.filter(e => e.id !== id) });
    };

    // Work experience management
    const addExperience = () => {
        if (newExperience.company && newExperience.position) {
            setProfile({ ...profile, work_experience: [...profile.work_experience, { ...newExperience, id: Date.now() }] });
            setNewExperience({ company: '', position: '', duration: '', description: '' });
        }
    };

    const removeExperience = (id) => {
        setProfile({ ...profile, work_experience: profile.work_experience.filter(e => e.id !== id) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        
        // Basic fields
        formData.append('first_name', profile.first_name || '');
        formData.append('last_name', profile.last_name || '');
        formData.append('phone_number', profile.phone_number || '');
        formData.append('bio', profile.bio || '');
        
        if (user?.role === 'candidate') {
            formData.append('current_position', profile.current_position || '');
            formData.append('years_of_experience', profile.years_of_experience || '');
            formData.append('skills', JSON.stringify(profile.skills));
            formData.append('education', JSON.stringify(profile.education));
            formData.append('work_experience', JSON.stringify(profile.work_experience));
        }
        
        if (user?.role === 'employer') {
            formData.append('company_name', profile.company_name || '');
            formData.append('company_size', profile.company_size || '');
            formData.append('industry', profile.industry || '');
            formData.append('website', profile.website || '');
            formData.append('company_description', profile.company_description || '');
        }

        if (avatarFile) formData.append('avatar', avatarFile);
        if (logoFile) formData.append('logo', logoFile);

        try {
            const response = await axiosClient.patch('/api/users/profile/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setProfile(response.data);
            setAvatarFile(null);
            setLogoFile(null);
            setAvatarPreview(response.data.avatar);
            setLogoPreview(response.data.logo);
            
            toast.success('✅ Cập nhật hồ sơ thành công!');
        } catch (err) {
            console.error('Error updating profile:', err);
            const errorMsg = err.response?.data?.message || "Lỗi khi cập nhật hồ sơ. Vui lòng thử lại.";
            toast.error(`❌ ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header with Avatar */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative">
                                <Avatar className="w-32 h-32 border-4 border-gray-200 dark:border-gray-700">
                                    <AvatarImage src={avatarPreview} />
                                    <AvatarFallback className="text-2xl">
                                        {profile.first_name?.[0]}{profile.last_name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer">
                                    <Upload className="w-4 h-4" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {profile.first_name} {profile.last_name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {user?.role === 'candidate' ? profile.current_position || 'Ứng viên' : profile.company_name || 'Nhà tuyển dụng'}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                    {profile.phone_number && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {profile.phone_number}
                                        </Badge>
                                    )}
                                    {user?.email && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {user.email}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Thông tin cơ bản
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="first_name">Tên *</Label>
                                <Input 
                                    id="first_name" 
                                    name="first_name" 
                                    value={profile.first_name || ''} 
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="last_name">Họ *</Label>
                                <Input 
                                    id="last_name" 
                                    name="last_name" 
                                    value={profile.last_name || ''} 
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <Label htmlFor="phone_number">Số điện thoại</Label>
                            <Input 
                                id="phone_number" 
                                name="phone_number" 
                                type="tel"
                                value={profile.phone_number || ''} 
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="bio">Giới thiệu bản thân</Label>
                            <Textarea 
                                id="bio" 
                                name="bio" 
                                value={profile.bio || ''} 
                                onChange={handleChange}
                                rows={4}
                                placeholder="Viết vài dòng giới thiệu về bản thân..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Candidate-specific sections */}
                {user?.role === 'candidate' && (
                    <>
                        {/* Professional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5" />
                                    Thông tin nghề nghiệp
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="current_position">Vị trí hiện tại</Label>
                                    <Input 
                                        id="current_position" 
                                        name="current_position" 
                                        value={profile.current_position || ''} 
                                        onChange={handleChange}
                                        placeholder="VD: Senior Frontend Developer"
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="years_of_experience">Số năm kinh nghiệm</Label>
                                    <Input 
                                        id="years_of_experience" 
                                        name="years_of_experience" 
                                        type="number"
                                        value={profile.years_of_experience || ''} 
                                        onChange={handleChange}
                                        placeholder="VD: 5"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    Kỹ năng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input 
                                        value={newSkill} 
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        placeholder="Nhập kỹ năng và nhấn Enter"
                                    />
                                    <Button type="button" onClick={addSkill}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                            {skill}
                                            <X 
                                                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                                                onClick={() => removeSkill(skill)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Education */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5" />
                                    Học vấn
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Input 
                                        placeholder="Trường học"
                                        value={newEducation.school}
                                        onChange={(e) => setNewEducation({...newEducation, school: e.target.value})}
                                    />
                                    <Input 
                                        placeholder="Bằng cấp"
                                        value={newEducation.degree}
                                        onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                                    />
                                    <Input 
                                        placeholder="Chuyên ngành"
                                        value={newEducation.field}
                                        onChange={(e) => setNewEducation({...newEducation, field: e.target.value})}
                                    />
                                    <Input 
                                        placeholder="Năm tốt nghiệp"
                                        value={newEducation.year}
                                        onChange={(e) => setNewEducation({...newEducation, year: e.target.value})}
                                    />
                                    <Button type="button" onClick={addEducation} className="md:col-span-2">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm học vấn
                                    </Button>
                                </div>
                                
                                <div className="space-y-3">
                                    {profile.education.map((edu) => (
                                        <div key={edu.id} className="p-4 border rounded-lg relative">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2"
                                                onClick={() => removeEducation(edu.id)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                            <h4 className="font-semibold">{edu.degree} - {edu.field}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{edu.school}</p>
                                            <p className="text-sm text-gray-500">{edu.year}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Work Experience */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5" />
                                    Kinh nghiệm làm việc
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Input 
                                        placeholder="Công ty"
                                        value={newExperience.company}
                                        onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                                    />
                                    <Input 
                                        placeholder="Vị trí"
                                        value={newExperience.position}
                                        onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                                    />
                                    <Input 
                                        placeholder="Thời gian (VD: 2020 - 2023)"
                                        value={newExperience.duration}
                                        onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})}
                                    />
                                    <Textarea 
                                        placeholder="Mô tả công việc"
                                        value={newExperience.description}
                                        onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                                        rows={3}
                                    />
                                    <Button type="button" onClick={addExperience}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm kinh nghiệm
                                    </Button>
                                </div>
                                
                                <div className="space-y-3">
                                    {profile.work_experience.map((exp) => (
                                        <div key={exp.id} className="p-4 border rounded-lg relative">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2"
                                                onClick={() => removeExperience(exp.id)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                            <h4 className="font-semibold">{exp.position}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>
                                            <p className="text-sm text-gray-500">{exp.duration}</p>
                                            {exp.description && (
                                                <p className="text-sm mt-2">{exp.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Employer-specific sections */}
                {user?.role === 'employer' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="w-5 h-5" />
                                Thông tin công ty
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Company Logo */}
                            <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-lg">
                                <Avatar className="w-24 h-24 mb-3">
                                    <AvatarImage src={logoPreview} />
                                    <AvatarFallback>LOGO</AvatarFallback>
                                </Avatar>
                                <label className="cursor-pointer">
                                    <Button type="button" variant="outline" asChild>
                                        <span>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Thay đổi Logo
                                        </span>
                                    </Button>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                </label>
                            </div>
                            
                            <div>
                                <Label htmlFor="company_name">Tên công ty *</Label>
                                <Input 
                                    id="company_name" 
                                    name="company_name" 
                                    value={profile.company_name || ''} 
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="company_size">Quy mô công ty</Label>
                                    <Select 
                                        value={profile.company_size || ''} 
                                        onValueChange={(value) => handleSelectChange('company_size', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn quy mô" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1-10">1-10 nhân viên</SelectItem>
                                            <SelectItem value="11-50">11-50 nhân viên</SelectItem>
                                            <SelectItem value="51-200">51-200 nhân viên</SelectItem>
                                            <SelectItem value="201-500">201-500 nhân viên</SelectItem>
                                            <SelectItem value="500+">500+ nhân viên</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div>
                                    <Label htmlFor="industry">Ngành nghề</Label>
                                    <Input 
                                        id="industry" 
                                        name="industry" 
                                        value={profile.industry || ''} 
                                        onChange={handleChange}
                                        placeholder="VD: Công nghệ thông tin"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="website">Website công ty</Label>
                                <Input 
                                    id="website" 
                                    name="website" 
                                    type="url"
                                    value={profile.website || ''} 
                                    onChange={handleChange}
                                    placeholder="https://company.com"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="company_description">Giới thiệu công ty</Label>
                                <Textarea 
                                    id="company_description" 
                                    name="company_description" 
                                    value={profile.company_description || ''} 
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="Giới thiệu về công ty, văn hóa, sứ mệnh..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        Hủy
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isSaving}
                        className="min-w-[150px]"
                    >
                        {isSaving ? 'Đang lưu...' : '✅ Cập nhật hồ sơ'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default Profile;
