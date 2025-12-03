// src/pages/EmployerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
    Plus, Pencil, Trash2, Users, Briefcase, 
    FileText, UserCheck, Clock, TrendingUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';

function EmployerDashboard() {
    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState({
        total_jobs: 0,
        total_applications: 0,
        pending_applications: 0,
        accepted_candidates: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [deleteJobId, setDeleteJobId] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const jobsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const [jobsRes, statsRes] = await Promise.all([
                axiosClient.get('/api/jobs/employer/jobs/?limit=100'),
                axiosClient.get('/api/jobs/dashboard/employer/stats/')
            ]);
            
            const allJobs = jobsRes.data.results || jobsRes.data;
            setJobs(allJobs);
            setTotalPages(Math.ceil(allJobs.length / jobsPerPage));
            setStats(statsRes.data);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
            toast.error("Không thể tải dữ liệu dashboard.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (jobId, currentStatus) => {
        try {
            const response = await axiosClient.patch(`/api/jobs/employer/jobs/${jobId}/`, {
                is_active: !currentStatus
            });
            
            // Update local state
            setJobs(jobs.map(job => 
                job.id === jobId ? { ...job, is_active: !currentStatus } : job
            ));
            
            toast.success(`Đã ${!currentStatus ? 'kích hoạt' : 'tắt'} tin tuyển dụng`);
        } catch (err) {
            console.error("Lỗi toggle status:", err);
            toast.error("Không thể thay đổi trạng thái tin tuyển dụng.");
        }
    };

    const handleDelete = (jobId) => {
        setDeleteJobId(jobId);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            await axiosClient.delete(`/api/jobs/employer/jobs/${deleteJobId}/`);
            setJobs(jobs.filter(job => job.id !== deleteJobId));
            toast.success("Đã xóa tin tuyển dụng thành công!");
        } catch (err) {
            console.error("Lỗi xóa job:", err);
            toast.error("Không thể xóa tin tuyển dụng.");
        } finally {
            setShowDeleteDialog(false);
            setDeleteJobId(null);
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
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Dashboard Nhà tuyển dụng
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Quản lý tin tuyển dụng và ứng viên
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/employer/analytics')}
                        className="flex items-center gap-2"
                    >
                        <TrendingUp className="h-4 w-4" />
                        Xem thống kê
                    </Button>
                    <Button
                        onClick={() => navigate('/employer/jobs/new')}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Đăng tin mới
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Tổng tin đăng
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {stats.total_jobs}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Tổng ứng viên
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {stats.total_applications}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Chờ xử lý
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {stats.pending_applications}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Đã chấp nhận
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {stats.accepted_candidates}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Jobs List */}
            <Card>
                <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Danh sách tin tuyển dụng</h2>
                    
                    {jobs.length > 0 ? (
                        <>
                        <div className="space-y-4">
                            {jobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage).map((job) => (
                                <div 
                                    key={job.id}
                                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {job.title}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    job.status === 'approved' 
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                    {job.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                <div>📍 {job.city?.name || 'N/A'}</div>
                                                <div>💰 {job.min_salary ? `${job.min_salary.toLocaleString()} VNĐ` : 'Thỏa thuận'}</div>
                                                <div>📂 {job.category?.name || 'N/A'}</div>
                                                <div>👥 {job.applicants_count || 0} ứng viên</div>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                <span>📅 {new Date(job.created_at).toLocaleDateString('vi-VN')}</span>
                                                <div className="flex items-center gap-2">
                                                    <span>Trạng thái:</span>
                                                    <Switch 
                                                        checked={job.is_active !== false}
                                                        onCheckedChange={() => handleToggleStatus(job.id, job.is_active !== false)}
                                                    />
                                                    <span className="font-medium">
                                                        {job.is_active !== false ? 'Đang hoạt động' : 'Tạm dừng'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 ml-4">
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
                                                    <TooltipContent>Chỉnh sửa</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => navigate(`/employer/jobs/${job.id}/applicants`)}
                                                        >
                                                            <Users className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Xem ứng viên</TooltipContent>
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
                                                    <TooltipContent>Xóa</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Trước
                                </Button>
                                <div className="flex items-center gap-2">
                                    {[...Array(totalPages)].map((_, idx) => {
                                        const pageNum = idx + 1;
                                        // Show first, last, current, and adjacent pages
                                        if (
                                            pageNum === 1 ||
                                            pageNum === totalPages ||
                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                        ) {
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className="w-10"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        } else if (
                                            pageNum === currentPage - 2 ||
                                            pageNum === currentPage + 2
                                        ) {
                                            return <span key={pageNum} className="px-2">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Sau
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Bạn chưa đăng tin tuyển dụng nào
                            </p>
                            <Button onClick={() => navigate('/employer/jobs/new')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Đăng tin ngay
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa tin tuyển dụng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa tin tuyển dụng này không? 
                            Hành động này không thể hoàn tác và sẽ xóa tất cả đơn ứng tuyển liên quan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default EmployerDashboard;
