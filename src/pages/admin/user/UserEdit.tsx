import { RootState } from '@/store'
import { useAppSelector } from '@/hooks/uaeRedux'
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { EditUser } from '@/features/admin/users/EditUser';

const UserEdit = () => {
    const user = useAppSelector((state: RootState) => state.users.selectedUser);
    return (
        <EditUser />
    )
}

export default withPageErrorBoundary(UserEdit, 'UserEdit');