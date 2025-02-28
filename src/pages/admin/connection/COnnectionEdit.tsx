import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { EditConnection } from '@/features/admin/connection/EditConnection';

const ConnectionEdit = () => {
  return (
    <EditConnection />
  )
}

export default withPageErrorBoundary(ConnectionEdit, 'ConnectionEdit');
