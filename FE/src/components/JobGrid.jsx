// src/components/JobGrid.jsx

import React from 'react';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { BookmarkIcon } from 'lucide-react';
import { Button } from "@/components/ui/button"; // << 1. IMPORT THÊM BUTTON
import { Link as RouterLink } from 'react-router-dom'; // << 2. IMPORT THÊM LINK
import {  MapPin, Briefcase } from 'lucide-react';
const JobCard = ({ job, isFavorited, onToggleFavorite }) => {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Thương lượng';
    const format = (val) => new Intl.NumberFormat('vi-VN').format(val);
    if (!max) return `Từ ${format(min)} VNĐ`;
    if (!min) return `Đến ${format(max)} VNĐ`;
    return `${format(min)} - ${format(max)} VNĐ`;  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.28 }}
    >
      <Card className="group hover:border-primary transition-all duration-300 flex flex-col h-full hover:shadow-xl rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="p-5 flex-grow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg overflow-hidden border p-1 bg-white flex items-center justify-center">
                {job.logo ? (
                  <img 
                    src={job.logo} 
                    alt={job.company_name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 rounded bg-gray-100 text-gray-600 font-semibold">
                    {job.company_name ? job.company_name.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-neutral-800 dark:text-white group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-slate-400">{job.company_name}</p>
              </div>
            </div>
            <button
              onClick={() => onToggleFavorite(job.id)}
              className="text-neutral-400 hover:text-primary transition-colors"
            >
              <BookmarkIcon 
                className={`w-5 h-5 ${isFavorited ? 'fill-primary text-primary' : ''}`}               />
            </button>
          </div>

          <div className="space-y-3">
             <p className="text-sm text-neutral-600 dark:text-slate-300 line-clamp-2">
              {job.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-slate-300">
                <Briefcase className="w-4 h-4 text-neutral-400 dark:text-slate-400" /> 
                <span>{job.work_type?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-neutral-400 dark:text-slate-400" />
                <span>{job.city?.name}</span>
            </div>
            <div className="text-green-600 dark:text-green-400 font-semibold">
              {formatSalary(job.salary_min, job.salary_max)}
            </div>
          </div>
        </div>
        
        <div className="p-5 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs text-neutral-500 dark:text-slate-400">
              {job.posted_date}
            </span>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white" asChild>
              <RouterLink to={`/jobs/${job.id}`}>Xem chi tiết</RouterLink>
            </Button>
        </div>
      </Card>
    </motion.div>
  );
};


const JobGrid = ({ jobs, isLoading, onToggleFavorite, isJobFavorited }) => {  if (isLoading) {
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
            isFavorited={isJobFavorited(job.id)}
            onToggleFavorite={onToggleFavorite}
          />      ))}
    </div>
  );
};

export default JobGrid;