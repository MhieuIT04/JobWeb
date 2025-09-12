// src/components/JobItem.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart } from 'lucide-react';

function JobItem({ job }) {
    const { isAuthenticated, favorites, toggleFavorite } = useAuth();
    const isFavorited = favorites.includes(job.id);
    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAuthenticated) {
            toggleFavorite(job.id);
        } else {
            alert('Vui lòng đăng nhập để sử dụng chức năng này.');
        }
    };
    return (
        <Card className="rounded-xl shadow bg-white/95 flex items-center gap-4 p-4 mb-4 hover:bg-blue-50 transition">
            <Avatar className="w-12 h-12">
                <AvatarImage src={job.employer?.logo} />
                <AvatarFallback>{job.employer?.company_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <RouterLink to={`/jobs/${job.id}`} className="font-bold text-lg text-primary hover:underline">
                    {job.title}
                </RouterLink>
                <div className="text-sm text-gray-500">{job.employer?.company_name}</div>
                <div className="flex gap-2 text-xs text-gray-400 mt-1">
                    <span>{job.city?.name}</span>
                    <span>{job.category?.name}</span>
                </div>
            </div>
            <Button size="icon" variant="ghost" onClick={handleFavoriteClick} className={isFavorited ? "text-red-500" : "text-gray-400"}>
                <Heart fill={isFavorited ? "red" : "none"} className="w-5 h-5" />
            </Button>
        </Card>
    );
}

export default JobItem;