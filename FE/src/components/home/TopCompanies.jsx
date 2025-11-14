import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import RatingStars from "../RatingStars";

function TopCompanies() {
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const fetchTopCompanies = async () => {
            try {
                const response = await axiosClient.get('/api/users/companies/top/');
                setCompanies(response.data);
            } catch (error) { console.error("Lỗi tải công ty hàng đầu:", error); }
        };
        fetchTopCompanies();
    }, []);

    if (companies.length === 0) return null;

    return (
        <div className="py-8 bg-slate-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-blue-300">Các công ty hàng đầu</h2>
                <Button asChild variant="outline"><RouterLink to="/companies">Xem tất cả</RouterLink></Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {companies.map(company => (
                    <Card key={company.id} className="text-center p-4 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                        <RouterLink to={`/companies/${company.id}`} className="flex flex-col items-center">
                            <Avatar className="w-16 h-16 mb-2">
                                <AvatarImage src={company.logo} alt={company.company_name} />
                                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-blue-300">{company.company_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold text-sm truncate w-full text-gray-900 dark:text-blue-300">{company.company_name}</p>
                            <p className="text-xs text-muted-foreground dark:text-blue-200">{company.job_count} việc làm</p>
                            {typeof company.avg_rating !== 'undefined' && (
                                <div className="flex items-center gap-1 mt-1">
                                    <RatingStars value={company.avg_rating || 0} size={14} />
                                    <span className="text-xs text-muted-foreground">{(company.avg_rating || 0).toFixed(1)} ({company.review_count || 0})</span>
                                </div>
                            )}
                        </RouterLink>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default TopCompanies;