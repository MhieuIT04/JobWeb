// src/pages/EmployerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// Import Shadcn/ui components
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Import Lucide Icons (thay thế MUI Icons)
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';

function EmployerDashboard() {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmployerJobs = async () => {
            setIsLoading(true);
            try {
                // Gọi API để lấy các công việc của nhà tuyển dụng
                const response = await axiosClient.get('/api/jobs/employer/jobs/');
                setJobs(response.data.results || response.data);
            } catch (err) {
                console.error("Lỗi tải công việc:", err);
                setError("Không thể tải danh sách công việc của bạn.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmployerJobs();
    }, []);

    const handleDelete = async (jobId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa công việc này? Thao tác này không thể hoàn tác.')) {
            try {
                await axiosClient.delete(`/api/jobs/employer/jobs/${jobId}/`);
                setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
            } catch (err) {
                console.error("Lỗi khi xóa công việc:", err);
                alert("Đã có lỗi xảy ra khi xóa công việc.");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Progress />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-blue-300">                    Quản lý tin tuyển dụng
                </h1>
                <Button
                    onClick={() => navigate('/employer/jobs/new')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"                >
                    <Plus className="h-4 w-4" />
                    Đăng tin mới
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <div className="divide-y dark:divide-gray-700">                    {jobs.length > 0 ? (
                        jobs.map((job) => (
                            <div 
                                key={job.id}
                                className="py-6 flex justify-between items-start transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                            >
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-blue-300 mb-2">
                                        {job.title}
                                    </h2>
                                    
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-2">
                                        <div className="flex items-center text-gray-600 dark:text-blue-200">
                                            <span className="font-medium mr-2">📍 Địa điểm:</span>
                                            <span>{job.city?.name || job.location || 'Chưa cập nhật'}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 dark:text-blue-200">
                                            <span className="font-medium mr-2">💰 Lương:</span>
                                            <span>{job.salary || 'Thỏa thuận'}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 dark:text-blue-200">
                                            <span className="font-medium mr-2">📂 Ngành nghề:</span>
                                            <span>{job.category?.name || 'Khác'}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 dark:text-blue-200">
                                            <span className="font-medium mr-2">💼 Loại hình:</span>
                                            <span>{job.work_type?.name || 'Full-time'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 text-xs text-gray-500 dark:text-blue-300 mt-3">
                                        <span className={`px-3 py-1 rounded-full ${
                                            job.status === 'approved' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                : job.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                            {job.status === 'approved' ? '✓ Đã duyệt' : job.status === 'pending' ? '⏳ Chờ duyệt' : job.status}
                                        </span>
                                        <span>📅 Ngày tạo: {new Date(job.created_at).toLocaleDateString('vi-VN')}</span>
                                        <span className="font-semibold">👥 {job.applicants_count || 0} ứng viên</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4">                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/employer/jobs/${job.id}/applicants`)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Chỉnh sửa</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(job.id)}
                                                    className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Xóa</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-6 text-gray-500 dark:text-blue-200">                            Bạn chưa đăng tin tuyển dụng nào.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}

export default EmployerDashboard;