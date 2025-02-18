import { RootState } from '@/store'
import { useAppSelector } from '@/hooks/uaeRedux'
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';

const UserEdit = () => {
    const user = useAppSelector((state: RootState) => state.users.selectedUser);
    return (
        <div>UserEdit</div>
    )
}

export default withPageErrorBoundary(UserEdit, 'UserEdit');