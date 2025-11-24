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

import RecommendedJobs from '../components/RecommendedJobs';
import HomeFooter from '../components/HomeFooter';

function JobDetail() {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();

    const [userProfile, setUserProfile] = useState(null);
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

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

        if (id) {
            fetchJobDetail();
        }
    }, [id]);

    const handleApplySubmit = async (coverLetter, cvFile) => {
        setIsApplying(true);

        const formData = new FormData();
        formData.append('job', id);
        formData.append('cover_letter', coverLetter);
        if (cvFile) {
            formData.append('cv', cvFile);
        }

        try {
            await axiosClient.post('/api/jobs/applications/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Ứng tuyển thành công!');
            setShowApplyModal(false);
        } catch (err) {
            console.error('Lỗi khi ứng tuyển:', err);
            const errorMsg = err.response?.data?.detail || 'Đã có lỗi xảy ra khi ứng tuyển.';
            toast.error(errorMsg);
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-8">{error}</div>;
    }

    if (!job) {
        return <div className="text-center mt-8">Không tìm thấy công việc.</div>;
    }

    const isNew = job.created_at && (new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24) < 7;

    return (
        <>
        <div className="max-w-5xl mx-auto">
            <Card className="p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={job.logo || job.employer?.logo} alt={job.employer?.company_name} />
                            <AvatarFallback>{job.employer?.company_name?.charAt(0) || 'C'}</AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-primary dark:text-white">
                            {job.title} {isNew && <Badge variant="default" className="ml-2"><Star className="w-4 h-4 mr-1" />Mới</Badge>}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">{job.employer?.company_name || 'Công ty'}</p>
                        {job.employer_avg_rating > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium">{job.employer_avg_rating.toFixed(1)}</span>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-300">
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
                                : "Mức lương: Thương lượng"}</span></div>                                <div className="text-sm text-gray-500 mb-4">Ngày hết hạn: {job.expires_at ? new Date(job.expires_at).toLocaleDateString('vi-VN') : 'N/A'}</div>
                                {isAuthenticated ? (
                                    <Button className="w-full font-bold py-3" onClick={() => setShowApplyModal(true)}>Ứng tuyển ngay</Button>
                                ) : (
                                    <Button asChild className="w-full font-bold py-3"><RouterLink to="/login">Đăng nhập để ứng tuyển</RouterLink></Button>
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
            <RecommendedJobs currentJobId={job.id} />
        </div>
        <HomeFooter />
        </>
    );
}

export default JobDetail;