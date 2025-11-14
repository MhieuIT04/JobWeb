import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import JobCard from '../JobCard';

export default function PersonalizedJobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    (async () => {
        try {
            const appsRes = await axiosClient.get('/api/jobs/applications/');
            const applications = appsRes.data?.results || appsRes.data || [];
            
            if (applications.length > 0) {
                const latestJobId = applications[0].job.id; // Giả sử API trả về nested object job
                const recRes = await axiosClient.get(`/api/jobs/${latestJobId}/recommendations/`);
                setJobs(recRes.data?.results || recRes.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch personalized jobs:", error);
        }
    })();
}, []);

  if (!jobs.length) return null;
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">Việc làm gợi ý cho bạn</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map(j => <JobCard key={j.id} job={j} />)}
      </div>
    </div>
  );
}


