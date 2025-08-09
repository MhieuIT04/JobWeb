import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';

// Import Layout và Component con
import { Container, Grid, Typography, Box, Pagination, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import HeroBanner from '../components/HeroBanner';
import JobCard from '../components/JobCard';
import JobCardSkeleton from '../components/JobCardSkeleton';
// import HotJobs from '../components/HotJobs';
// import TopCompanies from '../components/TopCompanies';
// import PopularCategories from '../components/PopularCategories';

function JobList() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // States cho phần tìm kiếm chính
    const [jobs, setJobs] = useState([]);
    const [totalJobs, setTotalJobs] = useState(0);
    const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [pageCount, setPageCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // States cho dropdowns
    const [categories, setCategories] = useState([]);
    const [cities, setCities] = useState([]);

    // States cho bộ lọc
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
    
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

    // Hàm fetch jobs chính
    const fetchJobs = useCallback(async () => {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedCity) params.append('city', selectedCity);
        params.append('page', page);
        try {
            const response = await axiosClient.get(`/api/jobs/?${params.toString()}`);
            setJobs(response.data.results || []);
            setTotalJobs(response.data.count || 0);
            setPageCount(Math.ceil((response.data.count || 0) / 10));
        } catch (err) { setError("Không thể tải danh sách công việc."); } 
        finally { setIsLoading(false); }
    }, [searchTerm, selectedCategory, selectedCity, page]);
    
    // Đồng bộ state và URL, sau đó gọi API
    useEffect(() => {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedCity) params.city = selectedCity;
        if (page > 1) params.page = page;
        setSearchParams(params, { replace: true });

        const debounceTimer = setTimeout(() => { fetchJobs(); }, 500);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, selectedCategory, selectedCity, page, fetchJobs, setSearchParams]);

    const handlePageChange = (event, value) => { setPage(value); };
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedCity('');
        setPage(1);
    };

    return (
        <Box>
            <HeroBanner>
                <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={5}><TextField fullWidth label="Tìm kiếm..." variant="filled" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><FormControl fullWidth variant="filled"><InputLabel>Ngành nghề</InputLabel><Select value={selectedCategory} label="Ngành nghề" onChange={(e) => setSelectedCategory(e.target.value)}>{categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6} md={3}><FormControl fullWidth variant="filled"><InputLabel>Địa điểm</InputLabel><Select value={selectedCity} label="Địa điểm" onChange={(e) => setSelectedCity(e.target.value)}>{cities.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} md={1}><Button variant="contained" onClick={handleClearFilters} sx={{ height: '56px' }} fullWidth>Xóa</Button></Grid>
                    </Grid>
                </Paper>
            </HeroBanner>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* CÁC MỤC NỔI BẬT */}
                {/* <HotJobs />
                <TopCompanies />
                <PopularCategories/> */}

                {/* PHẦN TÌM KIẾM CHÍNH */}
                <Box sx={{ mt: 6 }}>
                    <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>Tất cả công việc</Typography>
                    {!isLoading && !error && (<Typography color="text.secondary" sx={{ mb: 4 }}>Tìm thấy <strong>{totalJobs}</strong> công việc phù hợp.</Typography>)}
                    
                    {isLoading ? (
                        <Grid container spacing={4}>{Array.from(new Array(6)).map((_, index) => (<JobCardSkeleton key={index} />))}</Grid>
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : (
                        <>
                            <Grid container spacing={4}>
                                {jobs.length > 0 ? jobs.map((job) => (
                                    <Grid item key={job.id} xs={12} sm={6} md={4}>
                                        <JobCard 
                                            job={job} 
                                            isAuthenticated={isAuthenticated}
                                            isFavorited={isJobFavorited(job.id)}
                                            onToggleFavorite={toggleFavorite}
                                        />
                                    </Grid>
                                )) : (
                                    <Grid item xs={12}><Typography align="center">Không tìm thấy công việc nào phù hợp.</Typography></Grid>
                                )}
                            </Grid>
                            
                            {pageCount > 1 && (<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><Pagination count={pageCount} page={page} onChange={handlePageChange} color="primary" /></Box>)}
                        </>
                    )}
                </Box>
            </Container>
        </Box>
    );
}

export default JobList;