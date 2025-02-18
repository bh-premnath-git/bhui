import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { FlowCanvas } from "@/features/designers/FlowCanvas";
function FlowCanvasPage() {
    return (
        <FlowCanvas />
    )
}

export default withPageErrorBoundary(FlowCanvasPage, 'FlowCanvas');

