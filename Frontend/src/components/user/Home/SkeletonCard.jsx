import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse h-full">
      <div className="aspect-[16/9] bg-neutral-200"></div>
      <div className="p-4 space-y-2">
        <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
        <div className="h-4 bg-neutral-200 rounded"></div>
        <div className="h-4 bg-neutral-200 rounded w-4/5"></div>
        <div className="h-4 bg-neutral-200 rounded w-3/5"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;