import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { AddLlm } from '@/features/admin/llm/AddLlm';

const LlmAdd = () => {
  return (
    <AddLlm/>
  )
}

export default withPageErrorBoundary(LlmAdd, 'LlmAdd');
