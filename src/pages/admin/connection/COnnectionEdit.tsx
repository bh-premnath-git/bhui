import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { AddProject } from '@/features/admin/projects/AddProject';

const ConnectionEdit = () => {
  return (
    <AddProject />
  )
}

export default withPageErrorBoundary(ConnectionEdit, 'ConnectionEdit');
