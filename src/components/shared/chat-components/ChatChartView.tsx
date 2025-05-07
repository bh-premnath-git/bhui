import { MockDataChart } from '@/features/dataops/dashboard/charts'

interface ChatChartViewProps {
  data: any[]
  config?: { category: string }
}

export function ChatChartView({
  data,
  config = { category: 'pipelineUsage' },
}: ChatChartViewProps) {
  return <MockDataChart data={data} />
}