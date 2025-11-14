import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from 'lucide-react';

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
        <div className="my-4">
            <h2 className="mb-3 text-2xl font-bold flex items-center gap-2">
                <Star className="text-yellow-400" />
                Các công ty hàng đầu
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {companies.map(company => (
                    <Card key={company.id} className="text-center p-4">
                        <CardContent className="flex flex-col items-center space-y-4">
                            <Avatar className="w-20 h-20">
                                <AvatarImage src={company.logo} alt={company.company_name} />
                                <AvatarFallback>{company.company_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-semibold truncate">{company.company_name}</h3>
                                <p className="text-sm text-gray-500">{company.job_count} việc làm</p>
                            </div>
                            <Button asChild className="mt-2 w-full">
                                <RouterLink to={`/companies/${company.id}`}>
                                    Xem công việc
                                </RouterLink>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default TopCompanies;