import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { AddProject } from '@/features/admin/projects/AddProject';

const ProjeAdd = () => {
  return (
    <AddProject />
  )
}

export default withPageErrorBoundary(ProjeAdd, 'ProjeAdd');
