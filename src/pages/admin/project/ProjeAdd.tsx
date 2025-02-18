import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { AddProject } from '@/features/admin/projects/pages/AddProject';

const ProjeAdd = () => {
  return (
    <AddProject />
  )
}

export default withPageErrorBoundary(ProjeAdd, 'ProjeAdd');
