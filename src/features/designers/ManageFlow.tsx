
import React from 'react';
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';

function ManageFlow() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Flow</h1>
      <p>Control and monitor your data flows.</p>
    </div>
  );
}

export default withPageErrorBoundary(ManageFlow, 'ManageFlow');
