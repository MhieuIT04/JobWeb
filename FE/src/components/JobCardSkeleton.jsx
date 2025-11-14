// src/components/JobCardSkeleton.jsx

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const JobCardSkeleton = () => (
  <div className="rounded-xl shadow bg-white/90 p-4 flex flex-col gap-4 h-full">
    <div className="flex items-center gap-4 mb-2">
      <Skeleton className="w-14 h-14 rounded" />
      <div className="flex-1">
        <Skeleton className="h-6 w-4/5 mb-2" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
    <Skeleton className="h-4 w-2/5 mb-2" />
    <Skeleton className="h-4 w-3/4 mb-2" />
    <div className="flex gap-2 mt-auto">
      <Skeleton className="h-8 w-24 rounded" />
      <Skeleton className="h-8 w-8 rounded-full ml-auto" />
    </div>
  </div>
);

export default JobCardSkeleton;