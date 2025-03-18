import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { EditConnection } from '@/features/admin/connection/EditConnection';

const ConnectionEdit = () => {
  return (
    <EditConnection />
  )
}

export default withPageErrorBoundary(ConnectionEdit, 'ConnectionEdit');
