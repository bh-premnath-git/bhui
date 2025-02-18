import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { AddUser } from '@/features/admin/users/AddUser';
const UserAdd = () => {
  return (
    <AddUser />
  )
}
export default withPageErrorBoundary(UserAdd, 'UserAdd');