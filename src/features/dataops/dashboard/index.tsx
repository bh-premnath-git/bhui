import { useEffect, useState, useRef } from "react"
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
  const { chartData, chartOrder, customCharts, setChartOrder } = useDataOps()
  const { loadSavedFilters } = useFilters()
  
  // State to track if we're actively dragging
  const [isDragging, setIsDragging] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // Ref for the grid container
  const gridContainerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    loadSavedFilters()
  }, [loadSavedFilters])
  
  // Add resize observer to adjust chart height based on available space
  useEffect(() => {
    const adjustChartHeights = () => {
      if (!gridContainerRef.current) return;
      
      const containerHeight = gridContainerRef.current.clientHeight;
      const containerWidth = gridContainerRef.current.clientWidth;
      const numColumns = containerWidth >= 1024 ? 3 : containerWidth >= 768 ? 2 : 1;
      
      // Calculate optimal chart height based on container size and chart count
      // We want charts to fit without scrolling if possible
      const numRows = Math.ceil(chartOrder.length / numColumns);
      const availableHeight = containerHeight - 10; // Account for gaps
      const optimalHeight = Math.floor(availableHeight / numRows) - 30; // Subtract for padding and margins
      
      // Use localStorage to store the calculated optimal height
      localStorage.setItem('optimal-chart-height', String(Math.max(80, Math.min(optimalHeight, 400))));
    };
    
    // Call once on mount
    adjustChartHeights();
    
    // Set up ResizeObserver to recalculate when container size changes
    const resizeObserver = new ResizeObserver(() => {
      adjustChartHeights();
    });
    
    if (gridContainerRef.current) {
      resizeObserver.observe(gridContainerRef.current);
    }
    
    // Clean up observer on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [chartOrder])

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
        return <StatusDonutChart title="Ingestion" data={chartData.ingestion} />
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
    <div className="flex flex-col h-full p-0 pb-4 pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 flex-shrink-0 mb-0 mt-1">
        <Filters />
      </div>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="relative w-full bg-card/70 backdrop-blur-sm p-1 pt-2 shadow-sm flex-grow">
          <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
          
          <SortableContext 
            items={chartOrder} 
            strategy={rectSortingStrategy}
          >
            <div ref={gridContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-min gap-2 p-1 h-full">
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