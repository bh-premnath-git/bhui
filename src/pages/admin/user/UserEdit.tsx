import { useEffect } from 'react';
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { EditUser } from '@/features/admin/users/EditUser';
import { fetchProjects } from '@/store/slices/admin/usersSlice';
import { useAppDispatch } from '@/hooks/useRedux';

const UserEdit = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {
      dispatch(fetchProjects());
    }, [dispatch]);

    return (
        <EditUser />
    )
}

export default withPageErrorBoundary(UserEdit, 'UserEdit');