import { useMemo } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { Widget as WidgetType } from "@/types/dataops/dataops-dash";
import { SortableChartCard } from "@/features/dataops/dashboard/SortableChartCard";
import { PlotlyChart } from "@/features/dataops/dashboard/widgets/charts/PlotlyChart";
import { LayoutDashboard } from "lucide-react";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Default widget dimensions
const DEFAULT_WIDGET_WIDTH = 6;
const DEFAULT_WIDGET_HEIGHT = 4;

interface XploreDashProps {
    widgets: any;
}

export const XploreDash = ({ widgets }: XploreDashProps) => {

    console.log("rendering widgets", widgets);

    const renderableWidgets = useMemo(() => {
        return widgets.filter((w) => w.id != null);
    }, [widgets]);

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
        minH: 3,
        maxW: 12,
        maxH: 8,
    }));

    return (
        <div className="p-2 rounded-lg">
            <ResponsiveGridLayout
                className="layout bg-muted/70 dark:bg-muted/45 p-1 rounded-md"
                layouts={{ lg: initialLayout, md: initialLayout, sm: initialLayout, xs: initialLayout, xxs: initialLayout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={65}
                margin={[16, 16]}
                containerPadding={[16, 16]}
                isDraggable
                isResizable
                compactType="vertical"
                resizeHandles={["se"]}
                draggableHandle=".widget-header"
                measureBeforeMount={false}
                useCSSTransforms
            >
                {renderableWidgets.map((widget) => (
                    <div key={widget.id!.toString()} className="rounded-lg border border-border/40 shadow-md hover:shadow-lg transition-shadow duration-200 bg-card dark:bg-card/95 h-full backdrop-blur-[2px] hover:border-border/80">
                        <SortableChartCard id={widget.id!.toString()} title={widget.name} description={widget.chart_config.metric}>
                            {/* Re-use PlotlyChart if we stored processed data */}
                            {widget.intermediate_executed_query_json ? (
                                <PlotlyChart widget={widget} height={200} className="w-full h-full" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Unsupported chart</div>
                            )}
                        </SortableChartCard>
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
};
