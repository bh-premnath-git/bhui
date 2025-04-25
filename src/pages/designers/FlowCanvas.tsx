import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { FlowCanvasNew } from "@/features/designers/FlowCanvasNew";

function FlowCanvasPage() {
    return (
        <div className="h-[calc(100vh-80px)] w-full overflow-hidden">
            <FlowCanvasNew />
        </div>
    )
}

export default withPageErrorBoundary(FlowCanvasPage, 'FlowCanvas');
