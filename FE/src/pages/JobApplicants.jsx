// src/pages/JobApplicants.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

// Import Shadcn/ui components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function JobApplicants() {
    const { jobId } = useParams();
    const [applications, setApplications] = useState([]);
    const [jobTitle, setJobTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error] = useState(null);

    const fetchApplicants = useCallback(async () => {
        setIsLoading(true);
        try {
            // Bây giờ chỉ cần gọi một API duy nhất
            const applicantsRes = await axiosClient.get(`/api/jobs/employer/jobs/${jobId}/applications/`);
            const data = applicantsRes.data.results || applicantsRes.data;
            setApplications(data);

            // Lấy job title từ application đầu tiên
            if (data?.[0]?.job_title) {
                setJobTitle(data[0].job_title);
            } else {
                // Fallback nếu không có ứng viên nào
                const jobRes = await axiosClient.get(`/api/jobs/${jobId}/`);
                setJobTitle(jobRes.data.title);
            }
        } catch (err) {
            // ...
        } finally {
            setIsLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    const handleStatusChange = async (applicationId, newStatus) => {
        // Cập nhật UI ngay lập tức để có trải nghiệm tốt hơn
        setApplications(apps => apps.map(app =>
            app.id === applicationId ? { ...app, status: newStatus } : app
        ));

        try {
            await axiosClient.patch(`/api/jobs/applications/${applicationId}/update/`, {
                status: newStatus
            });
            toast.success(`Đã cập nhật trạng thái thành "${newStatus}"`);
        } catch (err) {
            toast.error("Không thể cập nhật trạng thái.");
            // Nếu lỗi, rollback lại thay đổi trên UI
            fetchApplicants();
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'accepted': return 'success';
            case 'rejected': return 'destructive';
            default: return 'secondary';
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
<<<<<<< HEAD
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pb-6">
            <div className="container mx-auto py-6">
                <div className="bg-white/95 dark:bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-6">
=======
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-6">
            <div className="container mx-auto py-6">
                <div className="bg-white/95 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-blue-600 mb-6">
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                        Danh sách ứng viên cho: <span className="font-extrabold">{jobTitle || `Công việc #${jobId}`}</span>
                    </h1>
                    
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Table>
                        <TableHeader>
<<<<<<< HEAD
                            <TableRow className="border-b dark:border-gray-700">
                                <TableHead className="font-bold text-gray-900 dark:text-blue-300">Ứng viên</TableHead>
                                <TableHead className="font-bold text-gray-900 dark:text-blue-300">Ngày nộp</TableHead>
                                <TableHead className="font-bold text-gray-900 dark:text-blue-300">CV</TableHead>
                                <TableHead className="font-bold text-gray-900 dark:text-blue-300">Trạng thái</TableHead>
                                <TableHead className="text-right font-bold text-gray-900 dark:text-blue-300">Hành động</TableHead>
=======
                            <TableRow>
                                <TableHead className="font-bold">Ứng viên</TableHead>
                                <TableHead className="font-bold">Ngày nộp</TableHead>
                                <TableHead className="font-bold">CV</TableHead>
                                <TableHead className="font-bold">Trạng thái</TableHead>
                                <TableHead className="text-right font-bold">Hành động</TableHead>
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.length > 0 ? applications.map(app => (
<<<<<<< HEAD
                                <TableRow key={app.id} className="transition-colors border-b dark:border-gray-700">
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 border-2 border-gray-200 dark:border-gray-700">
                                                <AvatarImage src={app.user_profile?.avatar} />
                                                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-blue-300">{app.user_profile?.first_name?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-blue-300">
                                                    {`${app.user_profile?.first_name || ''} ${app.user_profile?.last_name || ''}`.trim() || 'Chưa cập nhật'}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-blue-200">
=======
                                <TableRow key={app.id} className="hover:bg-blue-50/20 transition-colors">
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={app.user_profile?.avatar} />
                                                <AvatarFallback>{app.user_profile?.first_name?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">
                                                    {`${app.user_profile?.first_name || ''} ${app.user_profile?.last_name || ''}`.trim() || 'Chưa cập nhật'}
                                                </div>
                                                <div className="text-sm text-gray-500">
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                                                    {app.user_profile?.email}
                                                </div>
                                            </div>
                                        </TableCell>
<<<<<<< HEAD
                                        <TableCell className="text-gray-700 dark:text-blue-200">{new Date(app.applied_at).toLocaleDateString('vi-VN')}</TableCell>
=======
                                        <TableCell>{new Date(app.applied_at).toLocaleDateString('vi-VN')}</TableCell>
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                                        <TableCell>
                                            <Button 
                                                variant="outline" 
                                                disabled={!app.cv}
<<<<<<< HEAD
                                                className="rounded-md font-semibold border-gray-300 dark:border-gray-600 text-gray-900 dark:text-blue-300 hover:bg-gray-100 dark:hover:bg-gray-800"
=======
                                                className="rounded-md font-semibold"
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                                                asChild
                                            >
                                                <a 
                                                    href={app.cv} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                >
                                                    Xem CV
                                                </a>
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(app.status)}>
                                                {app.status === 'pending' ? 'Đang chờ' : 
                                                app.status === 'accepted' ? 'Đã chấp nhận' : 'Đã từ chối'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Select
                                                value={app.status}
                                                onValueChange={(value) => handleStatusChange(app.id, value)}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue placeholder="Chọn trạng thái" />
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
<<<<<<< HEAD
                                        <TableCell colSpan={5} align="center" className="text-gray-500 dark:text-blue-200 py-8">
=======
                                        <TableCell colSpan={5} align="center">
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                                            Chưa có ứng viên nào cho công việc này.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                </div>
            </div>
        </div>
    );
}

export default JobApplicants;