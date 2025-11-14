import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// Import các component của trang chủ
import HeroCarousel from '../components/HeroCarousel';
import HorizontalJobFilters from '../components/home/HorizontalJobFilters';
import FeaturedCategories from '../components/home/FeaturedCategories';
import PersonalizedJobs from '../components/home/PersonalizedJobs';
import TrendingJobs from '../components/home/TrendingJobs';
import FeaturedEmployers from '../components/home/FeaturedEmployers';
import HotJobs from '../components/home/HotJobs';
import JobGrid from '../components/JobGrid'; // Để hiển thị 1 vài job mới nhất
import HeroBanner from '../components/HeroBanner'; 

function HomePage() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [cities, setCities] = useState([]);
    const [workTypes, setWorkTypes] = useState([]);
    const [latestJobs, setLatestJobs] = useState([]);

    // Tải dữ liệu cho bộ lọc và các job mới nhất
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, citiesRes, workTypesRes, jobsRes] = await Promise.all([
                    axiosClient.get('/api/jobs/categories/'),
                    axiosClient.get('/api/users/cities/'),
                    axiosClient.get('/api/jobs/work-types/'),
                    axiosClient.get('/api/jobs/?limit=6') // Lấy 6 công việc mới nhất
                ]);
                setCategories(categoriesRes.data);
                setCities(citiesRes.data);
                setWorkTypes(workTypesRes.data);
                setLatestJobs(jobsRes.data.results || []);
            } catch (err) {
                console.error("Lỗi tải dữ liệu trang chủ:", err);
            }
        };
        fetchData();
    }, []);
    
    // Hàm xử lý khi người dùng tìm kiếm -> chuyển sang trang /jobs
    const handleSearch = (filters) => {
        const searchParams = new URLSearchParams(filters);
        navigate(`/jobs?${searchParams.toString()}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Phần Hero và thanh tìm kiếm */}
            <div className="bg-white dark:bg-slate-800 pb-6">
                <div className="container mx-auto px-4 pt-8">
                    <HeroBanner />
                </div>
                <HorizontalJobFilters
                    categories={categories}
                    cities={cities}
                    workTypes={workTypes}
                    onFilterChange={handleSearch} // Thay đổi ở đây
                    isHomePage={true} // Prop để thay đổi button "Lọc" thành "Tìm kiếm"
                />
            </div>
            
            {/* Phần nội dung chính của trang chủ */}
            <main className="container mx-auto px-4 py-8 space-y-12">
                <FeaturedCategories categories={categories} />
                <PersonalizedJobs />
                <TrendingJobs />
                <FeaturedEmployers />
                <HotJobs />

                <div>
                    <h2 className="text-2xl font-bold mb-4">Việc làm mới nhất</h2>
                    <JobGrid jobs={latestJobs} /> 
                </div>
            </main>
        </div>
    );
}

export default HomePage;