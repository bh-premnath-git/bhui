import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { AddPrompt } from '@/features/admin/prompt/AddPrompt';

const PromptAdd = () => {
  return (
    <AddPrompt />
  )
}

export default withPageErrorBoundary(PromptAdd, 'PromptAdd');