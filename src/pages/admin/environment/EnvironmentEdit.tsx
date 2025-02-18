import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { EditEnvironment } from '@/features/admin/environment/pages/EditEnvironment';

const EnvironmentEdit = () => {
  return (
    <EditEnvironment />
  )
}

export default withPageErrorBoundary(EnvironmentEdit, 'EnvironmentEdit');