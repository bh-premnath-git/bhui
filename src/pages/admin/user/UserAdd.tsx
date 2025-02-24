import { useEffect } from 'react';
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { AddUser } from '@/features/admin/users/AddUser';
import { fetchProjects } from '@/store/slices/admin/usersSlice';
import { useAppDispatch } from '@/hooks/uaeRedux';

const UserAdd = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  return (
    <AddUser />
  )
}
export default withPageErrorBoundary(UserAdd, 'UserAdd');