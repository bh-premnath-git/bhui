import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { ComputeClusterFormStepper } from '@/features/admin/compute-cluster/components/ComputeClusterFormStepper';
import { useComputeCluster } from '@/features/admin/compute-cluster/hooks/useComputeCluster';

export default function ComputeClusterEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useComputeClusterDetail } = useComputeCluster();

  const { data: computeCluster, isLoading, error } = useComputeClusterDetail(id!);

  const handleBack = () => {
    navigate(ROUTES.ADMIN.COMPUTE_CLUSTER.INDEX);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading compute config...</p>
        </div>
      </div>
    );
  }

  if (error || !computeCluster) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load compute config details.</p>
        </div>
      </div>
    );
  }

  return (
    <ComputeClusterFormStepper
      computeClusterId={id}
      isEdit={true}
      mode="edit"
      formData={computeCluster}
      onBack={handleBack}
    />
  );
}