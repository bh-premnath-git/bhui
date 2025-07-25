import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useUsersQuery } from '@/features/admin/users/hooks/useUsersQuery';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { UsersList } from '@/features/admin/users/Users';
import { useUserManagementService } from '@/features/admin/users/services/userMgtSrv';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';

function UsersListPage() {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);

  const { 
    users, 
    total, 
    isFetching, 
    isLoading, 
    isError, 
    next, 
    prev 
  } = useUsersQuery({
    shouldFetch: true,
    limit: limit,
    offset: offset,
  });
  
  const userMgntSrv = useUserManagementService();
  const { handleNavigation } = useNavigation();

  const pageIndex = Math.floor(offset / limit);

  const handlePageChange = (page: number) => {
    const currentPageIndex = pageIndex;
    if (page > currentPageIndex && next) {
        setOffset(o => o + limit);
    } else if (page < currentPageIndex && prev) {
        setOffset(o => Math.max(0, o - limit));
    }
  };

  const handlePageSizeChange = (newLimit: number) => {
      setLimit(newLimit);
      setOffset(0);
  };

  useEffect(() => {
    if (Array.isArray(users) && users.length > 0) {
      userMgntSrv.setUsers(users);
    }
  }, [users, userMgntSrv]);

  if (isLoading) {
    return (
      <div className="p-6">
        <TableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Error Loading Users"
          description="There was an error loading the users. Please try again later."
        />
      </div>
    );
  }

  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          Icon={Users}
          title="No Users Found"
          description="Get started by creating a new user."
          action={
            <Button 
              onClick={() => handleNavigation(ROUTES.ADMIN.USERS.ADD)}
              className="mt-4"
            >
              Create User
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <LoadingState classNameContainer="w-40 h-40" />
          </div>
        )}
        <UsersList 
          users={users}
          pageCount={Math.ceil((total || 0) / limit)}
          pageIndex={pageIndex}
          pageSize={limit}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          hasNextPage={next}
          hasPreviousPage={prev}
        />
      </div>
    </div>
  );
}

export default withPageErrorBoundary(UsersListPage, 'Users');
