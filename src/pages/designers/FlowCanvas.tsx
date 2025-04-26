import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { FlowCanvasNew } from "@/features/designers/FlowCanvasNew";

function FlowCanvasPage() {
    return (
        <div className="h-full w-full">
            <FlowCanvasNew />
        </div>
    )
}

export default withPageErrorBoundary(FlowCanvasPage, 'FlowCanvas');
