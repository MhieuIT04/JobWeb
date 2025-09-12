import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            setIsLoading(true);
            try {
                const response = await axiosClient.get('/api/jobs/applications/');
                setApplications(response.data.results || response.data);
            } catch (err) {
                console.error("Lỗi tải danh sách ứng tuyển:", err);
                setError("Không thể tải dữ liệu.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplications();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-[60vh]"><span className="animate-spin w-12 h-12 border-4 border-blue-300 border-t-transparent rounded-full block" /></div>;
    }
    return (
        <Card className="p-6 max-w-2xl mx-auto bg-white/95 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-primary">Lịch sử ứng tuyển</h1>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <ul>
                {applications.length > 0 ? applications.map(app => (
                    <li key={app.id} className="flex items-center justify-between py-3 border-b">
                        <div>
                            <RouterLink to={`/jobs/${app.job_id}`} className="font-semibold text-lg hover:underline">{app.job_title}</RouterLink>
                            <div className="text-sm text-gray-500">Ngày nộp: {new Date(app.applied_at).toLocaleDateString('vi-VN')}</div>
                        </div>
                        <Badge variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize text-base font-semibold">{app.status}</Badge>
                    </li>
                )) : (
                    <li className="text-center text-gray-500 py-6">Bạn chưa ứng tuyển vào công việc nào.</li>
                )}
            </ul>
        </Card>
    );
}

export default MyApplications;