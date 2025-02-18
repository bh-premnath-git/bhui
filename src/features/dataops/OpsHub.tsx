
import React from 'react';
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';

function OpsHub() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Ops Hub</h1>
      <p>Monitor and manage your operations.</p>
    </div>
  );
}

export default withPageErrorBoundary(OpsHub, 'OpsHub');
