// src/pages/Register.jsx

import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// Import các component từ shadcn/ui
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus } from "lucide-react";

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
        <div className="min-h-screen pb-6 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="container max-w-md mx-auto pt-8 pb-8">
                <Card className="p-6 sm:p-8 shadow-lg bg-white/95 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center">
                        <Avatar className="w-16 h-16 mb-4 bg-primary dark:bg-blue-600">
                            <AvatarFallback className="bg-blue-600 dark:bg-blue-500">
                                <UserPlus className="w-8 h-8 text-white" />
                            </AvatarFallback>
                        </Avatar>
                        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-blue-300">Đăng ký tài khoản</h1>
                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            {success && (
                                <Alert variant="success">
                                    <AlertDescription>{success}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <label className="font-semibold text-gray-900 dark:text-blue-300 block mb-1">Bạn là?</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-gray-700 dark:text-blue-200">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="candidate"
                                            checked={formData.role === 'candidate'}
                                            onChange={handleChange}
                                            className="accent-blue-600 dark:accent-blue-500"
                                        />
                                        Ứng viên
                                    </label>
                                    <label className="flex items-center gap-2 text-gray-700 dark:text-blue-200">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="employer"
                                            checked={formData.role === 'employer'}
                                            onChange={handleChange}
                                            className="accent-blue-600 dark:accent-blue-500"
                                        />
                                        Nhà tuyển dụng
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Input
                                    required
                                    id="email"
                                    placeholder="Địa chỉ Email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    required
                                    name="password"
                                    placeholder="Mật khẩu (tối thiểu 8 ký tự)"
                                    type="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    required
                                    name="passwordConfirm"
                                    placeholder="Xác nhận mật khẩu"
                                    type="password"
                                    id="passwordConfirm"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                />
                                {formData.passwordConfirm !== '' && formData.password !== formData.passwordConfirm && (
                                    <span className="text-xs text-red-500">Mật khẩu không khớp</span>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </Button>
                            <p className="text-center text-sm text-gray-700 dark:text-blue-200">
                                Đã có tài khoản?{' '}
                                <RouterLink to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                    Đăng nhập
                                </RouterLink>
                            </p>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default Register;