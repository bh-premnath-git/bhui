import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { AddEnvironment } from '@/features/admin/environment/AddEnvironment';

const EnvironmentAdd = () => {
  return (
    <AddEnvironment />
  )
}

export default withPageErrorBoundary(EnvironmentAdd, 'EnvironmentAdd');