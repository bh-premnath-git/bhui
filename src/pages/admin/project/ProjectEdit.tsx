import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { EditProject } from '@/features/admin/projects/EditProject';

const ProjectEdit = () => {
  return (
    <EditProject />
  )
}

export default withPageErrorBoundary(ProjectEdit, 'ProjectEdit');