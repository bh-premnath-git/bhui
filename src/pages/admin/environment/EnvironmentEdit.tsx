import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { EditEnvironment } from '@/features/admin/environment/EditEnvironment';

const EnvironmentEdit = () => {
  return (
    <EditEnvironment />
  )
}

export default withPageErrorBoundary(EnvironmentEdit, 'EnvironmentEdit');