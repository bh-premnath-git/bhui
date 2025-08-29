
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { ComputeClusterFormStepper } from '@/features/admin/compute-cluster/components/ComputeClusterFormStepper';

export default function ComputeClusterAddPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(ROUTES.ADMIN.COMPUTE_CLUSTER.INDEX);
  };

  return (
    <ComputeClusterFormStepper
      mode="new"
      onBack={handleBack}
    />
  );
}