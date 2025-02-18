import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { EditProject } from '@/features/admin/projects/pages/EditProject';

const ProjectEdit = () => {
  return (
    <EditProject />
  )
}

export default withPageErrorBoundary(ProjectEdit, 'ProjectEdit');