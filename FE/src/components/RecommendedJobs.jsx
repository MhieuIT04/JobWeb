import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import JobCard from './JobCard';
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
                // Try to get recommendations first
                const response = await axiosClient.get(`/api/jobs/${currentJobId}/recommendations/`);
                setRecommendations(response.data);
            } catch (error) { 
                console.error("Lỗi khi tải công việc gợi ý:", error);
                
                // Fallback: Get similar jobs from same category
                try {
                    const jobResponse = await axiosClient.get(`/api/jobs/${currentJobId}/`);
                    const currentJob = jobResponse.data;
                    
                    if (currentJob.category) {
                        const similarResponse = await axiosClient.get(`/api/jobs/?category=${currentJob.category.id}&limit=6`);
                        const similarJobs = (similarResponse.data?.results || similarResponse.data || [])
                            .filter(job => job.id !== parseInt(currentJobId)); // Exclude current job
                        setRecommendations(similarJobs);
                    } else {
                        // Final fallback: Get recent jobs
                        const recentResponse = await axiosClient.get('/api/jobs/?limit=6');
                        const recentJobs = (recentResponse.data?.results || recentResponse.data || [])
                            .filter(job => job.id !== parseInt(currentJobId));
                        setRecommendations(recentJobs);
                    }
                } catch (fallbackError) {
                    console.error("Lỗi khi tải công việc fallback:", fallbackError);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecommendations();
    }, [currentJobId]);

    // Don't show anything if loading
    if (isLoading) {
        return (
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-amber-400">Công việc tương tự</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Don't show if no recommendations
    if (recommendations.length === 0) {
        return null; 
    }

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-amber-400">Công việc tương tự</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map(job => (
                    <JobCard 
                        key={job.id}
                        job={job} 
                        isAuthenticated={isAuthenticated}
                        isFavorited={isJobFavorited && isJobFavorited(job.id)}
                        onToggleFavorite={toggleFavorite}
                    />
                ))}
            </div>
        </div>
    );
}

export default RecommendedJobs;