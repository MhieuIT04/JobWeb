// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Import Shadcn components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback} from "@/components/ui/avatar";

// Import Lucide icons
import { Lock } from 'lucide-react';

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

        try {
            const result = await login(email, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || "Đăng nhập thất bại");
            }
        } catch (error) {
            setError(error.message || "Đã xảy ra lỗi");
        } finally {
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
                                <Lock className="w-8 h-8 text-white" />
                            </AvatarFallback>
                        </Avatar>
                        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-blue-300">
                            Đăng nhập
                        </h1>
                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Input
                                    required
                                    id="email"
                                    placeholder="Địa chỉ Email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    required
                                    name="password"
                                    placeholder="Mật khẩu"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                            </Button>
                            <p className="text-center text-sm text-gray-700 dark:text-blue-200">
                                Chưa có tài khoản?{' '}
                                <RouterLink to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                    Đăng ký ngay
                                </RouterLink>
                            </p>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default Login;