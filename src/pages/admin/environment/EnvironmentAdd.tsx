import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { AddEnvironment } from '@/features/admin/environment/AddEnvironment';

const EnvironmentAdd = () => {
  return (
    <AddEnvironment />
  )
}

export default withPageErrorBoundary(EnvironmentAdd, 'EnvironmentAdd');