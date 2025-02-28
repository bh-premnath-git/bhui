import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { AddConnection } from '@/features/admin/connection/AddConnection';

const ConnectionAdd = () => {
  return (
    <AddConnection />
  )
}

export default withPageErrorBoundary(ConnectionAdd, 'ConnectionAdd');
