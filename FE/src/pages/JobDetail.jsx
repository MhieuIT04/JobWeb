// src/pages/JobDetail.jsx

import React, { useState, useEffect } from 'react'; // <--- ĐÃ SỬA: Import đầy đủ các hook
import { useParams, Link as RouterLink } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';

// Import Modal
import ApplyModal from '../components/ApplyModal';
import { toast } from 'react-toastify';

// Import các component từ Shadcn/ui và Lucide
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Briefcase, DollarSign, Star, Tag } from "lucide-react";

function JobDetail() {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();

    // Sử dụng hook trực tiếp, không cần "React."
    const [userProfile, setUserProfile] = useState(null);
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    // const [applyError, setApplyError] = useState('');

    // Hook để lấy profile người dùng chỉ khi cần thiết
    useEffect(() => {
        const fetchProfile = async () => {
            if (isAuthenticated && showApplyModal) {
                try {
                    const response = await axiosClient.get('/api/users/profile/');
                    setUserProfile(response.data);
                } catch (error) {
                    console.error("Không thể tải profile cho modal ứng tuyển:", error);
                }
            }
        };
        fetchProfile();
    }, [isAuthenticated, showApplyModal]);

    // Hook để tải dữ liệu chi tiết công việc
    useEffect(() => {
        const fetchJobDetail = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axiosClient.get(`/api/jobs/${id}/`);
                setJob(response.data);
            } catch (err) {
                console.error("Lỗi khi tải chi tiết công việc:", err);
                setError("Không tìm thấy công việc hoặc đã có lỗi xảy ra.");
            } finally {
                setIsLoading(false);
            }
        };

        // Chỉ fetch khi có id hợp lệ
        if (id) {
            fetchJobDetail();
        }
    }, [id]);

    // Hàm xử lý khi người dùng nộp đơn từ modal
    const handleApplySubmit = async (coverLetter, cvFile) => {
        setIsApplying(true);

        const formData = new FormData();
        formData.append('job', id);
        formData.append('cover_letter', coverLetter);
        formData.append('cv', cvFile);

        try {
            await axiosClient.post('/api/jobs/applications/', formData);
            
            // Hiển thị thông báo thành công
            toast.success('Ứng tuyển thành công!');
            
            setShowApplyModal(false);

        } catch (err) {
            console.error("Lỗi khi ứng tuyển:", err.response);
            
            // Lấy thông báo lỗi từ backend
            const errorMessage = err.response?.data?.detail 
                              || (err.response?.data?.non_field_errors?.[0])
                              || "Đã có lỗi xảy ra khi nộp đơn.";

            // Hiển thị thông báo lỗi
            toast.error(errorMessage);
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <span className="animate-spin w-12 h-12 border-4 border-blue-300 border-t-transparent rounded-full block" />
            </div>
        );
    }
    if (error) {
        return (
            <Card className="max-w-xl mx-auto mt-10 p-6 text-center text-red-600 font-semibold">{error}</Card>
        );
    }
    if (!job) return null;

    // Badge "Mới" nếu job mới đăng (giả sử có trường created_at)
    const isNew = job.created_at && (Date.now() - new Date(job.created_at).getTime() < 1000 * 60 * 60 * 24 * 3);

    // Ưu tiên logo công việc, nếu không có thì lấy logo công ty
    const logoUrl = job.logo || job.employer?.logo;
    return (
        <div className="min-h-screen pb-6 bg-gradient-to-br from-blue-50 to-white">
            <div className="container max-w-5xl mx-auto pt-8 pb-8">
                <Card className="p-6 md:p-10 bg-white/95 rounded-xl shadow-lg">
                    <div className="flex items-center gap-6 mb-6">
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={logoUrl} />
                            <AvatarFallback>{job.employer?.company_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-primary">
                                {job.title} {isNew && <Badge variant="default" className="ml-2"><Star className="w-4 h-4 mr-1" />Mới</Badge>}
                            </h1>
                            <h2 className="text-lg font-semibold text-primary">{job.employer?.company_name}</h2>
                            <div className="flex flex-wrap gap-4 mt-2 text-gray-500">
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.city?.name || 'N/A'}</span>
                                <span className="flex items-center gap-1"><Tag className="w-4 h-4" />{job.category?.name || 'N/A'}</span>
                                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{job.work_type?.name || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <Separator className="my-6" />
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <h3 className="font-bold mb-2">Mô tả công việc</h3>
                            <p className="whitespace-pre-line text-base">{job.description}</p>
                        </div>
                        <div>
                            <Card className="p-4 bg-blue-50 rounded-lg sticky top-8">
                                <div className="flex items-center mb-2"><DollarSign className="w-5 h-5 text-green-500 mr-2" />
                                <span className="font-bold">{job.min_salary ? 
                                `${new Intl.NumberFormat('vi-VN').format(job.min_salary)} - ${new Intl.NumberFormat('vi-VN').format(job.max_salary)} ${job.currency}` 
                                : "Mức lương: Thương lượng"}</span></div>
                                <div className="text-sm text-gray-500 mb-4">Ngày hết hạn: {job.expires_at ? new Date(job.expires_at).toLocaleDateString('vi-VN') : 'N/A'}</div>
                                {isAuthenticated ? (
                                    <Button className="w-full font-bold py-3" onClick={() => setShowApplyModal(true)}>Ứng tuyển ngay</Button>
                                ) : (
                                    <Button asChild className="w-full font-bold py-3">
                                        <RouterLink to="/login">Đăng nhập để ứng tuyển</RouterLink>
                                    </Button>
                                )}
                            </Card>
                            {job.skills?.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-bold mb-2">Kỹ năng yêu cầu</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map(skill => <Badge key={skill.id} variant="secondary">{skill.name}</Badge>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
            {/* Render Modal */}
            {job && (
                <ApplyModal
                    open={showApplyModal}
                    jobTitle={job.title}
                    userProfile={userProfile}
                    onClose={() => setShowApplyModal(false)}
                    onSubmit={handleApplySubmit}
                    isLoading={isApplying}
                />
            )}
        </div>
    );
}

export default JobDetail;