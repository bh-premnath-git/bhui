import React from 'react';

export const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
  </div>
);

// Also add a default export for flexibility
export default LoadingFallback;
