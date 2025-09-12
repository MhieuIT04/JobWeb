import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
        <Card className="flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg bg-white/95">
            <CardContent className="flex-grow pt-4">
                <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-12 h-12 rounded border p-1 bg-white">
                        <AvatarImage src={job.logo || job.employer?.logo} />
                        <AvatarFallback className="bg-primary/10">
                            {job.employer?.company_name?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="font-bold text-primary truncate">
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
                        <p className="text-sm text-gray-600 truncate">
                            {job.employer?.company_name}
                        </p>
                        {daysAgo !== null && (
                            <p className="text-xs text-gray-400 mt-1">
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
                            <Badge variant="outline" className="text-xs">
                                <Briefcase className="w-3 h-3 mr-1" />
                                {job.work_type.name}
                            </Badge>
                        )}
                        {experienceLabel && (
                            <Badge variant="outline" className="text-xs">
                                {experienceLabel}
                            </Badge>
                        )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{job.city?.name || "N/A"}</span>
                    </div>

                    {/* Salary */}
                    <div className="text-green-600 font-medium text-sm">
                        {job.min_salary || job.max_salary ? (
                            <span>
                                {job.min_salary &&
                                    new Intl.NumberFormat("vi-VN").format(
                                        job.min_salary
                                    )}
                                {job.min_salary && job.max_salary && " - "}
                                {job.max_salary &&
                                    new Intl.NumberFormat("vi-VN").format(
                                        job.max_salary
                                    )}{" "}
                                {job.currency || "VNĐ"}
                            </span>
                        ) : (
                            <span>Thương lượng</span>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-4 border-t">
                <div className="flex items-center gap-2 w-full">
                    <Button size="sm" asChild className="flex-1">
                        <RouterLink to={`/jobs/${job.id}`}>
                            <span>Xem chi tiết</span>
                        </RouterLink>
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleFavoriteClick}
                        className={
                            isFavorited
                                ? "text-red-500"
                                : "text-gray-400 hover:text-red-500"
                        }
                    >
                        <Heart
                            className="h-5 w-5"
                            fill={isFavorited ? "currentColor" : "none"}
                        />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

export default JobCard;
