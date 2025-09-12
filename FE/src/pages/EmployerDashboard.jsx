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
                <h1 className="text-2xl font-bold">
                    Quản lý tin tuyển dụng
                </h1>
                <Button
                    onClick={() => navigate('/employer/jobs/new')}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Đăng tin mới
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="p-6">
                <div className="divide-y">
                    {jobs.length > 0 ? (
                        jobs.map((job) => (
                            <div 
                                key={job.id}
                                className="py-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                            >
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {job.title}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Trạng thái: {job.status} | Ngày tạo: {new Date(job.created_at).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/employer/jobs/${job.id}/applicants`)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Xem ứng viên</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
                                                >
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
                                                    className="text-red-500 hover:text-red-600"
                                                >
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
                        <p className="text-center py-6 text-gray-500">
                            Bạn chưa đăng tin tuyển dụng nào.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}

export default EmployerDashboard;