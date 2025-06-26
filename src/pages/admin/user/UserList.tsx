import { HardHat } from 'lucide-react';
import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';

function UsersListPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-8 text-center bg-background">
      <HardHat className="w-24 h-24 mb-6 text-primary animate-bounce" />
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Under Construction
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We're currently working on the user management page. Please check back later!
      </p>
    </div>
  );
}

export default withPageErrorBoundary(UsersListPage, 'UsersListPage');
