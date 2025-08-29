import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { AddProject } from '@/features/admin/projects/AddProject';

const ProjeAdd = () => {
  return (
    <AddProject />
  )
}

export default withPageErrorBoundary(ProjeAdd, 'ProjeAdd');
