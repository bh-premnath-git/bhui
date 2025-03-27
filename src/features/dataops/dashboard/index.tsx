import { useEffect, useCallback, useState } from "react"
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
import { 
  DndContext, 
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy
} from '@dnd-kit/sortable';

const DashboardContent = () => {
  const { chartData, chartOrder, setChartOrder } = useDataOps()
  const { loadSavedFilters } = useFilters()
  
  // State to track if we're actively dragging
  const [isDragging, setIsDragging] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  
  useEffect(() => {
    loadSavedFilters()
  }, [loadSavedFilters])

  // Configure the sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Configure pointer sensor to activate on move to reduce false activations
      activationConstraint: {
        distance: 5,
      },
    })
  );
  
  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    setActiveId(event.active.id as string);
    document.body.classList.add('dragging-active');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    setActiveId(null);
    document.body.classList.remove('dragging-active');
    
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      const oldIndex = chartOrder.findIndex(chartId => chartId === active.id);
      const newIndex = chartOrder.findIndex(chartId => chartId === over.id);
      
      setChartOrder(arrayMove(chartOrder, oldIndex, newIndex));
    }
  };

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
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="relative w-full bg-card/70 backdrop-blur-sm p-6 shadow-sm">
          <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
          
          <SortableContext 
            items={chartOrder} 
            strategy={rectSortingStrategy}
          >
            <div 
              className="flex flex-wrap"
              style={{
                gap: '1rem',
                alignItems: 'flex-start'
              }}
            >
              {/* Charts are now individually sortable using dnd-kit */}
              {chartOrder.map((chartId) => renderChart(chartId))}
            </div>
          </SortableContext>
        </div>
      </DndContext>
    </div>
  )
}

export default DashboardContent