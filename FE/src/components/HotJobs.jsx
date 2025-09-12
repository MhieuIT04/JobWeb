import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import JobCard from './JobCard';
import { useAuth } from '../contexts/AuthContext';
import { Flame } from 'lucide-react';

function HotJobs() {
    const [jobs, setJobs] = useState([]);
    const { isAuthenticated, isJobFavorited, toggleFavorite } = useAuth();

    useEffect(() => {
        const fetchHotJobs = async () => {
            try {
                const response = await axiosClient.get('/api/jobs/hot/');
                setJobs(response.data);
            } catch (error) { console.error("Lỗi tải công việc hot:", error); }
        };
        fetchHotJobs();
    }, []);

    if (jobs.length === 0) return null; // Ẩn section nếu không có job hot

    return (
        <section className="py-8">
            <div className="container">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Flame className="h-6 w-6 text-orange-500" />
                    Các công việc hot nhất
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        </section>
    );
}

export default HotJobs;