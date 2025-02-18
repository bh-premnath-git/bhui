
import React from 'react';
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';

function ReleaseBundle() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Releases</h1>
      <p>Handle release bundles and deployments.</p>
    </div>
  );
}

export default withPageErrorBoundary(ReleaseBundle, 'ReleaseBundle');
