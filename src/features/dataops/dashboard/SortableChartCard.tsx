import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WidgetHeader } from "./widgets/WidgetHeader";
import { cn } from "@/lib/utils";

interface SortableChartCardProps {
  id: string;
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export const SortableChartCard: React.FC<SortableChartCardProps> = ({
  id,
  title,
  description,
  className = "",
  children,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    
    // Simulate refresh - could be replaced with actual data fetching
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsRefreshing(false);
  };

  return (
    <Card 
      className={cn("h-full relative overflow-hidden", className)}
      data-widget-id={id}
    >
      <CardContent className="p-4 h-full flex flex-col">
        <WidgetHeader 
          title={title}
          description={description}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <div className="flex-grow relative mt-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};
