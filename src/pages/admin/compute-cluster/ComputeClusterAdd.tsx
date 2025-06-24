import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { ComputeClusterForm } from '@/features/admin/compute-cluster/components/ComputeClusterForm';

export default function ComputeClusterAddPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(ROUTES.ADMIN.COMPUTE_CLUSTER.INDEX);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Compute Clusters
        </Button>
      </div>

      <ComputeClusterForm
        mode="new"
        onBack={handleBack}
      />
    </div>
  );
}