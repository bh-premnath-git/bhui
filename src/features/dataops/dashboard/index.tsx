import { useEffect, useCallback, useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Filters } from "./filterSelect"
import {
  LatencyTrendChart,
  CostTrendChart,
  StatusDonutChart,
  ProjectHealthChart,
  ProjectQualityChart,
  IncidentSummaryChart,
} from "./charts"
import { useDataOps } from "@/context/dataops/DataOpsContext"
import { useFilters } from "@/hooks/useFilter"

// Define type for resize event
interface ChartResizeEvent extends CustomEvent {
  detail: { isResizing: boolean }
}

const DashboardContent = () => {
  const { chartData, chartOrder, setChartOrder } = useDataOps()
  const { loadSavedFilters } = useFilters()
  
  // State to track if we're actively resizing
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    loadSavedFilters()
    
    // Listen for resize events from chart components
    const handleResize = (e: ChartResizeEvent) => {
      setIsResizing(e.detail.isResizing)
    }
    
    window.addEventListener('chart-resize-state', handleResize as EventListener)
    
    return () => {
      window.removeEventListener('chart-resize-state', handleResize as EventListener)
    }
  }, [loadSavedFilters])

  const handleDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) return

      const newOrder = Array.from(chartOrder)
      const [movedItem] = newOrder.splice(result.source.index, 1)
      newOrder.splice(result.destination.index, 0, movedItem)

      setChartOrder(newOrder)
    },
    [chartOrder, setChartOrder],
  )

  const renderChart = (chartId: string) => {
    switch (chartId) {
      case "latency":
        return <LatencyTrendChart data={chartData.latency} />
      case "cost":
        return <CostTrendChart data={chartData.cost} />
      case "ingestion":
        return <StatusDonutChart title="Ingestion Status" data={chartData.ingestion} />
      case "health":
        return <ProjectHealthChart data={chartData.health} />
      case "quality":
        return <ProjectQualityChart data={chartData.quality} />
      case "incident":
        return <IncidentSummaryChart data={chartData.incident} />
      default:
        return <div>Chart not implemented</div>
    }
  }

  return (
    <div className="p-2 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
        <Filters />
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable 
          droppableId="chartsDroppable"
          isDropDisabled={isResizing}
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-wrap"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'flex-start'
              }}
            >
              {chartOrder.map((chartId, index) => (
                <Draggable 
                  key={chartId} 
                  draggableId={chartId} 
                  index={index}
                  isDragDisabled={isResizing}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        minWidth: '300px',
                        margin: '0.5rem'
                      }}
                    >
                      {renderChart(chartId)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default DashboardContent