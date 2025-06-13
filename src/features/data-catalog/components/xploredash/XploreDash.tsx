import { useMemo, useState, useEffect } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { Widget as WidgetType } from "@/types/dataops/dataops-dash";
import { SortableChartCard } from "@/features/dataops/dashboard/SortableChartCard";
import { LayoutDashboard } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

const ResponsiveGridLayout = WidthProvider(Responsive);

const DEFAULT_WIDGET_WIDTH = 6;
const DEFAULT_WIDGET_HEIGHT = 4;

interface XploreDashProps {
    widgets: WidgetType[];
    onWidgetRefresh: (widgetId: string) => Promise<void>;
}

export const XploreDash = ({ widgets, onWidgetRefresh }: XploreDashProps) => {

    const { isExpanded, isRightAsideOpen } = useSidebar(); 
    const [measurementKey, setMeasurementKey] = useState(0);

    const renderableWidgets = useMemo(() => {
        // Ensure widgets have an ID and necessary data for rendering
        return widgets.filter((w) => w.id != null && w.name && w.chart_config);
    }, [widgets]);

    // Added: useEffect to update measurementKey when sidebar state or widget count changes
    useEffect(() => {
        setMeasurementKey(prev => prev + 1);
    }, [isExpanded, isRightAsideOpen, renderableWidgets.length]); // Changed isSidebarOpen to isExpanded

    // Early empty-state
    if (renderableWidgets.length === 0) {
        return (
            <div className="min-h-[300px] flex flex-col items-center justify-center bg-card border rounded-lg">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                    No widgets yet
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                    Widgets created through the Xplorer chat will appear here.
                </p>
            </div>
        );
    }

    // Build initial layout – two widgets per row
    const initialLayout: Layout[] = renderableWidgets.map((widget, index) => ({
        i: widget.id!.toString(),
        x: (index % 2) * DEFAULT_WIDGET_WIDTH,
        y: Math.floor(index / 2) * DEFAULT_WIDGET_HEIGHT,
        w: DEFAULT_WIDGET_WIDTH,
        h: DEFAULT_WIDGET_HEIGHT,
        minW: 3,
        minH: 3, // Min height should accommodate header and some content
        maxW: 12,
        maxH: 8, // Max height can be adjusted
    }));

    return (
        <div className="p-2 rounded-lg">
            <ResponsiveGridLayout
                key={measurementKey} // Added: Key for re-measurement
                className="layout bg-muted/70 dark:bg-muted/45 p-1 rounded-md"
                layouts={{ lg: initialLayout, md: initialLayout, sm: initialLayout, xs: initialLayout, xxs: initialLayout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={65} // Changed from 75 to 65
                margin={[16, 16]}
                containerPadding={[16, 16]}
                isDraggable
                isResizable
                compactType="vertical"
                resizeHandles={["se"]}
                draggableHandle=".widget-header" // Ensure this class exists in WidgetHeader for dragging
                measureBeforeMount={false}
                useCSSTransforms
            >
                {renderableWidgets.map((widget) => (
                    <div 
                        key={widget.id!.toString()} 
                        className="rounded-lg border border-border/40 shadow-md hover:shadow-lg transition-shadow duration-200 bg-card dark:bg-card/95 h-full backdrop-blur-[2px] hover:border-border/80 overflow-hidden" // Added overflow-hidden
                    >
                        <SortableChartCard 
                            widget={widget} 
                            onWidgetRefresh={onWidgetRefresh} 
                        />
                        {/* Children are no longer passed here; SortableChartCard handles its content */}
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
};
