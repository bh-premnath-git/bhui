import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { AddProject } from '@/features/admin/projects/AddProject';

const ConnectionList = () => {
  return (
    <AddProject />
  )
}

export default withPageErrorBoundary(ConnectionList, 'ConnectionList');
