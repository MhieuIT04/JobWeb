import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RatingStars from '../components/RatingStars';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPage = async (url='/api/users/companies/?order=rating') => {
    setLoading(true);
    try {
      const res = await axiosClient.get(url);
      const data = res.data;
      const results = data.results || data;
      setCompanies(results);
      setNext(data.next || null);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ fetchPage(); }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tất cả công ty</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={()=>fetchPage('/api/users/companies/?order=jobs')}>Sắp xếp theo việc</Button>
          <Button variant="outline" onClick={()=>fetchPage('/api/users/companies/?order=rating')}>Sắp xếp theo đánh giá</Button>
        </div>
      </div>
      {loading ? <p>Đang tải...</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {companies.map(c => (
            <Card key={c.id} className="text-center p-4 bg-white dark:bg-gray-900">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2 text-gray-700 dark:text-blue-300 font-semibold">
                {c.company_name?.charAt(0)}
              </div>
              <div className="font-semibold text-sm truncate">{c.company_name}</div>
              <div className="text-xs text-muted-foreground">{c.job_count} việc làm</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <RatingStars value={c.avg_rating || 0} size={14} />
                <span className="text-xs">{(c.avg_rating||0).toFixed(1)} ({c.review_count||0})</span>
              </div>
            </Card>
          ))}
        </div>
      )}
      {next && <div className="mt-4 text-center"><Button onClick={()=>fetchPage(next)}>Tải thêm</Button></div>}
    </div>
  );
}


