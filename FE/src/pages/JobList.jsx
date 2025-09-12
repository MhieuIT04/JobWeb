import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import HeroBanner from '../components/HeroBanner';
import HeroSearch from '../components/HeroSearch';
import HorizontalJobFilters from '../components/HorizontalJobFilters';
import JobGrid from '../components/JobGrid';
import HotJobs from '../components/HotJobs';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext
} from "@/components/ui/pagination";

function JobList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // States cho phần tìm kiếm chính
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // States cho data
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);

  // States cho bộ lọc
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    work_type: searchParams.get('work_type') || '',
    experience_level: searchParams.get('experience_level') || '',
    salary_range: searchParams.get('salary_range') ?
      searchParams.get('salary_range').split(',').map(Number) : null
  });

  const { isAuthenticated, isJobFavorited, toggleFavorite } = useAuth();

  // Tải dữ liệu cho dropdowns
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, citiesRes] = await Promise.all([
          axiosClient.get('/api/jobs/categories/'),
          axiosClient.get('/api/users/cities/')
        ]);
        setCategories(categoriesRes.data);
        setCities(citiesRes.data);
      } catch (err) { console.error("Lỗi tải dữ liệu lọc:", err); }
    };
    fetchInitialData();
  }, []);

  // Load initial data for filters
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

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(1);
  };

  // Hàm fetch jobs chính
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();

    // Add all active filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value);
        }
      }
    });
    params.append('page', page);

    try {
      const response = await axiosClient.get(`/api/jobs/?${params.toString()}`);
      setJobs(response.data.results || []);
      setTotalJobs(response.data.count || 0);
      setPageCount(Math.ceil((response.data.count || 0) / 10));
    } catch (err) {
      setError("Không thể tải danh sách công việc.");
      console.error("Error fetching jobs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value);
        }
      }
    });
    if (page > 1) {
      params.append('page', page);
    }
    setSearchParams(params);

    const debounceTimer = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [filters, page, setSearchParams, fetchJobs]);

  const handlePageChange = (event, value) => { setPage(value); };
  const handleClearFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      city: '',
      work_type: '',
      experience_level: '',
      salary_range: null
    });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white pb-8">
        <div className="container mx-auto px-4">
          <div className="py-8">
            <div className="max-w-4xl mx-auto mb-8">
              <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
                Tìm công việc phù hợp với bạn
              </h1>
              <p className="text-lg text-center text-gray-600 mb-8">
                Khám phá hàng nghìn cơ hội việc làm tại các công ty hàng đầu
              </p>
              <HeroSearch
                keyword={filters.keyword}
                onSearch={(keyword) => handleFilterChange('keyword', keyword)}
              />
            </div>
          </div>
        </div>
      </div>

      <HorizontalJobFilters
        categories={categories}
        cities={cities}
        workTypes={workTypes}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {totalJobs} việc làm phù hợp
          </h2>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sắp xếp theo:</span>
            <select className="text-sm border rounded-md px-3 py-1.5">
              <option value="newest">Mới nhất</option>
              <option value="salary-desc">Lương cao nhất</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <JobGrid jobs={[]} isLoading={true} />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : jobs.length > 0 ? (
          <>
            <JobGrid
              jobs={jobs}
              isLoading={false}
              onToggleFavorite={toggleFavorite}
              getFavoriteStatus={isJobFavorited}
            />
            
            {pageCount > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: pageCount }, (_, i) => i + 1)
                      .slice(Math.max(0, page - 3), Math.min(pageCount, page + 2))
                      .map(num => (
                        <PaginationItem key={num}>
                          <Button
                            variant={page === num ? "default" : "ghost"}
                            size="icon"
                            onClick={() => handlePageChange(num)}
                          >
                            {num}
                          </Button>
                        </PaginationItem>
                      ))}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === pageCount}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              Không tìm thấy công việc nào phù hợp với tiêu chí tìm kiếm.
            </p>
            <Button
              variant="link"
              onClick={handleClearFilters}
              className="mt-2"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </main>
    </div>
  );

}

export default JobList;