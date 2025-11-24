import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await axiosClient.get('/api/jobs/my-applications/');
                setApplications(response.data);
            } catch (err) {
                console.error('Lỗi khi tải danh sách ứng tuyển:', err);
                setError('Không thể tải danh sách ứng tuyển.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { label: 'Chờ duyệt', variant: 'secondary' },
            'accepted': { label: 'Chấp nhận', variant: 'default' },
            'rejected': { label: 'Từ chối', variant: 'destructive' }
        };
        const config = statusMap[status] || { label: status, variant: 'secondary' };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (isLoading) {
        return <div className="text-center py-8">Đang tải...</div>;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <Card className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Lịch sử ứng tuyển</h1>
            <ul className="space-y-4">
                {applications.length > 0 ? applications.map(app => (
                    <li key={app.id} className="border-b pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <RouterLink to={`/jobs/${app.job_id}`} className="font-semibold text-lg hover:underline">{app.job_title}</RouterLink>
                                <div className="text-sm text-gray-500">Ngày nộp: {new Date(app.applied_at).toLocaleDateString('vi-VN')}</div>
                                {app.employer_id && (
                                  <div className="text-sm mt-1">Công ty: <RouterLink className="underline" to={`/companies/${app.employer_id}`}>{app.employer_company || `#${app.employer_id}`}</RouterLink></div>
                                )}
                            </div>
                            <div>{getStatusBadge(app.status)}</div>
                        </div>
                        {app.cover_letter && (
                            <details className="mt-2">
                                <summary className="cursor-pointer text-sm text-primary">Xem thư xin việc</summary>
                                <p className="text-sm mt-2 whitespace-pre-line">{app.cover_letter}</p>
                            </details>
                        )}
                        {app.cv && (
                            <Button variant="outline" size="sm" asChild className="mt-2"><a href={app.cv} target="_blank" rel="noopener noreferrer">Xem CV</a></Button>
                        )}
                    </li>
                )) : (
                    <li className="text-center text-gray-500 py-6">Bạn chưa ứng tuyển vào công việc nào.</li>
                )}
            </ul>
        </Card>
    );
}

export default MyApplications;