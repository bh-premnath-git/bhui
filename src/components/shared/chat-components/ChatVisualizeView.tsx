import React from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

export type ChartCategory = 'pipelineUsage' | 'projectStatusDuration' | 'latency'
export type SeriesType = 'single' | 'multi'
export type AxisType = 'vertical' | 'horizontal'

interface ChatVisualizeViewProps {
  config: {
    category: ChartCategory
    seriesType: SeriesType
    axisType: AxisType
  }
  onConfigChange: (config: ChatVisualizeViewProps['config']) => void
}

export function ChatVisualizeView({ config, onConfigChange }: ChatVisualizeViewProps) {
  return (
    <div className="flex flex-col space-y-4">
      {/* Data Category Selector */}
      <div>
        <label className="block text-sm font-medium mb-1">Data Category</label>
        <Select
          value={config.category}
          onValueChange={(value: string) => onConfigChange({ ...config, category: value as ChartCategory })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pipelineUsage">Pipeline Usage</SelectItem>
            <SelectItem value="projectStatusDuration">Project Status Duration</SelectItem>
            <SelectItem value="latency">Latency Trend</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Series Type Selector */}
      <div>
        <label className="block text-sm font-medium mb-1">Series Type</label>
        <Select
          value={config.seriesType}
          onValueChange={(value: string) => onConfigChange({ ...config, seriesType: value as SeriesType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select series type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Series</SelectItem>
            <SelectItem value="multi">Multi Series</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Axis Orientation Selector */}
      <div>
        <label className="block text-sm font-medium mb-1">Axis Orientation</label>
        <Select
          value={config.axisType}
          onValueChange={(value: string) => onConfigChange({ ...config, axisType: value as AxisType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select axis orientation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vertical">Vertical</SelectItem>
            <SelectItem value="horizontal">Horizontal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 