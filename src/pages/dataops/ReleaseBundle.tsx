import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { ReleaseBundle } from '@/features/dataops/ReleaseBundle';
function ReleaseBundlePage() {
    return <ReleaseBundle />;
}

export default withPageErrorBoundary(ReleaseBundlePage, 'ReleaseBundle');