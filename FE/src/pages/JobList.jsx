import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';

// Import các component của shadcn/ui
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import HeroBanner from '../components/HeroBanner'; 
// Import các component con tùy chỉnh
import HorizontalJobFilters from '../components/home/HorizontalJobFilters';
import JobGrid from '../components/JobGrid';
import JobGridSkeleton from '../components/JobGridSkeleton'; // Đảm bảo import này đúng
import HotJobs from '../components/home/HotJobs';
import TopCompanies from '../components/home/TopCompanies';
import HomeFooter from '../components/HomeFooter';
// import PopularCategories from '../components/home/PopularCategories';

function JobList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // States cho dữ liệu
  const [jobs, setJobs] = useState([]);
  // totalJobs removed (was unused) — pageCount controls pagination
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  
  // States cho UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageCount, setPageCount] = useState(0);

  // Gộp tất cả state bộ lọc vào một object, khởi tạo từ URL
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
  // totalJobs not used; pageCount is derived below
      setPageCount(Math.ceil((response.data.count || 0) / 10));
    } catch (err) {
      setError("Không thể tải danh sách công việc.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect để gọi API và cập nhật URL khi `filters` thay đổi
  useEffect(() => {
    // Loại bỏ các key có giá trị rỗng để tránh gửi param rỗng về API
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );

    setSearchParams(cleanedFilters, { replace: true });

    const debounceTimer = setTimeout(() => {
      fetchJobs(cleanedFilters);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [filters, fetchJobs, setSearchParams]);
  
  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pageCount) {
        setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  // --- HÀM RENDER NỘI DUNG CHÍNH ---
  const renderJobContent = () => {
    if (isLoading) {
      // SỬ DỤNG JobGridSkeleton KHI ĐANG TẢI
      return <JobGridSkeleton />;
    }

    if (error) {
      return <div className="text-center py-8"><p className="text-red-500">{error}</p></div>;
    }

    if (jobs.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">Không tìm thấy công việc nào phù hợp.</p>
          <Button variant="link" onClick={handleClearFilters} className="mt-2">Xóa tất cả bộ lọc</Button>
        </div>
      );
    }
    
    // Chỉ render JobGrid khi có dữ liệu
    return (
      <>
        <JobGrid
          jobs={jobs}
          // không cần truyền isLoading nữa
          onToggleFavorite={toggleFavorite}
          isJobFavorited={isJobFavorited}
          isAuthenticated={isAuthenticated}
        />
        {pageCount > 1 && (
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
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white">
        <div className="container mx-auto px-4 pt-8">
           <HeroBanner />
        </div>
      

        <HorizontalJobFilters
          categories={categories}
          cities={cities}
          workTypes={workTypes}
          initialFilters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
        
      </div>

      <main className="container mx-auto px-4 py-8">
        {Object.keys(filters).length === 0 && (
          <>
            <TopCompanies />
            <HotJobs />
            {/* <PopularCategories />  */}
          </>
        )}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
             {Object.keys(filters).length > 0 ? 'Kết quả tìm kiếm' : 'Tất cả công việc'}
          </h2>
        </div>

        {renderJobContent()}
      </main>
      {/* Homepage-specific footer */}
      <HomeFooter />
      
    </div>
  );
}

export default JobList;