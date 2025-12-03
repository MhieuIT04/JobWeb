import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';

// Import các component của shadcn/ui
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Grid, List, ArrowUpDown } from 'lucide-react';
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
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('date-desc');

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
    
    // Add sort parameter
    const filtersWithSort = { ...currentFilters, ordering: sortBy };
    const params = new URLSearchParams(filtersWithSort);
    
    try {
      const response = await axiosClient.get(`/api/jobs/`, { params });
      setJobs(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setPageCount(Math.ceil((response.data.count || 0) / 10));
    } catch (err) {
      setError("Không thể tải danh sách công việc.");
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll lên đầu trang khi thay đổi filter
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pageCount) {
        setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleClearFilters = () => {
    setFilters({ page: 1 }); // Reset về trang 1
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll lên đầu trang
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800">
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-amber-100">
              {Object.keys(filters).length > 0 ? 'Kết quả tìm kiếm' : 'Tất cả công việc'}
            </h2>
            {totalCount > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Tìm thấy {totalCount} công việc
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-600" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Mới nhất</SelectItem>
                  <SelectItem value="date-asc">Cũ nhất</SelectItem>
                  <SelectItem value="salary-desc">Lương cao nhất</SelectItem>
                  <SelectItem value="salary-asc">Lương thấp nhất</SelectItem>
                  <SelectItem value="title">Tên A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* View Toggle */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {renderJobContent()}
      </main>
      {/* Homepage-specific footer */}
      <HomeFooter />
      
    </div>
  );
}

export default JobList;