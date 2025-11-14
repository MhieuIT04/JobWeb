// src/pages/FavoriteJobs.jsx

import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, MapPin, Briefcase } from "lucide-react";

function FavoriteJobs() {
    // State để lưu danh sách các công việc yêu thích
    const [favoriteJobs, setFavoriteJobs] = useState([]);
    // State cho trạng thái loading và lỗi
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lấy thông tin từ AuthContext
    const { isAuthenticated, toggleFavorite } = useAuth();

    useEffect(() => {
        const fetchFavoriteJobs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                console.log("Fetching favorite jobs...");
                // Gọi API để lấy danh sách các "favorite objects"
                // axiosClient đã tự động đính kèm token xác thực
                const response = await axiosClient.get('/api/jobs/favorites/');
                console.log("Favorite jobs response:", response.data);
                
                // Dữ liệu trả về là một mảng các object Favorite, 
                // mỗi object chứa một object 'job' bên trong.
                // Chúng ta chỉ cần lấy ra danh sách các 'job' đó.
                const jobs = response.data.map(favorite => favorite.job);
                setFavoriteJobs(jobs);
                console.log("Favorite jobs set:", jobs);

            } catch (err) {
                console.error("Lỗi khi tải danh sách công việc yêu thích:", err);
                console.error("Error details:", err.response?.data);
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavoriteJobs();
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần khi component được tải

    // Component JobCard cho favorite jobs
    const JobCard = ({ job }) => {
        const handleFavoriteClick = (e) => {
            e.preventDefault();
            if (!isAuthenticated) {
                alert('Vui lòng đăng nhập để sử dụng chức năng này.');
                return;
            }
            toggleFavorite(job.id);
        };
        const isNew = job.created_at && (Date.now() - new Date(job.created_at).getTime() < 1000 * 60 * 60 * 24 * 3);
        return (
            <Card className="p-6 bg-white/95 dark:bg-gray-900 rounded-xl shadow-lg flex flex-col h-full border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-2">
                    <Avatar className="w-12 h-12 border-2 border-gray-200 dark:border-gray-700">
                        <AvatarImage src={job.employer?.logo} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-blue-300">{job.employer?.company_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-blue-300">{job.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-blue-200">{job.employer?.company_name}</p>
                    </div>
                    {isNew && <Badge variant="default" className="ml-auto bg-green-500 dark:bg-green-600"><Star className="w-4 h-4 mr-1" />Mới</Badge>}
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-blue-200 text-sm mb-2">
                    <MapPin className="w-4 h-4" />{job.city?.name || 'N/A'}
                    <Briefcase className="w-4 h-4" />{job.category?.name || 'Ngành nghề'}
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    <Button asChild size="sm" className="font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" variant="default">
                        <RouterLink to={`/jobs/${job.id}`}>Xem chi tiết</RouterLink>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={handleFavoriteClick} className="ml-auto text-red-500 dark:text-red-400">
                        <Heart className="w-5 h-5" />
                    </Button>
                </div>
            </Card>
        );
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen pb-24">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-extrabold text-center text-blue-700 dark:text-blue-300 mb-8">
                    Công việc yêu thích
                </h1>
                {isLoading ? (
                    <div className="flex justify-center my-12">
                        <svg className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4.293 12.293a1 1 0 011.414 0L12 18.586l6.293-6.293a1 1 0 111.414 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 010-1.414z"></path>
                        </svg>
                    </div>
                ) : error ? (
                    <p className="text-red-500 dark:text-red-400 text-center">{error}</p>
                ) : favoriteJobs.length === 0 ? (
                    <div className="text-center my-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M3 12h18M3 21h18" />
                        </svg>
                        <p className="text-lg text-gray-500 dark:text-blue-200 mb-4">
                            Bạn chưa có công việc yêu thích nào.
                        </p>
                        <Button component={RouterLink} to="/" variant="primary" size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                            Tìm kiếm công việc ngay!
                        </Button>
                    </div>
                ) : (
                    <>
                        <p className="text-center text-lg text-blue-600 dark:text-blue-300 mb-6">
                            Tìm thấy {favoriteJobs.length} công việc yêu thích
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favoriteJobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default FavoriteJobs;