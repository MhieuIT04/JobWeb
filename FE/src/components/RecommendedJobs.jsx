  import React, { useState, useEffect } from 'react';
    import axiosClient from '../api/axiosClient';
    import JobCard from './JobCard'; // Tái sử dụng JobCard đã được style với shadcn/ui
    import { useAuth } from '../contexts/AuthContext';

    function RecommendedJobs({ currentJobId }) {
        const [recommendations, setRecommendations] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const { isAuthenticated, isJobFavorited, toggleFavorite } = useAuth();
        
        useEffect(() => {
            const fetchRecommendations = async () => {
                if (!currentJobId) return;
                setIsLoading(true);
                try {
                    const response = await axiosClient.get(`/api/jobs/${currentJobId}/recommendations/`);
                    setRecommendations(response.data);
                } catch (error) { 
                    console.error("Lỗi khi tải công việc gợi ý:", error); 
                } finally {
                    setIsLoading(false);
                }
            };
            fetchRecommendations();
        }, [currentJobId]);

        // Không hiển thị gì nếu đang tải hoặc không có gợi ý
        if (isLoading || recommendations.length === 0) {
            return null; 
        }

        return (
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Công việc tương tự</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map(job => (
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
    
    export default RecommendedJobs;