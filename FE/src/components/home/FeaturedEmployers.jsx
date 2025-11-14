  import React, { useEffect, useState } from 'react';
  import axiosClient from '../../api/axiosClient';
  import { Card } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import RatingStars from '../RatingStars';
  import { Link as RouterLink } from 'react-router-dom';

  export default function FeaturedEmployers() {
    const [companies, setCompanies] = useState([]);
    useEffect(() => {
      (async () => {
          try {
              const res = await axiosClient.get('/api/users/companies/top/');
              setCompanies(res.data || []);
          } catch (error) {
              console.error("Failed to fetch featured employers:", error);
          }
      })();
  }, []);
    if (!companies.length) return null;
    return (
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Nhà tuyển dụng nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {companies.slice(0,3).map(c => (
            <Card key={c.id} className="p-5 flex items-center gap-4 bg-white dark:bg-gray-900">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-blue-300 font-semibold">
                {c.company_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{c.company_name}</div>
                <div className="text-xs text-muted-foreground">{c.job_count} việc làm</div>
                <div className="flex items-center gap-1 mt-1">
                  <RatingStars value={c.avg_rating || 0} size={14} />
                  <span className="text-xs">{(c.avg_rating||0).toFixed(1)} ({c.review_count||0})</span>
                </div>
              </div>
              <Button asChild><RouterLink to={`/companies/${c.id}`}>Xem công ty</RouterLink></Button>
            </Card>
          ))}
        </div>
      </div>
    );
  }


