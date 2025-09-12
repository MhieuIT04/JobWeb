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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-6">
            <div className="container mx-auto py-6">
                <div className="bg-white/95 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-blue-600 mb-6">
                        Danh sách ứng viên cho: <span className="font-extrabold">{jobTitle || `Công việc #${jobId}`}</span>
                    </h1>
                    
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold">Ứng viên</TableHead>
                                <TableHead className="font-bold">Ngày nộp</TableHead>
                                <TableHead className="font-bold">CV</TableHead>
                                <TableHead className="font-bold">Trạng thái</TableHead>
                                <TableHead className="text-right font-bold">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.length > 0 ? applications.map(app => (
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
                                                    {app.user_profile?.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(app.applied_at).toLocaleDateString('vi-VN')}</TableCell>
                                        <TableCell>
                                            <Button 
                                                variant="outline" 
                                                disabled={!app.cv}
                                                className="rounded-md font-semibold"
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
                                        <TableCell colSpan={5} align="center">
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