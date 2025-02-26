import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { FlowCanvas } from "@/features/designers/FlowCanvas";

function FlowCanvasPage() {
    return (
        <div className="h-screen w-full">
            <FlowCanvas />
        </div>
    )
}

export default withPageErrorBoundary(FlowCanvasPage, 'FlowCanvas');
