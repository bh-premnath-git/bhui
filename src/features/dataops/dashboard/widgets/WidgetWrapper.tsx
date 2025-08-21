import { createPortal } from 'react-dom';
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import {
  setChartType,
  setColorScheme,
  toggleChartTypePicker,
  toggleColorSchemePicker,
  flipWidget,
  toggleMaximize,
} from '@/store/slices/dataops/dashboardSlice';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WidgetHeader } from './WidgetHeader';
import { useDataOpsWidgets } from '../../dataOpsHubs/hooks/useDataOpsDash';
import { ChartView } from './components/ChartView';
import { TableView } from './components/TableView';
import { SqlViewer } from './components/SqlViewer';
import { ChartTypeViewer } from './components/ChartTypeViewer';
import { ColorSchemeViewer } from './components/ColorSchemeViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { decompressValue } from '@/lib/decompress';

interface WidgetWrapperProps {
  widgetId: string;
  title: string;
  className?: string;
}

export const WidgetWrapper = ({ widgetId, title, className }: WidgetWrapperProps) => {
  const {
    widgetDetail: data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useDataOpsWidgets({ widgetId });

  const dispatch = useAppDispatch();
  const widgetState = useAppSelector((state) => state.dashboard.widgets[widgetId]);

  const plotlyData = decompressValue(data?.plotly_data);
  const { isFlipped, isMaximized, isChartTypePickerOpen, isColorSchemePickerOpen, chartType, color } = widgetState ?? {};

  const hasExecutedQueryError =
    !!(data?.executed_query &&
      Array.isArray(data.executed_query) &&
      data.executed_query.length > 0 &&
      data.executed_query[0]?.error);

  const errorSummary = hasExecutedQueryError
    ? String(data!.executed_query[0].error).split('\n')[0].slice(0, 300)
    : 'No data available';

  const headerProps = {
    widgetId,
    title: (plotlyData?.layout?.title?.text as string) || title,
    isFlipped: !!isFlipped,
    isMaximized: !!isMaximized,
    isRefreshing: isLoading || isFetching,
    onFlip: () => dispatch(flipWidget(widgetId)),
    onMaximize: () => dispatch(toggleMaximize(widgetId)),
    onToggleChartTypePicker: () => dispatch(toggleChartTypePicker(widgetId)),
    onToggleColorSchemePicker: () => dispatch(toggleColorSchemePicker(widgetId)),
    onRefresh: refetch,
  };

  // Loading skeleton in card shell (so layout doesn't jump)
  if (isLoading || isFetching) {
    const skeleton = (
      <Card id={`widget-${widgetId}`} className={`bg-background border shadow-sm h-full ${className}`}>
        <WidgetHeader {...headerProps} />
        <div className="p-2 h-full flex flex-col gap-3">
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full flex-1" />
          <div className="flex gap-2">
            <Skeleton className="w-20 h-6" />
            <Skeleton className="w-16 h-6" />
          </div>
        </div>
      </Card>
    );
    return isMaximized
      ? createPortal(<div className="fixed inset-0 z-50 bg-background p-4">{skeleton}</div>, document.body)
      : skeleton;
  }

  // Polished error state inside the same card (keeps consistent chrome)
  if (!widgetState || isError || !data || !plotlyData) {
    const errorCard = (
      <Card id={`widget-${widgetId}`} className={`bg-background border shadow-sm h-full flex flex-col ${className}`}>
        <WidgetHeader {...headerProps} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 text-muted-foreground">
            {errorSummary}
          </div>
          <Button variant="default" onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </Card>
    );
    return isMaximized
      ? createPortal(
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-auto">
          <div className="min-h-screen p-4 flex items-center justify-center">
            <div className="w-full max-w-6xl h-[80vh]">{errorCard}</div>
          </div>
        </div>,
        document.body
      )
      : errorCard;
  }

  const pickerBody = isChartTypePickerOpen ? (
    <ChartTypeViewer
      selected={chartType}
      onChange={(type) => dispatch(setChartType({ id: widgetId, chartType: type }))}
      onApply={() => dispatch(toggleChartTypePicker(widgetId))}
    />
  ) : isColorSchemePickerOpen ? (
    <ColorSchemeViewer
      selected={color.scheme}
      onChange={(scheme, palette) =>
        dispatch(setColorScheme({ id: widgetId, scheme, customPalette: palette }))
      }
      onApply={() => dispatch(toggleColorSchemePicker(widgetId))}
    />
  ) : null;

  const contentBody = pickerBody ? (
    <div className="p-4 overflow-auto h-full">{pickerBody}</div>
  ) : (
    <div className="h-[calc(100%-50px)] relative overflow-hidden perspective-1000">
      <div
        data-rotator
        className={`absolute inset-0 transition-all duration-500 ease-in-out ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front (chart) */}
        <div
          className="absolute inset-0"
          data-face="front"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="p-2 h-full">
            {/* IMPORTANT: pass the full layout, not layout.template */}
            <ChartView
              data={plotlyData?.data}
              layout={plotlyData?.layout}
              widgetId={widgetId}
              chartType={chartType}
              color={color}
            />
          </div>
        </div>

        {/* Back (table / SQL) */}
        <div
          className="absolute inset-0"
          data-face="back"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Tabs defaultValue="table" className="h-full flex flex-col">
            <div className="px-2 pt-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="sql">SQL</TabsTrigger>
              </TabsList>
            </div>
            <div className="flex-1 p-2 pt-1 overflow-auto">
              <TabsContent value="table" className="h-full m-0">
                <TableView data={data.executed_query} />
              </TabsContent>
              <TabsContent value="sql" className="h-full m-0">
                <SqlViewer query={data.sql_query || 'No query available'} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );

  const card = (
    <Card id={`widget-${widgetId}`} className={`bg-background border shadow-sm hover:shadow-md transition-shadow h-full overflow-hidden ${className}`}>
      <WidgetHeader {...headerProps} />
      {contentBody}
    </Card>
  );

  return isMaximized
    ? createPortal(
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-auto">
        <div className="min-h-screen p-4 flex items-center justify-center">
          <div className="w-full max-w-6xl h-[80vh]">{card}</div>
        </div>
      </div>,
      document.body
    )
    : card;
};