import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    AlertDialog, AlertDialogAction, AlertDialogCancel, 
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
    AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
    FileText, Calendar, Building, ExternalLink, 
    Filter, ArrowUpDown, XCircle, Briefcase 
} from 'lucide-react';
import { toast } from 'react-toastify';

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [withdrawingId, setWithdrawingId] = useState(null);
    const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        applyFiltersAndSort();
    }, [applications, filterStatus, sortBy]);

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get('/api/jobs/applications/');
            setApplications(response.data);
        } catch (err) {
            console.error('Lỗi khi tải danh sách ứng tuyển:', err);
            toast.error('Không thể tải danh sách ứng tuyển.');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
        let filtered = [...applications];

        // Apply filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(app => app.status === filterStatus);
        }

        // Apply sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.applied_at) - new Date(a.applied_at);
                case 'date-asc':
                    return new Date(a.applied_at) - new Date(b.applied_at);
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });

        setFilteredApplications(filtered);
    };

    const handleWithdrawClick = (applicationId) => {
        setWithdrawingId(applicationId);
        setShowWithdrawDialog(true);
    };

    const handleWithdrawConfirm = async () => {
        if (!withdrawingId) return;

        try {
            await axiosClient.delete(`/api/jobs/applications/${withdrawingId}/`);
            toast.success('Đã rút đơn ứng tuyển thành công!');
            
            // Remove from list
            setApplications(prev => prev.filter(app => app.id !== withdrawingId));
        } catch (err) {
            console.error('Lỗi khi rút đơn:', err);
            toast.error('Không thể rút đơn ứng tuyển. Vui lòng thử lại.');
        } finally {
            setShowWithdrawDialog(false);
            setWithdrawingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { 
                label: 'Chờ duyệt', 
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
            },
            'reviewing': { 
                label: 'Đang xem xét', 
                className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
            },
            'accepted': { 
                label: 'Chấp nhận', 
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            },
            'rejected': { 
                label: 'Từ chối', 
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
            }
        };
        
        const config = statusConfig[status] || { 
            label: status, 
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' 
        };
        
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    const getStatusCount = (status) => {
        if (status === 'all') return applications.length;
        return applications.filter(app => app.status === status).length;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Lịch sử ứng tuyển
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Quản lý và theo dõi các đơn ứng tuyển của bạn
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {applications.length}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng số</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">
                                {getStatusCount('pending')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Chờ duyệt</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {getStatusCount('accepted')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Chấp nhận</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">
                                {getStatusCount('rejected')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Từ chối</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Sort */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Filter by Status */}
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Lọc theo trạng thái
                            </label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả ({applications.length})</SelectItem>
                                    <SelectItem value="pending">Chờ duyệt ({getStatusCount('pending')})</SelectItem>
                                    <SelectItem value="reviewing">Đang xem xét ({getStatusCount('reviewing')})</SelectItem>
                                    <SelectItem value="accepted">Chấp nhận ({getStatusCount('accepted')})</SelectItem>
                                    <SelectItem value="rejected">Từ chối ({getStatusCount('rejected')})</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort */}
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                <ArrowUpDown className="w-4 h-4" />
                                Sắp xếp
                            </label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date-desc">Mới nhất</SelectItem>
                                    <SelectItem value="date-asc">Cũ nhất</SelectItem>
                                    <SelectItem value="status">Theo trạng thái</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Applications List */}
            {filteredApplications.length > 0 ? (
                <div className="space-y-4">
                    {filteredApplications.map(app => (
                        <Card key={app.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Job Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <RouterLink 
                                                    to={`/jobs/${app.job?.id || app.job_id}`}
                                                    className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
                                                >
                                                    <Briefcase className="w-5 h-5" />
                                                    {app.job?.title || app.job_title || 'Công việc'}
                                                </RouterLink>
                                                {app.job?.company_name && (
                                                    <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                                                        <Building className="w-4 h-4" />
                                                        <span>{app.job.company_name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {getStatusBadge(app.status)}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Nộp ngày: {new Date(app.applied_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>

                                        {/* Cover Letter */}
                                        {app.cover_letter && (
                                            <details className="mt-3">
                                                <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                                    Xem thư xin việc
                                                </summary>
                                                <p className="text-sm mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded whitespace-pre-line">
                                                    {app.cover_letter}
                                                </p>
                                            </details>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 md:w-48">
                                        {app.cv && (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                asChild
                                                className="w-full"
                                            >
                                                <a 
                                                    href={app.cv} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    Xem CV
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </Button>
                                        )}
                                        
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            asChild
                                            className="w-full"
                                        >
                                            <RouterLink 
                                                to={`/jobs/${app.job?.id || app.job_id}`}
                                                className="flex items-center justify-center gap-2"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Xem công việc
                                            </RouterLink>
                                        </Button>

                                        {/* Withdraw Button - Only for pending status */}
                                        {app.status === 'pending' && (
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => handleWithdrawClick(app.id)}
                                                className="w-full flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Rút đơn
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {filterStatus === 'all' 
                                    ? 'Chưa có đơn ứng tuyển nào' 
                                    : 'Không tìm thấy đơn ứng tuyển'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {filterStatus === 'all'
                                    ? 'Hãy bắt đầu tìm kiếm và ứng tuyển vào các công việc phù hợp với bạn!'
                                    : 'Thử thay đổi bộ lọc để xem các đơn ứng tuyển khác'}
                            </p>
                            {filterStatus === 'all' && (
                                <Button asChild>
                                    <RouterLink to="/jobs">
                                        Tìm việc làm ngay
                                    </RouterLink>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Withdraw Confirmation Dialog */}
            <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận rút đơn ứng tuyển</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn rút đơn ứng tuyển này không? 
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleWithdrawConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Rút đơn
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default MyApplications;
