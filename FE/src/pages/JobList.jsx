// src/pages/JobList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';

// Import các component của shadcn/ui
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Import các component con tùy chỉnh
import HorizontalJobFilters from '../components/HorizontalJobFilters';
import JobGrid from '../components/JobGrid';
import JobGridSkeleton from '../components/JobGridSkeleton';

function JobList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageCount, setPageCount] = useState(0);

  const [filters, setFilters] = useState(() => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  });

  const { isAuthenticated, isJobFavorited, toggleFavorite } = useAuth();
  const page = parseInt(filters.page) || 1;

  // useEffect để tải dữ liệu tĩnh cho bộ lọc
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesRes, citiesRes, workTypesRes] = await Promise.all([
          axiosClient.get('/api/jobs/categories/'),
          axiosClient.get('/api/users/cities/'),
          axiosClient.get('/api/jobs/work-types/')
        ]);
        setCategories(categoriesRes.data);
        setCities(citiesRes.data);
        setWorkTypes(workTypesRes.data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu lọc:", err);
        setError("Không thể tải dữ liệu bộ lọc.");
      }
    };
    fetchFilterData();
  }, []);

  // Hàm fetch jobs, chỉ phụ thuộc vào object `filters`
  const fetchJobs = useCallback(async (currentFilters) => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams(currentFilters);
    try {
      const response = await axiosClient.get(`/api/jobs/`, { params });
      setJobs(response.data.results || []);
      setTotalJobs(response.data.count || 0);
      setPageCount(Math.ceil((response.data.count || 0) / 10));
    } catch (err) {
      setError("Không thể tải danh sách công việc.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect để gọi API và cập nhật URL khi `filters` thay đổi
  useEffect(() => {
    setSearchParams(filters, { replace: true });
    const debounceTimer = setTimeout(() => {
      fetchJobs(filters);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [filters, fetchJobs, setSearchParams]);
  
  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 }); // Reset về trang 1 khi lọc
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pageCount) {
        setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white">
        <div className="container mx-auto px-4 pt-8">
          <div className="max-w-4xl mx-auto mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tìm công việc phù hợp với bạn
            </h1>
            <p className="text-lg text-gray-600">
              Khám phá hàng nghìn cơ hội việc làm tại các công ty hàng đầu
            </p>
            {/* ĐÃ XÓA TEXTFIELD THỪA */}
          </div>
        </div>

        <HorizontalJobFilters
          categories={categories}
          cities={cities}
          workTypes={workTypes}
          initialFilters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {totalJobs} việc làm phù hợp
          </h2>
        </div>

        {error && (<div className="text-center py-8"><p className="text-red-500">{error}</p></div>)}
        
        <JobGrid
          jobs={jobs}
          isLoading={isLoading}
          onToggleFavorite={toggleFavorite}
          isJobFavorited={isJobFavorited}
          isAuthenticated={isAuthenticated}
        />

        {!isLoading && !error && jobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">Không tìm thấy công việc nào phù hợp.</p>
            <Button variant="link" onClick={handleClearFilters} className="mt-2">Xóa tất cả bộ lọc</Button>
          </div>
        )}
        
        {pageCount > 1 && !isLoading && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious onClick={() => handlePageChange(page - 1)} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}/></PaginationItem>
                {/* ... Logic render nút số trang ... */}
                <PaginationItem><PaginationNext onClick={() => handlePageChange(page + 1)} className={page === pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}/></PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
}

export default JobList;