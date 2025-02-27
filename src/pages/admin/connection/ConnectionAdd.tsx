import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { AddProject } from '@/features/admin/projects/AddProject';

const ConnectionAdd = () => {
  return (
    <AddProject />
  )
}

export default withPageErrorBoundary(ConnectionAdd, 'ConnectionAdd');
