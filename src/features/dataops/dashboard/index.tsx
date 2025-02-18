import { useEffect, useCallback } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Filters } from "./filterSelect"
import {
  LatencyTrendChart,
  CostTrendChart,
  StatusDonutChart,
  ProjectHealthChart,
  ProjectQualityChart,
  IncidentSummaryChart,
  FreshnessChart,
} from "./charts"
import { useDataOps } from "@/context/dataops/DataOpsContext"
import { useFilters } from "@/hooks/useFilter"

const DashboardContent = () => {
  const { chartData, chartOrder, setChartOrder } = useDataOps()
  const { loadSavedFilters } = useFilters()

  useEffect(() => {
    loadSavedFilters()
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
      case "publish":
        return <StatusDonutChart title="Publish Status" data={chartData.publish} />
      case "health":
        return <ProjectHealthChart data={chartData.health} />
      case "quality":
        return <ProjectQualityChart data={chartData.quality} />
      case "incident":
        return <IncidentSummaryChart data={chartData.incident} />
      case "freshness":
        return <FreshnessChart data={chartData.freshness} />
      default:
        return <div>Chart not implemented</div>
    }
  }

  return (
    <div className="p-2 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Filters />
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="chartsDroppable">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2"
            >
              {chartOrder.map((chartId, index) => (
                <Draggable key={chartId} draggableId={chartId} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="w-full p-1"
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