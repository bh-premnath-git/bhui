import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigation } from "@/hooks/useNavigation";
import { ChevronRight, MoreHorizontal, BarChart3, Palette } from 'lucide-react';
import Plot from 'react-plotly.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/config/routes';
import { useMemo, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Chart options                                                      */
/* ------------------------------------------------------------------ */
const CHART_TYPES = [
  { id: 'bar', name: 'Bar' },
  { id: 'line', name: 'Line' },
  { id: 'scatter', name: 'Scatter' },
  { id: 'pie', name: 'Pie' },
] as const;
type ChartType = typeof CHART_TYPES[number]['id'];

const COLOR_SCHEMES = [
  { id: 'default', name: 'Default', colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] },
  { id: 'ocean',   name: 'Ocean',   colors: ['#0ea5e9', '#06b6d4', '#0891b2', '#0e7490'] },
  { id: 'forest',  name: 'Forest',  colors: ['#16a34a', '#15803d', '#166534', '#14532d'] },
  { id: 'sunset',  name: 'Sunset',  colors: ['#f97316', '#ea580c', '#dc2626', '#b91c1c'] },
  { id: 'purple',  name: 'Purple',  colors: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'] },
] as const;
type ColorSchemeId = typeof COLOR_SCHEMES[number]['id'];

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const departmentBudgetData = [
  { name: '2028-Mar', Public: 1500, Transport: 1500, Education: 1200, Environment: 1700 },
  { name: '2028-Apr', Public: 1250, Transport: 1250, Education: 1600, Environment: 1450 },
  { name: '2028-May', Public: 1600, Transport: 1600, Education: 1250, Environment: 1200 },
];

const passFailData = [
  { name: 'Education',  Pass: 95, Fail: 5 },
  { name: 'Environment', Pass: 98, Fail: 2 },
  { name: 'Public',      Pass: 97, Fail: 3 },
  { name: 'Transport',   Pass: 96, Fail: 4 },
];

const projectStatusData = [
  { name: 'Education',  success: 1, failed: 1, in_progress: 1 },
  { name: 'Environment', success: 3, failed: 0, in_progress: 1 },
  { name: 'Public',      success: 6, failed: 1, in_progress: 1 },
  { name: 'Transport',   success: 5, failed: 1, in_progress: 1 },
];

/* ------------------------------------------------------------------ */
/*  Plotly base config                                                 */
/* ------------------------------------------------------------------ */
const baseConfig = { displayModeBar: false };

// Separate layouts for pie vs other chart types
const getBaseLayout = (isPie: boolean = false) => ({
  margin: isPie 
    ? { l: 20, r: 80, t: 20, b: 20 } // More right margin for pie legend
    : { l: 50, r: 20, t: 30, b: 90 }, // Increased bottom margin for more space below x-axis
  plot_bgcolor: 'transparent',
  paper_bgcolor: 'transparent',
  autosize: true,
  showlegend: true,
  legend: isPie 
    ? { 
        font: { size: 10 }, 
        x: 1.02, 
        y: 0.5,
        xanchor: 'left' as const,
        yanchor: 'middle' as const
      }
    : { 
        font: { size: 9 }, 
        x: 0.5, 
        y: -0.28, // Move legend further down below the plot area
        xanchor: 'center' as const,
        yanchor: 'top' as const,
        orientation: 'h' as const
      },
  xaxis: isPie ? undefined : {
    tickangle: -45,
    tickfont: { size: 10 }
  },
  yaxis: isPie ? undefined : {
    tickfont: { size: 10 }
  }
});

/* ------------------------------------------------------------------ */
/*  Chart renderers (accept type + colors)                             */
/* ------------------------------------------------------------------ */
function DepartmentBudgetChart({ type, colors }: { type: ChartType; colors: readonly string[] }) {
  const x = departmentBudgetData.map(d => d.name);
  const layout = getBaseLayout(type === 'pie');
  
  if (type === 'pie') {
    const total = departmentBudgetData.reduce(
      (a, c) => ({
        Public: a.Public + c.Public,
        Transport: a.Transport + c.Transport,
        Education: a.Education + c.Education,
        Environment: a.Environment + c.Environment,
      }),
      { Public: 0, Transport: 0, Education: 0, Environment: 0 },
    );
    return (
      <Plot
        useResizeHandler
        data={[{
          values: [total.Public, total.Transport, total.Education, total.Environment],
          labels: ['Public', 'Transport', 'Education', 'Environment'],
          type: 'pie',
          marker: { colors: [...colors] },
          textinfo: 'label+percent',
          textfont: { size: 10 },
          hovertemplate: '%{label}<br>%{value}<br>%{percent}<extra></extra>'
        }]}
        layout={layout}
        config={baseConfig}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }

  let plotData: any[];
  
  if (type === 'line') {
    plotData = [
      { x, y: departmentBudgetData.map(d => d.Public), name: 'Public', type: 'scatter', mode: 'lines+markers', marker: { color: colors[0], size: 6 }, line: { width: 2 } },
      { x, y: departmentBudgetData.map(d => d.Transport), name: 'Transport', type: 'scatter', mode: 'lines+markers', marker: { color: colors[1], size: 6 }, line: { width: 2 } },
      { x, y: departmentBudgetData.map(d => d.Education), name: 'Education', type: 'scatter', mode: 'lines+markers', marker: { color: colors[2], size: 6 }, line: { width: 2 } },
      { x, y: departmentBudgetData.map(d => d.Environment), name: 'Environment', type: 'scatter', mode: 'lines+markers', marker: { color: colors[3], size: 6 }, line: { width: 2 } },
    ];
  } else if (type === 'scatter') {
    plotData = [
      { x, y: departmentBudgetData.map(d => d.Public), name: 'Public', type: 'scatter', mode: 'markers', marker: { color: colors[0], size: 8 } },
      { x, y: departmentBudgetData.map(d => d.Transport), name: 'Transport', type: 'scatter', mode: 'markers', marker: { color: colors[1], size: 8 } },
      { x, y: departmentBudgetData.map(d => d.Education), name: 'Education', type: 'scatter', mode: 'markers', marker: { color: colors[2], size: 8 } },
      { x, y: departmentBudgetData.map(d => d.Environment), name: 'Environment', type: 'scatter', mode: 'markers', marker: { color: colors[3], size: 8 } },
    ];
  } else {
    plotData = [
      { x, y: departmentBudgetData.map(d => d.Public), name: 'Public', type: 'bar', marker: { color: colors[0] } },
      { x, y: departmentBudgetData.map(d => d.Transport), name: 'Transport', type: 'bar', marker: { color: colors[1] } },
      { x, y: departmentBudgetData.map(d => d.Education), name: 'Education', type: 'bar', marker: { color: colors[2] } },
      { x, y: departmentBudgetData.map(d => d.Environment), name: 'Environment', type: 'bar', marker: { color: colors[3] } },
    ];
  }

  return (
    <Plot
      useResizeHandler
      data={plotData}
      layout={{
        ...layout,
        barmode: type === 'bar' ? 'group' : undefined,
      }}
      config={baseConfig}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

function PassFailChart({ type, colors }: { type: ChartType; colors: readonly string[] }) {
  const x = passFailData.map(d => d.name);
  const layout = getBaseLayout(type === 'pie');
  
  if (type === 'pie') {
    const total = passFailData.reduce((a, c) => ({ Pass: a.Pass + c.Pass, Fail: a.Fail + c.Fail }), { Pass: 0, Fail: 0 });
    return (
      <Plot
        useResizeHandler
        data={[{ 
          values: [total.Pass, total.Fail], 
          labels: ['Pass', 'Fail'], 
          type: 'pie', 
          marker: { colors: [...colors] },
          textinfo: 'label+percent',
          textfont: { size: 10 },
          hovertemplate: '%{label}<br>%{value}<br>%{percent}<extra></extra>'
        }]}
        layout={layout}
        config={baseConfig}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }

  let plotData: any[];
  
  if (type === 'line') {
    plotData = [
      { x, y: passFailData.map(d => d.Pass), name: 'Pass', type: 'scatter', mode: 'lines+markers', marker: { color: colors[0], size: 6 }, line: { width: 2 } },
      { x, y: passFailData.map(d => d.Fail), name: 'Fail', type: 'scatter', mode: 'lines+markers', marker: { color: colors[1], size: 6 }, line: { width: 2 } },
    ];
  } else if (type === 'scatter') {
    plotData = [
      { x, y: passFailData.map(d => d.Pass), name: 'Pass', type: 'scatter', mode: 'markers', marker: { color: colors[0], size: 8 } },
      { x, y: passFailData.map(d => d.Fail), name: 'Fail', type: 'scatter', mode: 'markers', marker: { color: colors[1], size: 8 } },
    ];
  } else {
    plotData = [
      { x, y: passFailData.map(d => d.Pass), name: 'Pass', type: 'bar', marker: { color: colors[0] } },
      { x, y: passFailData.map(d => d.Fail), name: 'Fail', type: 'bar', marker: { color: colors[1] } },
    ];
  }

  return (
    <Plot
      useResizeHandler
      data={plotData}
      layout={{
        ...layout,
        barmode: type === 'bar' ? 'group' : undefined,
      }}
      config={baseConfig}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

function ProjectStatusChart({ type, colors }: { type: ChartType; colors: readonly string[] }) {
  const x = projectStatusData.map(d => d.name);
  const layout = getBaseLayout(type === 'pie');
  
  if (type === 'pie') {
    const total = projectStatusData.reduce(
      (a, c) => ({ success: a.success + c.success, failed: a.failed + c.failed, in_progress: a.in_progress + c.in_progress }),
      { success: 0, failed: 0, in_progress: 0 }
    );
    return (
      <Plot
        useResizeHandler
        data={[{ 
          values: [total.success, total.failed, total.in_progress], 
          labels: ['Success', 'Failed', 'In Progress'], 
          type: 'pie', 
          marker: { colors: [...colors] },
          textinfo: 'label+percent',
          textfont: { size: 10 },
          hovertemplate: '%{label}<br>%{value}<br>%{percent}<extra></extra>'
        }]}
        layout={layout}
        config={baseConfig}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }

  let plotData: any[];
  
  if (type === 'line') {
    plotData = [
      { x, y: projectStatusData.map(d => d.success), name: 'Success', type: 'scatter', mode: 'lines+markers', marker: { color: colors[0], size: 6 }, line: { width: 2 } },
      { x, y: projectStatusData.map(d => d.failed), name: 'Failed', type: 'scatter', mode: 'lines+markers', marker: { color: colors[1], size: 6 }, line: { width: 2 } },
      { x, y: projectStatusData.map(d => d.in_progress), name: 'In Progress', type: 'scatter', mode: 'lines+markers', marker: { color: colors[2], size: 6 }, line: { width: 2 } },
    ];
  } else if (type === 'scatter') {
    plotData = [
      { x, y: projectStatusData.map(d => d.success), name: 'Success', type: 'scatter', mode: 'markers', marker: { color: colors[0], size: 8 } },
      { x, y: projectStatusData.map(d => d.failed), name: 'Failed', type: 'scatter', mode: 'markers', marker: { color: colors[1], size: 8 } },
      { x, y: projectStatusData.map(d => d.in_progress), name: 'In Progress', type: 'scatter', mode: 'markers', marker: { color: colors[2], size: 8 } },
    ];
  } else {
    plotData = [
      { x, y: projectStatusData.map(d => d.success), name: 'Success', type: 'bar', marker: { color: colors[0] } },
      { x, y: projectStatusData.map(d => d.failed), name: 'Failed', type: 'bar', marker: { color: colors[1] } },
      { x, y: projectStatusData.map(d => d.in_progress), name: 'In Progress', type: 'bar', marker: { color: colors[2] } },
    ];
  }

  return (
    <Plot
      useResizeHandler
      data={plotData}
      layout={{
        ...layout,
        barmode: type === 'bar' ? 'group' : undefined,
      }}
      config={baseConfig}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Widget list                                                        */
/* ------------------------------------------------------------------ */
const widgets = [
  { id: '1', title: 'Data Latency', chart: DepartmentBudgetChart },
  { id: '2', title: 'Data Quality', chart: PassFailChart },
  { id: '3', title: 'Job Status',   chart: ProjectStatusChart },
] as const;

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export const WidgetShowcase = () => {
  const navigation = useNavigation();

  // per-widget UI state: chartType + colorScheme
  const [stateById, setStateById] = useState<Record<string, { type: ChartType; scheme: ColorSchemeId }>>(() =>
    widgets.reduce((acc, w) => ({ ...acc, [w.id]: { type: 'bar', scheme: 'default' } }), {})
  );

  const handleBrowseAll = () => navigation.handleNavigation(ROUTES.DATAOPS.INDEX);
  const handleViewWidget = (id: string) => console.log(`Viewing widget: ${id}`);

  return (
    <div className="w-full mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-end mb-4 w-full">
        <Button
          variant="outline"
          className="ml-0 flex items-center gap-2 hover:bg-gray-50"
          onClick={handleBrowseAll}
        >
          Browse All
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((w) => {
          const ChartComp = w.chart;
          const ui = stateById[w.id];
          const scheme = COLOR_SCHEMES.find(s => s.id === ui.scheme) ?? COLOR_SCHEMES[0];
          const colors = useMemo(() => scheme.colors, [scheme]);

          return (
            <Card
              key={w.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-200 bg-white"
              onClick={() => handleViewWidget(w.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{w.title}</h3>

                  {/* Three dots menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted hover:text-foreground"
                        onClick={(e) => e.stopPropagation()} // don't trigger card click
                        title="Options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      {/* Chart type submenu */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Chart Type
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuRadioGroup
                            value={ui.type}
                            onValueChange={(val) =>
                              setStateById((prev) => ({ ...prev, [w.id]: { ...prev[w.id], type: val as ChartType } }))
                            }
                          >
                            {CHART_TYPES.map((t) => (
                              <DropdownMenuRadioItem key={t.id} value={t.id}>
                                {t.name}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      {/* Color scheme submenu */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Color Scheme
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="min-w-[220px]">
                          <DropdownMenuRadioGroup
                            value={ui.scheme}
                            onValueChange={(val) =>
                              setStateById((prev) => ({ ...prev, [w.id]: { ...prev[w.id], scheme: val as ColorSchemeId } }))
                            }
                          >
                            {COLOR_SCHEMES.map((s) => (
                              <DropdownMenuRadioItem key={s.id} value={s.id} className="flex items-center gap-2">
                                <span className="flex gap-1">
                                  {s.colors.map((c, i) => (
                                    <span
                                      key={i}
                                      className="w-3.5 h-3.5 rounded-full border border-gray-300"
                                      style={{ backgroundColor: c }}
                                    />
                                  ))}
                                </span>
                                <span className="ml-1">{s.name}</span>
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Chart container with proper height for legend positioning */}
                <div className="w-full h-80 border border-gray-100 rounded-lg overflow-hidden">
                  <ChartComp type={ui.type} colors={colors} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};