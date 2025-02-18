import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { Designers } from '@/features/designers/DesignerDashboard';

const DesignerDashboard = () => {
  return (
    <Designers />
  )
}

export default withPageErrorBoundary(DesignerDashboard, 'DesignerDashboard')