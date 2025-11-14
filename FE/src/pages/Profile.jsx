// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import {
    Card
} from "@/components/ui/card";
import {
    Button
} from "@/components/ui/button";
import {
    Input
} from "@/components/ui/input";
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "@/components/ui/avatar";
// import {
//     Alert,
//     AlertDescription
// } from "@/components/ui/alert";
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify'; // Sử dụng toast cho thông báo

function Profile() {
    const {
        user
    } = useAuth();
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
        return <div className="flex justify-center items-center min-h-[60vh]"><span className="animate-spin w-12 h-12 border-4 border-blue-300 border-t-transparent rounded-full block" /></div>;
    }
    return (
        <Card className="p-6 max-w-2xl mx-auto bg-white/95 dark:bg-gray-900 rounded-xl shadow-lg border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-blue-300">Hồ sơ của bạn</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col items-center mb-4">
                    <Avatar className="w-36 h-36 mb-2 border-4 border-gray-200 dark:border-gray-700">
                        <AvatarImage src={avatarPreview} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-blue-300">AVT</AvatarFallback>
                    </Avatar>
                    <Button asChild variant="outline" className="mb-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-blue-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <label>
                            Thay đổi ảnh đại diện
                            <Input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </label>
                    </Button>
                </div>
                {user?.role === 'employer' && (
                    <div className="flex flex-col items-center mb-4 border border-dashed border-blue-300 dark:border-blue-600 p-4 rounded bg-blue-50 dark:bg-gray-800">
                        <span className="font-semibold mb-2 text-blue-600 dark:text-blue-300">Logo công ty</span>
                        <Avatar className="w-36 h-36 mb-2 rounded border-4 border-gray-200 dark:border-gray-700">
                            <AvatarImage src={logoPreview} />
                            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-blue-300">LOGO</AvatarFallback>
                        </Avatar>
                        <Button asChild variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-blue-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <label>
                                Thay đổi Logo
                                <Input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                            </label>
                        </Button>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="first_name" placeholder="Tên" value={profile.first_name || ''} onChange={handleChange} />
                    <Input name="last_name" placeholder="Họ" value={profile.last_name || ''} onChange={handleChange} />
                </div>
                <Input name="phone_number" placeholder="Số điện thoại" value={profile.phone_number || ''} onChange={handleChange} />
                {user?.role === 'employer' && <Input name="company_name" placeholder="Tên công ty" value={profile.company_name || ''} onChange={handleChange} />}
                <textarea name="bio" placeholder="Giới thiệu" value={profile.bio || ''} onChange={handleChange} rows={4} className="w-full rounded border border-gray-300 dark:border-gray-600 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-blue-200 placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                <Button type="submit" className="w-full py-3 text-lg font-bold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" disabled={isSaving}>
                    {isSaving ? 'Đang xử lý...' : 'Lưu thay đổi'}
                </Button>
            </form>
        </Card>
    );
}

export default Profile;