import { useEffect, useState } from 'react';
import { Users  } from 'lucide-react';
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useUsers } from '@/features/admin/users/hooks/useUsers';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { UsersList } from '@/features/admin/users/Users';
import { useUserManagementService } from '@/features/admin/users/services/userMgtSrv';

function UsersListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { 
    users, 
    isLoading, 
    isFetching, 
    isError,
  } = useUsers({ 
    mutationsOnly: false,
    shouldFetch: true,
    page: currentPage,
    pageSize: pageSize
  });

  const usrMgntSrv = useUserManagementService();
  
  useEffect(() => {
    if(users && users?.users.length > 0){
      usrMgntSrv.setUsers(users?.users);
    }
  }, [users, usrMgntSrv]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    // When changing page size, usually we want to go back to the first page
    // to avoid unexpected empty results
    setCurrentPage(1);
  };

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
        <ErrorState message="Something went wrong" />
      </div>
    );
  }

  if (users?.users?.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Welcome to Your User Management!"
          description="Ready to manage your users."
          Icon={Users}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <LoadingState className='w-40 h-40' />
          </div>
        )}
        <UsersList 
          users={users?.users || []} 
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={users?.totalCount || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}

export default withPageErrorBoundary(UsersListPage, 'Users');
