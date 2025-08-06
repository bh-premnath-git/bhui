import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { EditLlm } from '@/features/admin/llm/EditLlm';

const LlmEdit = () => {
  return (
    <EditLlm/>
  )
}

export default withPageErrorBoundary(LlmEdit, 'LlmEdit');