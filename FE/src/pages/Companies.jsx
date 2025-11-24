import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import RatingStars from '../components/RatingStars';
import HomeFooter from '../components/HomeFooter';

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
            <Link key={c.id} to={`/companies/${c.id}`}>
              <Card className="text-center p-4 bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow cursor-pointer">
                <Avatar className="w-16 h-16 mx-auto mb-2">
                  <AvatarImage src={c.logo} alt={c.company_name} />
                  <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-blue-300 font-semibold">
                    {c.company_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold text-sm truncate text-gray-900 dark:text-blue-300">{c.company_name}</div>
                <div className="text-xs text-muted-foreground dark:text-blue-200">{c.job_count} việc làm</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <RatingStars value={c.avg_rating || 0} size={14} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{(c.avg_rating||0).toFixed(1)} ({c.review_count||0})</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {next && <div className="mt-4 text-center"><Button onClick={()=>fetchPage(next)}>Tải thêm</Button></div>}
      <HomeFooter />
    </div>
  );
}


