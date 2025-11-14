import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import JobCard from '../JobCard';

export default function TrendingJobs() {
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    (async () => {
        try {
            const res = await axiosClient.get('/api/jobs/trending-24h/');
            setJobs(res.data?.results || res.data || []);
        } catch (error) {
            console.error("Failed to fetch trending jobs:", error);
        }
    })();
}, []);
  if (!jobs?.length) return null;
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Được ứng tuyển nhiều trong 24h</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map(j => <JobCard key={j.id} job={j} />)}
      </div>
    </div>
  );
}


