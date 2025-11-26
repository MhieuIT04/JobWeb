// src/pages/JobApplicants.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { 
    ArrowLeft, Filter, ArrowUpDown, CheckCircle, XCircle, 
    FileText, Mail, Phone, Calendar, Users
} from 'lucide-react';

function JobApplicants() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkDialog, setShowBulkDialog] = useState(false);
    const [bulkAction, setBulkAction] = useState('');

    useEffect(() => {
        fetchData();
    }, [jobId]);

    useEffect(() => {
        applyFiltersAndSort();
    }, [applications, filterStatus, sortBy]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [jobRes, applicantsRes] = await Promise.all([
                axiosClient.get(`/api/jobs/${jobId}/`),
                axiosClient.get(`/api/jobs/employer/jobs/${jobId}/applications/`)
            ]);
            
            setJob(jobRes.data);
            setApplications(applicantsRes.data.results || applicantsRes.data);
        } catch (err) {
            console.error('Lỗi tải dữ liệu:', err);
            toast.error('Không thể tải danh sách ứng viên.');
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
                case 'name-asc': {
                    const nameA = `${a.user_profile?.first_name} ${a.user_profile?.last_name}`.toLowerCase();
                    const nameB = `${b.user_profile?.first_name} ${b.user_profile?.last_name}`.toLowerCase();
                    return nameA.localeCompare(nameB);
                }
                case 'name-desc': {
                    const nameA2 = `${a.user_profile?.first_name} ${a.user_profile?.last_name}`.toLowerCase();
                    const nameB2 = `${b.user_profile?.first_name} ${b.user_profile?.last_name}`.toLowerCase();
                    return nameB2.localeCompare(nameA2);
                }
                default:
                    return 0;
            }
        });

        setFilteredApplications(filtered);
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await axiosClient.patch(`/api/jobs/applications/${applicationId}/update/`, {
                status: newStatus
            });
            
            setApplications(apps => apps.map(app =>
                app.id === applicationId ? { ...app, status: newStatus } : app
            ));
            
            toast.success(`Đã cập nhật trạng thái thành "${newStatus}"`);
        } catch (err) {
            console.error('Lỗi cập nhật:', err);
            toast.error('Không thể cập nhật trạng thái.');
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(filteredApplications.map(app => app.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id, checked) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        }
    };

    const handleBulkAction = (action) => {
        if (selectedIds.length === 0) {
            toast.warning('Vui lòng chọn ít nhất một ứng viên');
            return;
        }
        setBulkAction(action);
        setShowBulkDialog(true);
    };

    const confirmBulkAction = async () => {
        try {
            const promises = selectedIds.map(id =>
                axiosClient.patch(`/api/jobs/applications/${id}/update/`, {
                    status: bulkAction
                })
            );
            
            await Promise.all(promises);
            
            setApplications(apps => apps.map(app =>
                selectedIds.includes(app.id) ? { ...app, status: bulkAction } : app
            ));
            
            setSelectedIds([]);
            toast.success(`Đã ${bulkAction === 'accepted' ? 'chấp nhận' : 'từ chối'} ${selectedIds.length} ứng viên`);
        } catch (err) {
            console.error('Lỗi bulk action:', err);
            toast.error('Không thể thực hiện hành động.');
        } finally {
            setShowBulkDialog(false);
            setBulkAction('');
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            'pending': { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
            'accepted': { label: 'Chấp nhận', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
            'rejected': { label: 'Từ chối', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
        };
        const { label, className } = config[status] || config.pending;
        return <Badge className={className}>{label}</Badge>;
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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate('/employer/dashboard')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại Dashboard
                </Button>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-6 h-6" />
                            Quản lý ứng viên
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {job?.title}
                            </h2>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Đăng ngày: {job?.created_at ? new Date(job.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {applications.length} ứng viên
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold">{applications.length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tổng số</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{getStatusCount('pending')}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Chờ duyệt</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-green-600">{getStatusCount('accepted')}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Chấp nhận</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-red-600">{getStatusCount('rejected')}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Từ chối</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Actions */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        {/* Filter */}
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
                                    <SelectItem value="name-asc">Tên A-Z</SelectItem>
                                    <SelectItem value="name-desc">Tên Z-A</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <span className="text-sm font-medium">
                                Đã chọn {selectedIds.length} ứng viên
                            </span>
                            <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleBulkAction('accepted')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Chấp nhận tất cả
                            </Button>
                            <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleBulkAction('rejected')}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Từ chối tất cả
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedIds([])}
                            >
                                Bỏ chọn
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Applicants Table */}
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox 
                                        checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Ứng viên</TableHead>
                                <TableHead>Liên hệ</TableHead>
                                <TableHead>Ngày nộp</TableHead>
                                <TableHead>CV</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredApplications.length > 0 ? filteredApplications.map(app => (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        <Checkbox 
                                            checked={selectedIds.includes(app.id)}
                                            onCheckedChange={(checked) => handleSelectOne(app.id, checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={app.user_profile?.avatar} />
                                                <AvatarFallback>
                                                    {app.user_profile?.first_name?.[0]}{app.user_profile?.last_name?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">
                                                    {app.user_profile?.first_name} {app.user_profile?.last_name}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1 text-sm">
                                            {app.user_profile?.email && (
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <Mail className="w-3 h-3" />
                                                    {app.user_profile.email}
                                                </div>
                                            )}
                                            {app.user_profile?.phone_number && (
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <Phone className="w-3 h-3" />
                                                    {app.user_profile.phone_number}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(app.applied_at).toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell>
                                        {app.cv ? (
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                asChild
                                            >
                                                <a 
                                                    href={app.cv} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    Xem CV
                                                </a>
                                            </Button>
                                        ) : (
                                            <span className="text-sm text-gray-400">Không có</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(app.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Select
                                            value={app.status}
                                            onValueChange={(value) => handleStatusChange(app.id, value)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Chờ duyệt</SelectItem>
                                                <SelectItem value="accepted">Chấp nhận</SelectItem>
                                                <SelectItem value="rejected">Từ chối</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {filterStatus === 'all' 
                                                ? 'Chưa có ứng viên nào' 
                                                : 'Không tìm thấy ứng viên'}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Bulk Action Confirmation Dialog */}
            <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận {bulkAction === 'accepted' ? 'chấp nhận' : 'từ chối'} hàng loạt
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn {bulkAction === 'accepted' ? 'chấp nhận' : 'từ chối'} {selectedIds.length} ứng viên đã chọn không?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmBulkAction}
                            className={bulkAction === 'accepted' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                            Xác nhận
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default JobApplicants;
