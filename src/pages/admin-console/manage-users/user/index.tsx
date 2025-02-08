import { UserTable } from '@/features/adminconsole/users/table/UserTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAppDispatch } from '@/hooks/useRedux';
import { useEffect } from 'react';
import { setUsers } from '@/store/features/manageUserSlice';
import { getDataSources } from '@/api/get-methods';

const ManageUsers = () => {
  const dispatch = useAppDispatch();

  const { data: users, error, isLoading } = getDataSources.manageUsers();

  useEffect(() => {
    if (users) {
      dispatch(setUsers(users));
    }
  }, [users, dispatch]);

  if (isLoading) {
    return <LoadingState className='w-full min-h-screen'/>;
  }

  if (error) {
    return <ErrorState message={(error as Error).message} />;
  }

  return (
    <div className="container">
      <div className="bg-card rounded-lg shadow-sm">
        <UserTable data={users || []} />
      </div>
    </div>
  );
};

export default ManageUsers;