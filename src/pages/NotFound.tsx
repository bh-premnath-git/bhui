import React from 'react';
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';

function NotFound() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-gray-600">Page not found</p>
      </div>
    </div>
  );
}

export default withPageErrorBoundary(NotFound, 'NotFound');
