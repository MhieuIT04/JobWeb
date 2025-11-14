import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import JobCard from '../JobCard'; 
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton từ shadcn/ui

function HotJobs() {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, isJobFavorited, toggleFavorite } = useAuth();

    useEffect(() => {
        const fetchHotJobs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axiosClient.get('/api/jobs/hot/');
                
                // DEBUG: In ra để xem cấu trúc thật sự của data
                console.log("Hot Jobs API response:", response.data);

                // SỬA LỖI: Lấy mảng jobs từ key 'results' nếu có, nếu không thì dùng response.data
                // Đồng thời đảm bảo nó luôn là một mảng để tránh lỗi .map
                const jobsData = response.data.results || response.data || [];
                setJobs(jobsData);

            } catch (err) { 
                console.error("Lỗi tải công việc hot:", err);
                setError("Không thể tải các công việc nổi bật lúc này.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchHotJobs();
    }, []);

    // Hiển thị skeleton khi đang tải
    if (isLoading) {
        return (
            <div className="py-8">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-blue-300">Các công việc nổi bật</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-lg" />)}
                </div>
            </div>
        );
    }
    
    // Không hiển thị gì nếu có lỗi hoặc không có công việc nào
    // Bạn cũng có thể hiển thị thông báo lỗi nếu muốn: if(error) return <p>{error}</p>
    if (error || jobs.length === 0) {
        return null;
    }

    // Render danh sách công việc khi có dữ liệu
    return (
        <div className="py-8">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-blue-300">Các công việc nổi bật</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {jobs.map(job => (
                    <JobCard 
                        key={job.id}
                        job={job}
                        isAuthenticated={isAuthenticated}
                        isFavorited={isJobFavorited(job.id)}
                        onToggleFavorite={toggleFavorite}
                    />
                ))}
            </div>
        </div>
    );
}

export default HotJobs;