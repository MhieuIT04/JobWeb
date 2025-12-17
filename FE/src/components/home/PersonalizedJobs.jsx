import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosClient from '../../api/axiosClient';
import JobCard from '../JobCard';

export default function PersonalizedJobs({ currentJobId = null }) {
  const [jobs, setJobs] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
        try {
            if (user) {
                // Nếu user đã đăng nhập, lấy jobs dựa trên applications
                const appsRes = await axiosClient.get('/api/jobs/applications/');
                const applications = appsRes.data?.results || appsRes.data || [];
                
                if (applications.length > 0) {
                    // Kiểm tra xem job có phải là object hay chỉ là ID
                    const latestJobId = typeof applications[0].job === 'object' 
                        ? applications[0].job.id 
                        : applications[0].job;
                        
                    const recRes = await axiosClient.get(`/api/jobs/${latestJobId}/recommendations/`);
                    setJobs(recRes.data?.results || recRes.data || []);
                }
            } else if (currentJobId) {
                // Nếu user chưa đăng nhập nhưng có currentJobId, lấy similar jobs
                const recRes = await axiosClient.get(`/api/jobs/${currentJobId}/recommendations/`);
                setJobs(recRes.data?.results || recRes.data || []);
            } else {
                // Fallback: lấy một số jobs ngẫu nhiên
                const jobsRes = await axiosClient.get('/api/jobs/?limit=6');
                setJobs(jobsRes.data?.results || jobsRes.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch personalized jobs:", error);
            // Fallback: lấy jobs phổ biến
            try {
                const jobsRes = await axiosClient.get('/api/jobs/?limit=6');
                setJobs(jobsRes.data?.results || jobsRes.data || []);
            } catch (fallbackError) {
                console.error("Failed to fetch fallback jobs:", fallbackError);
            }
        }
    })();
}, [user, currentJobId]);

  if (!jobs.length) return null;
  
  const title = user ? "Việc làm gợi ý cho bạn" : 
                currentJobId ? "Việc làm tương tự" : 
                "Việc làm nổi bật";
  
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-amber-400">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map(j => <JobCard key={j.id} job={j} />)}
      </div>
    </div>
  );
}


