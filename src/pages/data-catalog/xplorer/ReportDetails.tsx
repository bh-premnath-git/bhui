import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Star, 
  Trash,
  Plus,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  BarChart, 
  LineChart, 
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend as RechartsLegend,
  Bar,
  Line,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { ChartCard } from '@/features/dataops/dashboard/chart-components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { toast } from 'sonner';

const COLORS = [
  "var(--chart-1-color)",
  "var(--chart-2-color)",
  "var(--chart-3-color)",
  "var(--chart-4-color)",
  "var(--chart-5-color)"
];

// First, define the chart type union
type ChartType = 'bar' | 'line' | 'pie' | 'chart';

// Update the Widget interface
interface Widget {
  id: string;
  type: ChartType;
  title: string;
  data?: Array<{
    name: string;
    value: number;
  }>;
}

interface Report {
  id: string;
  title: string;
  description: string;
  type: ChartType; // Update this to use ChartType as well
  creator: string;
  created: string;
  updated: string;
  data?: {
    labels: string[];
    values: number[];
  };
  widgets?: Widget[];
}

// Mock data service - would be replaced with actual API calls
const getReportByPath = (path: string): Report | undefined => {
  if (path === 'orders-report') {
    return {
      id: 'orders-report',
      title: 'Orders Report',
      description: 'Detailed breakdown of order volume, status, and fulfillment metrics',
      type: 'line',
      creator: 'Maya Patel',
      created: '2025-02-15T11:45:00',
      updated: '2025-03-18T09:15:00',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [450, 520, 480, 600, 580, 710],
      },
      widgets: [
        {
          id: 'order-volume',
          type: 'line',
          title: 'Monthly Order Volume',
          data: [
            { name: 'Jan', value: 450 },
            { name: 'Feb', value: 520 },
            { name: 'Mar', value: 480 },
            { name: 'Apr', value: 600 },
            { name: 'May', value: 580 },
            { name: 'Jun', value: 710 }
          ]
        },
        {
          id: 'order-status',
          type: 'pie',
          title: 'Order Status Distribution',
          data: [
            { name: 'Delivered', value: 68 },
            { name: 'In Transit', value: 15 },
            { name: 'Processing', value: 12 },
            { name: 'Cancelled', value: 5 }
          ]
        },
        {
          id: 'avg-order-value',
          type: 'bar',
          title: 'Average Order Value',
          data: [
            { name: 'Jan', value: 127 },
            { name: 'Feb', value: 135 },
            { name: 'Mar', value: 142 },
            { name: 'Apr', value: 156 },
            { name: 'May', value: 168 },
            { name: 'Jun', value: 172 }
          ]
        },
        {
          id: 'order-fulfillment',
          type: 'bar',
          title: 'Order Fulfillment Time (days)',
          data: [
            { name: 'Electronics', value: 3.2 },
            { name: 'Clothing', value: 2.1 },
            { name: 'Home Goods', value: 2.7 },
            { name: 'Grocery', value: 1.2 },
            { name: 'Books', value: 1.9 }
          ]
        },
        {
          id: 'top-products',
          type: 'bar',
          title: 'Top Products by Orders',
          data: [
            { name: 'Smartphone', value: 342 },
            { name: 'Laptop', value: 247 },
            { name: 'Headphones', value: 186 },
            { name: 'Smartwatch', value: 152 },
            { name: 'Tablet', value: 137 }
          ]
        }
      ]
    };
  } else if (path === 'inventory-report') {
    return {
      id: 'inventory-report',
      title: 'Inventory Report',
      description: 'Current inventory levels, restocking needs, and product turnover analysis',
      type: 'pie',
      creator: 'Carlos Rodriguez',
      created: '2025-02-20T13:20:00',
      updated: '2025-03-20T16:30:00',
      data: {
        labels: ['In Stock', 'Low Stock', 'Out of Stock', 'On Order'],
        values: [65, 20, 5, 10],
      },
      widgets: [
        {
          id: 'inventory-status',
          type: 'pie',
          title: 'Current Inventory Status',
          data: [
            { name: 'In Stock', value: 65 },
            { name: 'Low Stock', value: 20 },
            { name: 'Out of Stock', value: 5 },
            { name: 'On Order', value: 10 }
          ]
        },
        {
          id: 'stock-trends',
          type: 'line',
          title: 'Stock Level Trends',
          data: [
            { name: 'Week 1', value: 872 },
            { name: 'Week 2', value: 834 },
            { name: 'Week 3', value: 789 },
            { name: 'Week 4', value: 756 },
            { name: 'Week 5', value: 723 },
            { name: 'Week 6', value: 798 }
          ]
        },
        {
          id: 'category-value',
          type: 'pie',
          title: 'Inventory Value by Category',
          data: [
            { name: 'Electronics', value: 42 },
            { name: 'Clothing', value: 28 },
            { name: 'Home Goods', value: 15 },
            { name: 'Sporting Goods', value: 10 },
            { name: 'Books', value: 5 }
          ]
        },
        {
          id: 'turnover-rate',
          type: 'bar',
          title: 'Inventory Turnover Rate',
          data: [
            { name: 'Electronics', value: 5.2 },
            { name: 'Clothing', value: 7.8 },
            { name: 'Home Goods', value: 4.6 },
            { name: 'Sporting Goods', value: 3.9 },
            { name: 'Books', value: 2.7 }
          ]
        },
        {
          id: 'restock-alerts',
          type: 'bar',
          title: 'Items Requiring Restock',
          data: [
            { name: 'Smartphones', value: 12 },
            { name: 'T-shirts', value: 8 },
            { name: 'Headphones', value: 7 },
            { name: 'Blenders', value: 5 },
            { name: 'Fitness Trackers', value: 4 }
          ]
        }
      ]
    };
  }
  return undefined;
};

