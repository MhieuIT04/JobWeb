import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
// Avatar not used here; employer logo rendered directly to support external URLs
=======
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
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
<<<<<<< HEAD
        <Card className="flex flex-col h-full transition-all duration-200 hover:-translate-y-2 hover:shadow-xl bg-white dark:bg-[hsl(var(--card))] rounded-xl border border-gray-100 dark:border-gray-700">
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
=======
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
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                                {job.title}
                            </h2>
                            {isNew && (
                                <Badge
                                    variant="secondary"
<<<<<<< HEAD
                                        className="bg-green-500 text-white dark:text-white"
=======
                                    className="bg-green-500 text-white"
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                                >
                                    Mới
                                </Badge>
                            )}
                        </div>
<<<<<<< HEAD
                        <p className="text-sm text-neutral-600 dark:text-white truncate">
                            {job.employer?.company_name}
                        </p>
                        {daysAgo !== null && (
                            <p className="text-xs text-gray-500 dark:text-[hsl(var(--primary-muted))] mt-1">
                                        {daysAgo === 0
                                            ? "Hôm nay"
                                            : daysAgo === 1
                                            ? "Hôm qua"
                                            : `${daysAgo} ngày trước`}
=======
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
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {job.work_type?.name && (
<<<<<<< HEAD
                            <Badge variant="outline" className="text-xs text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 bg-transparent">
=======
                            <Badge variant="outline" className="text-xs">
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                                <Briefcase className="w-3 h-3 mr-1" />
                                {job.work_type.name}
                            </Badge>
                        )}
                        {experienceLabel && (
<<<<<<< HEAD
                            <Badge variant="outline" className="text-xs text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 bg-transparent">
=======
                            <Badge variant="outline" className="text-xs">
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                                {experienceLabel}
                            </Badge>
                        )}
                    </div>

                    {/* Location */}
<<<<<<< HEAD
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-300">
=======
                    <div className="flex items-center gap-2 text-sm text-gray-600">
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                        <MapPin className="h-4 w-4" />
                        <span>{job.city?.name || "N/A"}</span>
                    </div>

                    {/* Salary */}
<<<<<<< HEAD
                    <div className="text-green-600 dark:text-green-400 font-medium text-sm">
                        💰 {job.min_salary ? 
                        `${new Intl.NumberFormat('vi-VN').format(job.min_salary)} - ${new Intl.NumberFormat('vi-VN').format(job.max_salary)} ${job.currency}` 
                        : "Thương lượng"}
=======
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
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                    </div>
                </div>
            </CardContent>

<<<<<<< HEAD
            <CardFooter className="pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 w-full">
                    <Button size="sm" asChild className="flex-1 bg-white/10 text-white hover:bg-white/20">
=======
            <CardFooter className="pt-4 border-t">
                <div className="flex items-center gap-2 w-full">
                    <Button size="sm" asChild className="flex-1">
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
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
<<<<<<< HEAD
                                ? "text-red-400"
                                : "text-neutral-400 hover:text-red-400"
=======
                                ? "text-red-500"
                                : "text-gray-400 hover:text-red-500"
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
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
