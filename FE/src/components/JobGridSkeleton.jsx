// src/components/JobGridSkeleton.jsx
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

// Component con để tạo MỘT card skeleton.
// Nó không được export ra ngoài, chỉ dùng nội bộ trong file này.
const SingleJobCardSkeleton = () => {
  return (
    <Card className="flex flex-col h-full w-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-md" /> {/* Dùng rounded-md cho giống logo */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-5 w-[60%]" />
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardFooter>
    </Card>
  );
};

// Component chính được export.
// Nó tạo ra một lưới Tailwind và lặp để render các card skeleton.
function JobGridSkeleton({ count = 6 }) {
  return (
    // Sử dụng Tailwind CSS Grid để tạo layout responsive
    // - 1 cột trên màn hình nhỏ nhất (mặc định)
    // - 2 cột trên màn hình sm (small) trở lên
    // - 3 cột trên màn hình lg (large) trở lên
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <SingleJobCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export default JobGridSkeleton;