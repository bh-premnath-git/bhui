import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { ListPrompt } from '@/features/admin/prompt/ListPrompt';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { usePrompts } from '@/features/admin/prompt/hooks/usePrompt';
import { BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';

const PromptList = () => {
  const { prompt, isLoading, isError, isFetching } = usePrompts();
  const { handleNavigation } = useNavigation()
  if (isError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Error Loading Prompt"
          description="There was an error loading the Prompt. Please try again later."
        />
      </div>
    );
  }

  if (!Array.isArray(prompt) || prompt.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          Icon={BookMarked}
          title="No Prompt Found"
          description="Get started by creating a new Prompt."
          action={
            <Button 
              onClick={() => handleNavigation(ROUTES.ADMIN.PROMPT.ADD)}
              className="mt-4"
            >
              Create Prompt
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
            <LoadingState className="w-40 h-40" />
          </div>
        )}
        <ListPrompt prompts={prompt} />
      </div>
    </div>
  );
}


export default withPageErrorBoundary(PromptList, 'PromptList');
