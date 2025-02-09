import { UserTable } from '@/features/adminconsole/users/UserTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAppDispatch } from '@/hooks/useRedux';
import { useEffect } from 'react';
import { setUsers } from '@/store/features/manageUserSlice';
import { getDataSources } from '@/api/get-methods';
import { Users2 } from 'lucide-react';

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

  if(users.users.length === 0){
    return (
      <div className="container">
          <EmptyState
            title="Welcome to Your User Management !"
            description="Ready to manage your users."
            Icon={Users2}
          />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="bg-card rounded-lg shadow-sm">
        <UserTable data={users.users || []} />
      </div>
    </div>
  );
};

export default ManageUsers;