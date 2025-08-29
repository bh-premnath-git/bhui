import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { EditPrompt } from '@/features/admin/prompt/EditPrompt';

const PromptEdit = () => {
  return (
    <EditPrompt />
  )
}

export default withPageErrorBoundary(PromptEdit, 'PromptEdit');
