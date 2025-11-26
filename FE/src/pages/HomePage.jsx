import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Briefcase, TrendingUp, Building2, Star, ArrowRight, Users, MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Import các component của trang chủ
import HeroCarousel from '../components/HeroCarousel';
import HorizontalJobFilters from '../components/home/HorizontalJobFilters';
import FeaturedCategories from '../components/home/FeaturedCategories';
import PersonalizedJobs from '../components/home/PersonalizedJobs';
import TrendingJobs from '../components/home/TrendingJobs';
import FeaturedEmployers from '../components/home/FeaturedEmployers';
import HotJobs from '../components/home/HotJobs';
import JobGrid from '../components/JobGrid';
import HeroBanner from '../components/HeroBanner'; 

function HomePage() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [cities, setCities] = useState([]);
    const [workTypes, setWorkTypes] = useState([]);
    const [latestJobs, setLatestJobs] = useState([]);
    const [stats, setStats] = useState({ jobs: 0, companies: 0, candidates: 0, applications: 0 });
    const [loading, setLoading] = useState(true);

    // Tải dữ liệu cho bộ lọc và các job mới nhất
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, citiesRes, workTypesRes, jobsRes] = await Promise.all([
                    axiosClient.get('/api/jobs/categories/'),
                    axiosClient.get('/api/users/cities/'),
                    axiosClient.get('/api/jobs/work-types/'),
                    axiosClient.get('/api/jobs/?limit=6')
                ]);
                setCategories(categoriesRes.data);
                setCities(citiesRes.data);
                setWorkTypes(workTypesRes.data);
                setLatestJobs(jobsRes.data.results || []);
                
                // Fetch stats (mock data if API not available)
                try {
                    const statsRes = await axiosClient.get('/api/stats/');
                    setStats(statsRes.data);
                } catch {
                    setStats({ jobs: 1250, companies: 350, candidates: 5000, applications: 8500 });
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu trang chủ:", err);
            } finally {
                setLoading(false);
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Hero Section with Enhanced Design */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 pb-8">
                <div className="container mx-auto px-4 pt-8">
                    <HeroBanner />
                </div>
                <HorizontalJobFilters
                    categories={categories}
                    cities={cities}
                    workTypes={workTypes}
                    onFilterChange={handleSearch}
                    isHomePage={true}
                />
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-4 -mt-8 mb-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Briefcase, label: 'Việc làm', value: stats.jobs, color: 'blue' },
                        { icon: Building2, label: 'Công ty', value: stats.companies, color: 'green' },
                        { icon: Users, label: 'Ứng viên', value: stats.candidates, color: 'purple' },
                        { icon: TrendingUp, label: 'Ứng tuyển', value: stats.applications, color: 'orange' }
                    ].map((stat, idx) => (
                        <Card key={idx} className="p-6 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value.toLocaleString()}</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
            
            {/* Main Content */}
            <main className="container mx-auto px-4 pb-12 space-y-16">
                {/* Featured Categories */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Danh mục nổi bật</h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">Khám phá các ngành nghề phổ biến</p>
                        </div>
                        <Button variant="ghost" onClick={() => navigate('/jobs')} className="gap-2">
                            Xem tất cả <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                    <FeaturedCategories categories={categories} />
                </section>

                {/* Personalized Jobs */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Star className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Việc làm dành cho bạn</h2>
                    </div>
                    <PersonalizedJobs />
                </section>

                {/* Trending Jobs */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Việc làm xu hướng</h2>
                    </div>
                    <TrendingJobs />
                </section>

                {/* Featured Employers */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
                    <div className="flex items-center gap-2 mb-6">
                        <Building2 className="w-6 h-6 text-blue-500" />
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Nhà tuyển dụng nổi bật</h2>
                    </div>
                    <FeaturedEmployers />
                </section>

                {/* Hot Jobs */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="w-6 h-6 text-red-500" />
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Việc làm hot</h2>
                    </div>
                    <HotJobs />
                </section>

                {/* Latest Jobs */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Việc làm mới nhất</h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">Cập nhật liên tục mỗi ngày</p>
                        </div>
                        <Button onClick={() => navigate('/jobs')} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            Xem tất cả <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="p-6 animate-pulse">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <JobGrid jobs={latestJobs} />
                    )}
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 rounded-2xl p-12 text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">Sẵn sàng tìm công việc mơ ước?</h2>
                    <p className="text-xl mb-8 opacity-90">Hàng nghìn cơ hội việc làm đang chờ bạn</p>
                    <div className="flex gap-4 justify-center">
                        <Button size="lg" variant="secondary" onClick={() => navigate('/jobs')} className="gap-2">
                            <Briefcase className="w-5 h-5" />
                            Tìm việc ngay
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => navigate('/cv-match')} className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white">
                            <Star className="w-5 h-5" />
                            Gợi ý từ CV
                        </Button>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default HomePage;