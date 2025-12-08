import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, TrendingUp } from 'lucide-react';

export default function FeaturedCategories({ categories = [] }) {
  const navigate = useNavigate();
  const items = categories.slice(0, 8);

  const handleCategoryClick = (category) => {
    // Navigate to jobs page with category filter
    navigate(`/jobs?category=${category.id}`);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(c => (
        <button
          key={c.id}
          onClick={() => handleCategoryClick(c)}
          className="group relative p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-200"
        >
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          
          {/* Category Name */}
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 text-left">
            {c.name}
          </h3>
          
          {/* Job Count */}
          {c.job_count !== undefined && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span>{c.job_count} việc làm</span>
            </div>
          )}
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </button>
      ))}
    </div>
  );
}


