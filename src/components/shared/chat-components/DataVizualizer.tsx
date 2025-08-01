import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Code, BarChart4, Table as TableIcon, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { ChatSQLView } from '@/components/shared/chat-components/ChatSQLView';
import { ChatChartView } from '@/components/shared/chat-components/ChatChartView';
import { ChatTableView } from '@/components/shared/chat-components/ChatTableView';
import { DashboardSelect } from './DashboardSelect';
import { useDashboardSelector } from '@/hooks/useDashboardSelector';
import { ChartToolbar } from './ChartToolbar';
import { COLOR_THEMES } from '@/components/bh-charts/ChartTypes';

// Chart Data Interfaces
interface ChartRecommendation {
  type: string;
  confidence: number;
  reason: string;
}

interface GraphAxis {
  field: string;
  type: 'numerical' | 'categorical';
}

interface GraphConfig {
  primary_axis: {
    x: GraphAxis;
    y: GraphAxis;
  };
}

interface GraphDataPoint {
  x_axis: string | number;
  y_axis: string | number;
  [key: string]: string | number; // Allow additional fields
}

interface DataCharacteristics {
  total_records: number;
  numerical_columns: string[];
  categorical_columns: string[];
  [key: string]: any; // Allow additional properties
}

interface Metadata {
  data_characteristics?: DataCharacteristics;
  query_time?: number;
  [key: string]: any; // Allow additional properties
}

interface ChartData {
  chart_type: string;
  chart_recommendation: ChartRecommendation[];
  title: string;
  description: string;
  status: string;
  graph_config: GraphConfig;
  graph_data: GraphDataPoint[];
  metadata: Metadata;
  layout?: any;
  data?: any[];
}

interface AIDataVisualizerProps {
  sql?: any;
  data?: any;
  chart?: any;
  title?: string;
  onAddToDashboard?: (data: any) => void;
  variant?: 'governance' | 'explorer' | 'dataops' | string;
}

