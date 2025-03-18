import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { AddConnection } from '@/features/admin/connection/AddConnection';

const ConnectionAdd = () => {
  return (
    <AddConnection />
  )
}

export default withPageErrorBoundary(ConnectionAdd, 'ConnectionAdd');
