// src/components/JobGrid.jsx

import React from 'react';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkIcon } from 'lucide-react';
import { Button } from "@/components/ui/button"; // << 1. IMPORT THÊM BUTTON
import { Link as RouterLink } from 'react-router-dom'; // << 2. IMPORT THÊM LINK

const JobCard = ({ job, isFavorited, onToggleFavorite }) => {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Thương lượng';
    if (!max) return `Từ ${min} triệu`;
    if (!min) return `Đến ${max} triệu`;
    return `${min} - ${max} triệu`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group hover:shadow-lg transition-shadow duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <img 
                  src={job.logo || '/placeholder-company.png'} 
                  alt={job.company_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-gray-600">{job.company_name}</p>
              </div>
            </div>
            <button
              onClick={() => onToggleFavorite(job.id)}
              className="text-gray-400 hover:text-primary transition-colors"
            >
              <BookmarkIcon 
                className={`w-6 h-6 ${isFavorited ? 'fill-primary text-primary' : ''}`} 
              />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="secondary">{job.work_type?.name}</Badge>
              <Badge variant="secondary">{job.city?.name}</Badge>
              <Badge variant="secondary">{formatSalary(job.salary_min, job.salary_max)}</Badge>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2">
              {job.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {job.skills?.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
              {job.skills?.length > 3 && (
                <Badge variant="outline">+{job.skills.length - 3}</Badge>
              )}
            </div>
          </div>

          {/* ▼▼▼ 3. THAY ĐỔI Ở ĐÂY ▼▼▼ */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {job.posted_date}
            </span>
            {/* Thay thế span "ứng viên" bằng nút "Ứng tuyển" */}
            <Button size="sm" asChild>
              <RouterLink to={`/jobs/${job.id}`}>Ứng tuyển</RouterLink>
            </Button>
          </div>
          {/* ▲▲▲ KẾT THÚC THAY ĐỔI ▲▲▲ */}
        </div>
      </Card>
    </motion.div>
  );
};

const JobGrid = ({ jobs, isLoading, onToggleFavorite, getFavoriteStatus }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {jobs.map(job => (
        <JobCard
          key={job.id}
          job={job}
          isFavorited={getFavoriteStatus(job.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};

export default JobGrid;