const ReportDetails: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
  const [isResizing, setIsResizing] = useState(false);
  const location = useLocation();

  // Add validation helper
  const isValidChartData = (data: any[]): boolean => {
    return Array.isArray(data) && data.length > 0 && data.every(item => 
      item && typeof item === 'object' && 
      'name' in item && 
      'value' in item &&
      item.name !== null &&
      item.value !== null
    );
  };

  // Add error state to track rendering issues
  const [renderErrors, setRenderErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (reportId) {
      setLoading(true);
      const fetchedReport = getReportByPath(reportId);
      if (fetchedReport) {
        // If no widgets are defined, add a default chart widget.
        if (!fetchedReport.widgets || fetchedReport.widgets.length === 0) {
          const defaultWidget: Widget = {
            id: `default-chart`,
            type: (fetchedReport.type as ChartType) || 'bar', // Add type assertion
            title: fetchedReport.title,
          };
          fetchedReport.widgets = [defaultWidget];
        }
        setReport(fetchedReport);
        setWidgetOrder(fetchedReport.widgets.map(widget => widget.id));
      } else {
        console.error(`Report with ID ${reportId} not found`);
      }
      setLoading(false);
    }
  }, [reportId]);

  // Add debug logging
  useEffect(() => {
    if (location.state?.newWidget) {
      console.log('Received new widget in location state:', location.state.newWidget);
    }
  }, [location.state]);

  // Fix the widget handling effect
  useEffect(() => {
    const newWidget = location.state?.newWidget;
    
    if (!newWidget) return; // Exit early if no widget
    
    console.log('Processing new widget:', newWidget);
    console.log('Current report:', report);

    try {
      // Create a properly typed widget
      const widget: Widget = {
        id: newWidget.id || `widget-${Date.now()}`,
        type: (newWidget.type as ChartType) || 'bar',
        title: newWidget.title || 'New Chart',
        data: Array.isArray(newWidget.data) ? 
          newWidget.data.map(item => ({
            name: String(item?.name || ''),
            value: Number(item?.value) || 0
          })) : []
      };

      console.log('Formatted widget to add:', widget);

      // Update report state
      setReport(prevReport => {
        if (!prevReport) return prevReport;
        
        const updatedWidgets = [...(prevReport.widgets || []), widget];
        const updatedReport = {
          ...prevReport,
          widgets: updatedWidgets
        };
        
        console.log('Updated report with new widget:', updatedReport);
        return updatedReport;
      });
      
      // Update widget order
      setWidgetOrder(prevOrder => {
        const newOrder = [...prevOrder, widget.id];
        console.log('Updated widget order:', newOrder);
        return newOrder;
      });
      
      // Clear location state
      setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
        toast.success("Chart added to report successfully");
      }, 100);
    } catch (error) {
      console.error('Error adding new widget:', error);
      toast.error("Failed to add chart to report");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.newWidget, location.state?.timestamp]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold mb-4">Report Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The report you're looking for doesn't exist or may have been deleted.
          </p>
          <Button onClick={() => navigate('/data-catalog/xplorer')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Data Explorer
          </Button>
        </div>
      </div>
    );
  }

  // Transform the report data into an array of objects for the charts
  const chartData =
    report.data && report.data.labels && report.data.values
      ? report.data.labels.map((label, index) => ({
          name: label,
          value: report.data!.values[index],
        }))
      : [];

  // The main chart section has been removed.
  // The chart will now render only as a widget in the widget area.

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(widgetOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setWidgetOrder(items);
  };

  const addWidget = () => {
    // Navigate to Xplorer with state information about the source report
    navigate(`${ROUTES.DATA_CATALOG}/xplorer`, {
      state: {
        sourceReport: reportId,
        returnPath: `/data-catalog/xplorer/${reportId}`
      }
    });
  };

  const renderWidget = (widgetId: string) => {
    try {
      if (!report?.widgets) {
        console.error('No report or widgets available');
        return null;
      }

      const widget = report.widgets.find(w => w.id === widgetId);
      if (!widget) {
        console.error(`Widget with id ${widgetId} not found`);
        return null;
      }

      // Ensure widget has required properties
      if (!widget.type) {
        console.error(`Widget ${widgetId} has no type`);
        return null;
      }

      // Use widget's data if available, otherwise fall back to report data
      let widgetData = widget.data || chartData;

      // Validate data structure
      if (!isValidChartData(widgetData)) {
        console.error(`Invalid data structure for widget ${widgetId}`);
        return (
          <ChartCard title={widget.title || 'Untitled'} className="h-full">
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Invalid chart data structure
            </div>
          </ChartCard>
        );
      }

      // Ensure numeric values
      widgetData = widgetData.map(item => ({
        name: String(item.name || ''),
        value: Number(item.value) || 0
      }));

      return (
        <ChartCard title={widget.title || 'Untitled'} className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            {(() => {
              try {
                switch (widget.type) {
                  case 'bar':
                    return (
                      <BarChart data={widgetData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <RechartsLegend />
                        <Bar dataKey="value" fill={COLORS[0]} />
                      </BarChart>
                    );
                  case 'line':
                    return (
                      <LineChart data={widgetData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <RechartsLegend />
                        <Line type="monotone" dataKey="value" stroke={COLORS[1]} />
                      </LineChart>
                    );
                  case 'pie':
                    return (
                      <PieChart>
                        <Pie
                          data={widgetData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill={COLORS[0]}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => 
                            `${name || 'Unnamed'}: ${((percent || 0) * 100).toFixed(0)}%`
                          }
                        >
                          {widgetData.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <RechartsLegend />
                      </PieChart>
                    );
                  default:
                    console.warn(`Unknown chart type: ${widget.type}, falling back to bar chart`);
                    return (
                      <BarChart data={widgetData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <RechartsLegend />
                        <Bar dataKey="value" fill={COLORS[0]} />
                      </BarChart>
                    );
                }
              } catch (error) {
                console.error(`Error rendering chart for widget ${widgetId}:`, error);
                return (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Error rendering chart
                  </div>
                );
              }
            })()}
          </ResponsiveContainer>
        </ChartCard>
      );
    } catch (error) {
      console.error(`Error in renderWidget for ${widgetId}:`, error);
      return (
        <ChartCard title="Error" className="h-full">
          <div className="flex items-center justify-center h-full text-destructive">
            Failed to render widget
          </div>
        </ChartCard>
      );
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/data-catalog/xplorer')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <h1 className="text-2xl font-bold">{report.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Visualization Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span></span>
            <Button 
              onClick={addWidget}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Insight
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Widget Drag and Drop Area */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets" isDropDisabled={isResizing} direction="horizontal">
              {(provided) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps} 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto"
                >
                  {widgetOrder.map((widgetId, index) => (
                    <Draggable key={widgetId} draggableId={widgetId} index={index} isDragDisabled={isResizing}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="h-[400px]" // Fixed height for each chart container
                          style={{
                            ...provided.draggableProps.style,
                          }}
                        >
                          {renderWidget(widgetId)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDetails;
