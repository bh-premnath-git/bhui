import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigation } from "@/hooks/useNavigation";
import { ChevronRight } from 'lucide-react';
import Plot from 'react-plotly.js';
import { ROUTES } from '@/config/routes';

// --- Data (same as your original) ---
const departmentBudgetData = [
  { name: '2028-Mar', Public: 1500, Transport: 1500, Education: 1200, Environment: 1700 },
  { name: '2028-Apr', Public: 1250, Transport: 1250, Education: 1600, Environment: 1450 },
  { name: '2028-May', Public: 1600, Transport: 1600, Education: 1250, Environment: 1200 },
];

const passFailData = [
  { name: 'Education', Pass: 95, Fail: 5 },
  { name: 'Environment', Pass: 98, Fail: 2 },
  { name: 'Public', Pass: 97, Fail: 3 },
  { name: 'Transport', Pass: 96, Fail: 4 },
];

const projectStatusData = [
  { name: 'Education', success: 1, failed: 1, in_progress: 1 },
  { name: 'Environment', success: 3, failed: 0, in_progress: 1 },
  { name: 'Public', success: 6, failed: 1, in_progress: 1 },
  { name: 'Transport', success: 5, failed: 1, in_progress: 1 },
];
const performanceMetrics = [
  { name: 'Jan', value: 85 },
  { name: 'Feb', value: 92 },
  { name: 'Mar', value: 78 },
  { name: 'Apr', value: 96 },
  { name: 'May', value: 89 },
  { name: 'Jun', value: 94 },
];
// --- Shared chart config ---
const baseConfig = { displayModeBar: false, responsive: true };
const baseLayout = {
  margin: { l: 40, r: 10, t: 10, b: 40 },
  plot_bgcolor: 'transparent',
  paper_bgcolor: 'transparent',
  autosize: true,
};

// --- Chart Components (removed fixed height + scroll issues) ---
const DepartmentBudgetChart = () => (
  <Plot
    data={[
      { x: departmentBudgetData.map(d => d.name), y: departmentBudgetData.map(d => d.Public), name: 'Public', type: 'bar', marker: { color: '#3b82f6' } },
      { x: departmentBudgetData.map(d => d.name), y: departmentBudgetData.map(d => d.Transport), name: 'Transport', type: 'bar', marker: { color: '#10b981' } },
      { x: departmentBudgetData.map(d => d.name), y: departmentBudgetData.map(d => d.Education), name: 'Education', type: 'bar', marker: { color: '#f59e0b' } },
      { x: departmentBudgetData.map(d => d.name), y: departmentBudgetData.map(d => d.Environment), name: 'Environment', type: 'bar', marker: { color: '#ef4444' } },
    ]}
    layout={{ ...baseLayout, barmode: 'group', showlegend: true, legend: { font: { size: 10 } } }}
    config={baseConfig}
    style={{ width: '100%', height: '100%' }}
  />
);

const PassFailChart = () => (
  <Plot
    data={[
      { x: passFailData.map(d => d.name), y: passFailData.map(d => d.Pass), name: 'Pass', type: 'bar', marker: { color: '#3b82f6' } },
      { x: passFailData.map(d => d.name), y: passFailData.map(d => d.Fail), name: 'Fail', type: 'bar', marker: { color: '#10b981' } },
    ]}
    layout={{ ...baseLayout, barmode: 'group', showlegend: true, legend: { font: { size: 10 } } }}
    config={baseConfig}
    style={{ width: '100%', height: '100%' }}
  />
);

const ProjectStatusChart = () => (
  <Plot
    data={[
      { x: projectStatusData.map(d => d.name), y: projectStatusData.map(d => d.success), name: 'Success', type: 'bar', marker: { color: '#3b82f6' } },
      { x: projectStatusData.map(d => d.name), y: projectStatusData.map(d => d.failed), name: 'Failed', type: 'bar', marker: { color: '#ef4444' } },
      { x: projectStatusData.map(d => d.name), y: projectStatusData.map(d => d.in_progress), name: 'In Progress', type: 'bar', marker: { color: '#f59e0b' } },
    ]}
    layout={{ ...baseLayout, barmode: 'group', showlegend: true, legend: { font: { size: 10 } } }}
    config={baseConfig}
    style={{ width: '100%', height: '100%' }}
  />
);
const PerformanceChart = () => (
  <Plot
    data={[
      {
        x: performanceMetrics.map(d => d.name),
        y: performanceMetrics.map(d => d.value),
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: '#3b82f6', width: 3 },
        marker: { size: 6, color: '#3b82f6' },
      },
    ]}
    layout={{ ...baseLayout, showlegend: false }}
    config={baseConfig}
    style={{ width: '100%', height: '100%' }}
  />
);
// --- Widgets ---
const widgets = [
  { id: '1', title: 'Data Latency', chart: DepartmentBudgetChart },
  { id: '2', title: 'Data Quality', chart: PassFailChart },
  { id: '3', title: 'Job Status', chart: ProjectStatusChart },
  { id: '4', title: 'Job Performance', chart: PerformanceChart },
];

// --- Main Showcase ---
export const WidgetShowcase = () => {
  const handleViewWidget = (id: string) => console.log(`Viewing widget: ${id}`);
  const navigation = useNavigation();

  const handleBrowseAll = () => {
    navigation.handleNavigation(ROUTES.DATAOPS.INDEX);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Section Header */}
      <div className="flex items-center justify-end mb-8 w-full">
        <Button
          variant="outline"
          className="ml-0 flex items-center gap-2 hover:bg-gray-50"
          onClick={handleBrowseAll}
        >
          Browse All
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((widget) => {
          const Chart = widget.chart;
          return (
            <Card
              key={widget.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-200 bg-white"
              onClick={() => handleViewWidget(widget.id)}
            >
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 text-center">{widget.title}</h3>
                <div className="w-full aspect-[4/3] border border-gray-100 rounded-lg p-2">
                  <Chart />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
