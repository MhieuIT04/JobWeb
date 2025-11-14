// src/components/JobGrid.jsx

import React from 'react';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
<<<<<<< HEAD
import { BookmarkIcon } from 'lucide-react';
import { Button } from "@/components/ui/button"; // << 1. IMPORT THÊM BUTTON
import { Link as RouterLink } from 'react-router-dom'; // << 2. IMPORT THÊM LINK
import {  MapPin, Briefcase } from 'lucide-react';
=======
import { Badge } from "@/components/ui/badge";
import { BookmarkIcon } from 'lucide-react';
import { Button } from "@/components/ui/button"; // << 1. IMPORT THÊM BUTTON
import { Link as RouterLink } from 'react-router-dom'; // << 2. IMPORT THÊM LINK
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a

const JobCard = ({ job, isFavorited, onToggleFavorite }) => {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Thương lượng';
<<<<<<< HEAD
    const format = (val) => new Intl.NumberFormat('vi-VN').format(val);
    if (!max) return `Từ ${format(min)} VNĐ`;
    if (!min) return `Đến ${format(max)} VNĐ`;
    return `${format(min)} - ${format(max)} VNĐ`;
=======
    if (!max) return `Từ ${min} triệu`;
    if (!min) return `Đến ${max} triệu`;
    return `${min} - ${max} triệu`;
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
  };

  return (
    <motion.div
<<<<<<< HEAD
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.28 }}
    >
      {/* << Thêm border-primary khi hover vào Card */}
      <Card className="group hover:border-primary transition-all duration-300 flex flex-col h-full hover:shadow-xl rounded-xl border border-gray-100">
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
                <h3 className="font-bold text-lg text-neutral-800 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-neutral-500">{job.company_name}</p>
=======
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
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
              </div>
            </div>
            <button
              onClick={() => onToggleFavorite(job.id)}
<<<<<<< HEAD
              className="text-neutral-400 hover:text-primary transition-colors"
            >
              <BookmarkIcon 
                className={`w-5 h-5 ${isFavorited ? 'fill-primary text-primary' : ''}`} 
=======
              className="text-gray-400 hover:text-primary transition-colors"
            >
              <BookmarkIcon 
                className={`w-6 h-6 ${isFavorited ? 'fill-primary text-primary' : ''}`} 
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
              />
            </button>
          </div>

<<<<<<< HEAD
          <div className="space-y-3">
             <p className="text-sm text-neutral-600 line-clamp-2">
              {job.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Briefcase className="w-4 h-4 text-neutral-400" /> 
                <span>{job.work_type?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <span>{job.city?.name}</span>
            </div>
            <div className="text-green-600 font-semibold">
              {formatSalary(job.salary_min, job.salary_max)}
            </div>
          </div>
        </div>
        
        <div className="p-5 border-t flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {job.posted_date}
            </span>
            <Button size="sm" asChild>
              <RouterLink to={`/jobs/${job.id}`}>Xem chi tiết</RouterLink>
            </Button>
=======
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
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
        </div>
      </Card>
    </motion.div>
  );
};

<<<<<<< HEAD

const JobGrid = ({ jobs, isLoading, onToggleFavorite, isJobFavorited }) => {
=======
const JobGrid = ({ jobs, isLoading, onToggleFavorite, getFavoriteStatus }) => {
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
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
<<<<<<< HEAD
            key={job.id}
            job={job}
            isFavorited={isJobFavorited(job.id)}
            onToggleFavorite={onToggleFavorite}
          />
=======
          key={job.id}
          job={job}
          isFavorited={getFavoriteStatus(job.id)}
          onToggleFavorite={onToggleFavorite}
        />
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
      ))}
    </div>
  );
};

export default JobGrid;