export function AIDataVisualizer({
  sql,
  data,
  chart,
  title = 'Visualized Data',
  onAddToDashboard,
  variant
}: AIDataVisualizerProps) {
  // Determine default tab based on available data
  const getDefaultTab = () => {
    if (chart) return 'chart';
    if (sql) return 'sql';
    if (data) return 'table';
    return 'sql';
  };
  
  const [activeTab, setActiveTab] = useState<'chart' | 'sql' |'table' | 'explanation'>(getDefaultTab());
  const [chartMetadata, setChartMetadata] = useState<ChartData | null>(null);
  const [formattedTableData, setFormattedTableData] = useState<any[]>([]);
  const [chartType, setChartType] = useState('bar');
  const [colorTheme, setColorTheme] = useState('default');
  
  // Explorer-specific states
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>("102");
  const [showDashboardSelect, setShowDashboardSelect] = useState(false);
  const [addedToDashboard, setAddedToDashboard] = useState(false);
  const [addedDashboardName, setAddedDashboardName] = useState<string | null>(null);
  
  // Get dashboard data for name lookups
  const { allDashboards } = useDashboardSelector();
  
  // Generate stable IDs for each tab component
  const tabIds = useMemo(() => ({
    chart: `chart-tab-${chart?.chart_metadata?.layout?.title?.text || chart?.response_type || Date.now()}`,
    sql: `sql-tab-${sql?.sql_query?.substring?.(0, 20)?.replace(/\s+/g, '-') || sql?.response_type || Date.now()}`,
    table: `table-tab-${data?.table_data?.length || data?.response_type || Date.now()}`
  }), [chart, sql, data]);

  useEffect(() => {
    if (chart && chart.chart_metadata) {
      setChartMetadata(chart.chart_metadata);
      setChartType(chart.chart_metadata.chart_type || 'bar');
      setActiveTab('chart');
    }
    if (data && data.table_data) {
      setFormattedTableData(data.table_data);
      if (!chart) setActiveTab('table');
    }
    if (sql && !chart && !data) {
      setActiveTab('sql');
    }
  }, [sql, data, chart]);

  const handleAddToDashboardClick = () => {
    if (variant === 'explorer') {
      setShowDashboardSelect(!showDashboardSelect);
    } else if (onAddToDashboard && chartMetadata) {
      onAddToDashboard({
        sql: sql?.sql_query,
        chartMetadata: chartMetadata,
        data: formattedTableData,
      });
    }
  };

  const handleDashboardSelected = (dashboardId: string) => {
    if (onAddToDashboard && chartMetadata) {
      onAddToDashboard({
        sql: sql?.sql_query,
        chartMetadata: chartMetadata,
        data: formattedTableData,
        dashboardId: dashboardId
      });
    }
    setShowDashboardSelect(false);
  };

  const dynamicChartData = useMemo(() => {
    if (!chartMetadata) return null;

    const themeColors = COLOR_THEMES[colorTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.default;

    return {
      ...chartMetadata,
      layout: {
        ...chartMetadata.layout,
        colorway: themeColors,
      },
      data: chartMetadata.data.map((trace: any) => ({
        ...trace,
        type: chartType,
      })),
    };
  }, [chartMetadata, chartType, colorTheme]);

  const availableTabs = useMemo(() => {
    const tabs = [];
    if (chart) tabs.push({ value: 'chart', label: 'Chart', icon: BarChart4 });
    if (sql) tabs.push({ value: 'sql', label: 'SQL', icon: Code });
    if (data) tabs.push({ value: 'table', label: 'Table', icon: TableIcon });
    return tabs;
  }, [chart, sql, data]);

  if (!sql && !data && !chart) return null;

  return (
    <motion.div
      className="mt-6 rounded-xl border bg-card shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-medium text-sm">{title}</h4>
          <div className="flex items-center space-x-2">
            <TabsList className="h-8 p-1">
              {availableTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="h-6 px-2 text-xs">
                  <tab.icon className="h-3.5 w-3.5 mr-1" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {onAddToDashboard && chartMetadata && variant === 'explorer' ? (
              <div className="relative">
                {addedToDashboard ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Added to {addedDashboardName || "dashboard"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDashboardSelect(!showDashboardSelect)}
                    className="h-8 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add to Dashboard
                    {showDashboardSelect ? (
                      <ChevronUp className="h-3.5 w-3.5 ml-1" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 ml-1" />
                    )}
                  </Button>
                )}
                {showDashboardSelect && (
                  <div className="absolute right-0 mt-1 w-56 p-2 rounded-md shadow-lg bg-white z-10 border">
                    <DashboardSelect 
                      onSelectDashboard={(id) => {
                        setSelectedDashboardId(id);
                        // Find dashboard name when selected
                        const dashboard = allDashboards.find(d => d.id === id);
                        if (dashboard) {
                          setAddedDashboardName(dashboard.name);
                        }
                      }} 
                      selectedDashboardId={selectedDashboardId} 
                    />
                    <div className="mt-2 flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          onAddToDashboard({
                            chartMetadata, 
                            sql: sql?.sql_query, 
                            data: data?.table_data,
                            dashboardId: selectedDashboardId
                          });
                          
                          // Update UI to show success state
                          setShowDashboardSelect(false);
                          setAddedToDashboard(true);
                          
                          // Reset after a few seconds (optional)
                          setTimeout(() => {
                            setAddedToDashboard(false);
                            setAddedDashboardName(null);
                          }, 5000);
                        }}
                        className="h-7 text-xs"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : onAddToDashboard && chartMetadata && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddToDashboard({ chartMetadata, sql: sql.sql_query, data: data.table_data })}
                className="h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Dashboard
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {chart && (
            <TabsContent value="chart" className="p-4">
              <motion.div
                key={tabIds.chart}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {chartMetadata && (
                  <>
                    <ChartToolbar 
                      currentChartType={chartType}
                      onChartTypeChange={setChartType}
                      selectedTheme={colorTheme}
                      onColorThemeChange={setColorTheme}
                    />
                    <ChatChartView data={dynamicChartData} />
                  </>
                )}
              </motion.div>
            </TabsContent>
          )}
          {sql && (
            <TabsContent value="sql" className="p-4">
              <motion.div
                key={tabIds.sql}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatSQLView sql={sql.sql_query} />
              </motion.div>
            </TabsContent>
          )}
          {data && (
            <TabsContent value="table" className="p-4">
              <motion.div
                key={tabIds.table}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatTableView data={formattedTableData} />
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}