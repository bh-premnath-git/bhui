import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { ChartCategory, SeriesType, AxisType } from './ChatVisualizeView'

interface ChatChartViewProps {
  data: { label: string; value: number }[]
  config?: { category: ChartCategory; seriesType: SeriesType; axisType: AxisType }
}

export function ChatChartView({
  data,
  config = { category: 'pipelineUsage', seriesType: 'single', axisType: 'vertical' },
}: ChatChartViewProps) {
  // Prepare data for multi-series if needed
  const processedData = config.seriesType === 'multi'
    ? data.map(d => ({ ...d, secondary: Math.round(d.value * 0.7) }))
    : data
  // Determine bar layout: horizontal axis means vertical bars layout
  const layout = config.axisType === 'horizontal' ? 'vertical' : 'horizontal'
  return (
    <BarChart layout={layout} width={300} height={150} data={processedData}>
      <XAxis dataKey="label" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#4f46e5" />
      {config.seriesType === 'multi' && (
        <Bar dataKey="secondary" fill="#0EA5E9" />
      )}
    </BarChart>
  )
} 