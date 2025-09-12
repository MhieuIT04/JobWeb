// src/components/PopularCategories.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Monitor, Building2, Stethoscope } from 'lucide-react';

// Ánh xạ tên ngành nghề với một icon cụ thể
const categoryIcons = {
    'công nghệ': <Monitor className="h-8 w-8 text-primary" />,
    'kinh tế': <Building2 className="h-8 w-8 text-primary" />,
    'dược phẩm': <Stethoscope className="h-8 w-8 text-primary" />,
    'default': <Briefcase className="h-8 w-8 text-primary" />
};

const getCategoryIcon = (categoryName) => {
    const lowerCaseName = categoryName.toLowerCase();
    for (const key in categoryIcons) {
        if (lowerCaseName.includes(key)) {
            return categoryIcons[key];
        }
    }
    return categoryIcons['default'];
};

function PopularCategories() {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPopularCategories = async () => {
            try {
                const response = await axiosClient.get('/api/jobs/top-categories/');
                setCategories(response.data.slice(0, 8));
            } catch (error) {
                console.error("Lỗi tải ngành nghề:", error);
            }
        };
        fetchPopularCategories();
    }, []);

    const handleCategoryClick = (categoryId) => {
        navigate(`/?category=${categoryId}`);
    };

    if (categories.length === 0) {
        return null;
    }

    return (
        <div className="my-8">
            <h2 className="text-2xl font-bold mb-6">
                Ngành nghề nổi bật
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {categories.map(category => (
                    <Card
                        key={category.id}
                        className="transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                        onClick={() => handleCategoryClick(category.id)}
                    >
                        <CardContent className="flex flex-col items-center justify-center text-center p-4 h-full">
                            {getCategoryIcon(category.name)}
                            <p className="mt-2 font-semibold text-sm">
                                {category.name}
                            </p>
                            {/* <p className="text-xs text-gray-500">{category.job_count} việc làm</p> */}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default PopularCategories;