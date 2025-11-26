import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Briefcase } from 'lucide-react';

function JobCard({ job, isFavorited, onToggleFavorite, isAuthenticated }) {
    const handleFavoriteClick = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để sử dụng chức năng này.');
            return;
        }
        onToggleFavorite(job.id);
    };

    // Check if the job is new (posted within 3 days)
    const isNew =
        job.created_at &&
        Date.now() - new Date(job.created_at).getTime() <
            1000 * 60 * 60 * 24 * 3;

    const daysAgo = job.created_at
        ? Math.floor(
              (Date.now() - new Date(job.created_at).getTime()) /
                  (1000 * 60 * 60 * 24)
          )
        : null;

    // 🔎 Xử lý experience_level: có thể là string hoặc object
    const experienceLabel =
        typeof job.experience_level === "object"
            ? job.experience_level?.name
            : job.experience_level;

    return (
        <RouterLink to={`/jobs/${job.id}`} className="block h-full">
            <Card className="flex flex-col h-full transition-all duration-200 hover:-translate-y-2 hover:shadow-xl bg-white dark:bg-[hsl(var(--card))] rounded-xl border border-gray-100 dark:border-gray-700 cursor-pointer">
                <CardContent className="flex-grow pt-4">
                        <div className="flex items-start gap-3 mb-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border p-1 bg-white flex items-center justify-center">
                            {job.employer?.logo ? (
                                <img
                                    src={job.employer.logo}
                                    alt={job.employer?.company_name}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-10 h-10 rounded bg-gray-100 text-gray-700 font-semibold">
                                    {job.employer?.company_name ? job.employer.company_name.charAt(0).toUpperCase() : 'C'}
                                </div>
                            )}
                        </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="font-bold text-neutral-900 dark:text-white truncate">
                                {job.title}
                            </h2>
                            {isNew && (
                                <Badge
                                    variant="secondary"
                                    className="bg-green-500 text-white"
                                >
                                    Mới
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-slate-300 truncate">
                            {job.employer?.company_name}
                        </p>
                        {daysAgo !== null && (
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                {daysAgo === 0
                                    ? "Hôm nay"
                                    : daysAgo === 1
                                    ? "Hôm qua"
                                    : `${daysAgo} ngày trước`}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {job.work_type?.name && (
                            <Badge variant="outline" className="text-xs text-neutral-700 dark:text-slate-200 border-neutral-200 dark:border-slate-600 bg-transparent dark:bg-slate-700/50">
                                <Briefcase className="w-3 h-3 mr-1" />
                                {job.work_type.name}
                            </Badge>
                        )}
                        {experienceLabel && (
                            <Badge variant="outline" className="text-xs text-neutral-700 dark:text-slate-200 border-neutral-200 dark:border-slate-600 bg-transparent dark:bg-slate-700/50">
                                {experienceLabel}
                            </Badge>
                        )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                        <MapPin className="h-4 w-4" />
                        <span>{job.city?.name || "N/A"}</span>
                    </div>

                    {/* Salary */}
                    <div className="text-green-600 dark:text-green-400 font-medium text-sm">
                        💰 {job.min_salary ? 
                        `${new Intl.NumberFormat('vi-VN').format(job.min_salary)} - ${new Intl.NumberFormat('vi-VN').format(job.max_salary)} ${job.currency}` 
                        : "Thương lượng"}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-4 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 w-full">
                    <Button 
                        size="sm" 
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        onClick={(e) => e.preventDefault()}
                    >
                        <span>Xem chi tiết</span>
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleFavoriteClick}
                        className={
                            isFavorited
                                ? "text-red-400"
                                : "text-neutral-400 hover:text-red-400"                        }
                    >
                        <Heart
                            className="h-5 w-5"
                            fill={isFavorited ? "currentColor" : "none"}
                        />
                    </Button>
                </div>
            </CardFooter>
            </Card>
        </RouterLink>
    );
}

export default JobCard;
