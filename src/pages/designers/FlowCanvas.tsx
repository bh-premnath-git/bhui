import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { FlowCanvas } from "@/features/designers/FlowCanvas";

function FlowCanvasPage() {
    return (
        <div className="h-[calc(100vh-80px)] w-full overflow-hidden">
            <FlowCanvas />
        </div>
    )
}

export default withPageErrorBoundary(FlowCanvasPage, 'FlowCanvas');
