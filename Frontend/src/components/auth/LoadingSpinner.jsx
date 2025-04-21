import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-neutral-50 z-50">
      {/* Replace any green styling with neutral colors */}
      <div className="w-12 h-12 border-4 border-t-primary-500 border-neutral-200 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
