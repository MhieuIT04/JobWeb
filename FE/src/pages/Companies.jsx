import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Building, TrendingUp, Briefcase } from 'lucide-react';
import RatingStars from '../components/RatingStars';
import HomeFooter from '../components/HomeFooter';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [totalCount, setTotalCount] = useState(0);

  const fetchPage = async (url) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(url || `/api/users/companies/?order=${sortBy}${searchQuery ? `&search=${searchQuery}` : ''}`);
      const data = res.data;
      const results = data.results || data;
      setCompanies(results);
      setNext(data.next || null);
      setTotalCount(data.count || results.length);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPage();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Khám phá công ty
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tìm hiểu về các công ty hàng đầu và cơ hội việc làm
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm kiếm công ty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Đánh giá cao nhất
                  </div>
                </SelectItem>
                <SelectItem value="jobs">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Nhiều việc làm nhất
                  </div>
                </SelectItem>
                <SelectItem value="name">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Tên A-Z
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {totalCount > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Tìm thấy {totalCount} công ty
            </p>
          )}
        </Card>
        {/* Companies Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              </Card>
            ))}
          </div>
        ) : companies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {companies.map(c => (
                <Link key={c.id} to={`/companies/${c.id}`}>
                  <Card className="text-center p-4 bg-white dark:bg-gray-900 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                    <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-gray-100 dark:border-gray-700">
                      <AvatarImage src={c.logo} alt={c.company_name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-xl">
                        {c.company_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-semibold text-sm truncate text-gray-900 dark:text-blue-300 mb-1">
                      {c.company_name}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-blue-200 mb-2">
                      <Briefcase className="w-3 h-3" />
                      {c.job_count} việc làm
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <RatingStars value={c.avg_rating || 0} size={14} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {(c.avg_rating||0).toFixed(1)}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            {next && (
              <div className="mt-8 text-center">
                <Button onClick={() => fetchPage(next)} size="lg">
                  Tải thêm công ty
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Không tìm thấy công ty
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </Card>
        )}
      </div>
      <HomeFooter />
    </div>
  );
}


