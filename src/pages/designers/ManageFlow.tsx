import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { ManageFlow } from '@/features/designers/ManageFlow';

function ManageFlowPage() {
    return (
        <ManageFlow />
    )
}

export default withPageErrorBoundary(ManageFlowPage, 'ManageFlow');