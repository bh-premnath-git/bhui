import React, { useMemo, useRef, useState, memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ChevronRight, MoreHorizontal, BarChart3, Palette, Maximize2, Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ROUTES } from '@/config/routes'
import { useNavigation } from '@/hooks/useNavigation'

// ---- Plotly: modular build (tree-shakable) ---------------------------
import createPlotlyComponent from 'react-plotly.js/factory'
import PlotlyCore from 'plotly.js/lib/core'
import bar from 'plotly.js/lib/bar'
import scatter from 'plotly.js/lib/scatter'
import pie from 'plotly.js/lib/pie'
import * as Plotly from 'plotly.js/lib/core'
import type { PlotlyHTMLElement } from 'plotly.js'
// Register only the traces we use
PlotlyCore.register([bar, scatter, pie])
const Plot = createPlotlyComponent(PlotlyCore)
// ---------------------------------------------------------------------

// Chart options
const CHART_TYPES = [
  { id: 'bar', name: 'Bar' },
  { id: 'line', name: 'Line' },
  { id: 'scatter', name: 'Scatter' },
  { id: 'pie', name: 'Pie' },
] as const
export type ChartType = typeof CHART_TYPES[number]['id']

const COLOR_SCHEMES = [
  { id: 'default', name: 'Default', colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] },
  { id: 'ocean', name: 'Ocean', colors: ['#0ea5e9', '#06b6d4', '#0891b2', '#0e7490'] },
  { id: 'forest', name: 'Forest', colors: ['#16a34a', '#15803d', '#166534', '#14532d'] },
  { id: 'sunset', name: 'Sunset', colors: ['#f97316', '#ea580c', '#dc2626', '#b91c1c'] },
  { id: 'purple', name: 'Purple', colors: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'] },
] as const
export type ColorSchemeId = typeof COLOR_SCHEMES[number]['id']

// Sample data (kept as-is)
const departmentBudgetData = [
  { name: '2028-Mar', Public: 1500, Transport: 1500, Education: 1200, Environment: 1700 },
  { name: '2028-Apr', Public: 1250, Transport: 1250, Education: 1600, Environment: 1450 },
  { name: '2028-May', Public: 1600, Transport: 1600, Education: 1250, Environment: 1200 },
]

const passFailData = [
  { name: 'Education', Pass: 95, Fail: 5 },
  { name: 'Environment', Pass: 98, Fail: 2 },
  { name: 'Public', Pass: 97, Fail: 3 },
  { name: 'Transport', Pass: 96, Fail: 4 },
]

const projectStatusData = [
  { name: 'Education', success: 1, failed: 1, in_progress: 1 },
  { name: 'Environment', success: 3, failed: 0, in_progress: 1 },
  { name: 'Public', success: 6, failed: 1, in_progress: 1 },
  { name: 'Transport', success: 5, failed: 1, in_progress: 1 },
]

// Helpers -----------------------------------------------------------------
const baseConfig: Partial<Plotly.Config> = { displayModeBar: false, responsive: true }

const getBaseLayout = (isPie = false) => {
  // Theme-aware colors via CSS variables used by shadcn/tailwind
  const axisColor = 'hsl(var(--muted-foreground))'
  const gridColor = 'hsl(var(--border))'
  return {
    margin: isPie ? { l: 20, r: 80, t: 20, b: 20 } : { l: 45, r: 15, t: 25, b: 45 },
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    autosize: true,
    showlegend: true,
    legend: isPie
      ? { font: { size: 10 }, x: 1.02, y: 0.5, xanchor: 'left' as const, yanchor: 'middle' as const }
      : { font: { size: 10 }, x: 0.5, y: -0.15, xanchor: 'center' as const, yanchor: 'top' as const, orientation: 'h' as const },
    xaxis: isPie
      ? undefined
      : {
          tickangle: -45,
          tickfont: { size: 10, color: axisColor },
          automargin: true,
          tickmode: 'linear' as const,
          gridcolor: gridColor,
          zerolinecolor: gridColor,
        },
    yaxis: isPie
      ? undefined
      : { tickfont: { size: 10, color: axisColor }, automargin: true, gridcolor: gridColor, zerolinecolor: gridColor },
  } satisfies Partial<Plotly.Layout>
}

// Generic plot wrapper to capture graphDiv for exports ---------------------
interface PlotWrapperProps {
  data: Partial<Plotly.PlotData>[]
  layout: Partial<Plotly.Layout>
  onGraphDivReady?: (div: PlotlyHTMLElement) => void
}

const PlotWrapper: React.FC<PlotWrapperProps> = ({ data, layout, onGraphDivReady }) => {
  const graphDivRef = useRef<PlotlyHTMLElement | null>(null)
  return (
    <Plot
      useResizeHandler
      data={data as any[]}
      layout={layout}
      config={baseConfig}
      style={{ width: '100%', height: '100%' }}
      onInitialized={(_, gd) => {
        graphDivRef.current = gd as PlotlyHTMLElement
        onGraphDivReady?.(gd as PlotlyHTMLElement)
      }}
      onUpdate={(fig, gd) => {
        graphDivRef.current = gd as PlotlyHTMLElement
        onGraphDivReady?.(gd as PlotlyHTMLElement)
      }}
    />
  )
}

// Charts -------------------------------------------------------------------
interface ChartProps {
  type: ChartType
  colors: readonly string[]
  onGraphDivReady?: (div: PlotlyHTMLElement) => void
}

const DepartmentBudgetChart = memo(({ type, colors, onGraphDivReady }: ChartProps) => {
  const x = useMemo(() => departmentBudgetData.map((d) => d.name), [])
  const layout = useMemo(() => getBaseLayout(type === 'pie'), [type])

  if (type === 'pie') {
    const total = useMemo(
      () =>
        departmentBudgetData.reduce(
          (a, c) => ({
            Public: a.Public + c.Public,
            Transport: a.Transport + c.Transport,
            Education: a.Education + c.Education,
            Environment: a.Environment + c.Environment,
          }),
          { Public: 0, Transport: 0, Education: 0, Environment: 0 },
        ),
      [],
    )

    const data: Partial<Plotly.PlotData>[] = [
      {
        values: [total.Public, total.Transport, total.Education, total.Environment],
        labels: ['Public', 'Transport', 'Education', 'Environment'],
        type: 'pie',
        marker: { colors: [...colors] },
        textinfo: 'label+percent',
        textfont: { size: 10 },
        hovertemplate: '%{label}<br>%{value}<br>%{percent}<extra></extra>',
      },
    ]

    return <PlotWrapper data={data} layout={layout} onGraphDivReady={onGraphDivReady} />
  }

  const plotData: Partial<Plotly.PlotData>[] = useMemo(() => {
    if (type === 'line')
      return [
        {
          x,
          y: departmentBudgetData.map((d) => d.Public),
          name: 'Public',
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: colors[0], size: 6 },
          line: { width: 2 },
        },
        {
          x,
          y: departmentBudgetData.map((d) => d.Transport),
          name: 'Transport',
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: colors[1], size: 6 },
          line: { width: 2 },
        },
        {
          x,
          y: departmentBudgetData.map((d) => d.Education),
          name: 'Education',
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: colors[2], size: 6 },
          line: { width: 2 },
        },
        {
          x,
          y: departmentBudgetData.map((d) => d.Environment),
          name: 'Environment',
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: colors[3], size: 6 },
          line: { width: 2 },
        },
      ]

    if (type === 'scatter')
      return [
        { x, y: departmentBudgetData.map((d) => d.Public), name: 'Public', type: 'scatter', mode: 'markers', marker: { color: colors[0], size: 8 } },
        { x, y: departmentBudgetData.map((d) => d.Transport), name: 'Transport', type: 'scatter', mode: 'markers', marker: { color: colors[1], size: 8 } },
        { x, y: departmentBudgetData.map((d) => d.Education), name: 'Education', type: 'scatter', mode: 'markers', marker: { color: colors[2], size: 8 } },
        { x, y: departmentBudgetData.map((d) => d.Environment), name: 'Environment', type: 'scatter', mode: 'markers', marker: { color: colors[3], size: 8 } },
      ]

    // default bar
    return [
      { x, y: departmentBudgetData.map((d) => d.Public), name: 'Public', type: 'bar', marker: { color: colors[0] } },
      { x, y: departmentBudgetData.map((d) => d.Transport), name: 'Transport', type: 'bar', marker: { color: colors[1] } },
      { x, y: departmentBudgetData.map((d) => d.Education), name: 'Education', type: 'bar', marker: { color: colors[2] } },
      { x, y: departmentBudgetData.map((d) => d.Environment), name: 'Environment', type: 'bar', marker: { color: colors[3] } },
    ]
  }, [type, colors, x])

  const barMode = type === 'bar' ? { barmode: 'group' as const } : {}
  return <PlotWrapper data={plotData} layout={{ ...layout, ...barMode }} onGraphDivReady={onGraphDivReady} />
})

const PassFailChart = memo(({ type, colors, onGraphDivReady }: ChartProps) => {
  const x = useMemo(() => passFailData.map((d) => d.name), [])
  const layout = useMemo(() => getBaseLayout(type === 'pie'), [type])

  if (type === 'pie') {
    const total = useMemo(() => passFailData.reduce((a, c) => ({ Pass: a.Pass + c.Pass, Fail: a.Fail + c.Fail }), { Pass: 0, Fail: 0 }), [])
    const data: Partial<Plotly.PlotData>[] = [
      {
        values: [total.Pass, total.Fail],
        labels: ['Pass', 'Fail'],
        type: 'pie',
        marker: { colors: [...colors] },
        textinfo: 'label+percent',
        textfont: { size: 10 },
        hovertemplate: '%{label}<br>%{value}<br>%{percent}<extra></extra>',
      },
    ]
    return <PlotWrapper data={data} layout={layout} onGraphDivReady={onGraphDivReady} />
  }

  const plotData: Partial<Plotly.PlotData>[] = useMemo(() => {
    if (type === 'line')
      return [
        { x, y: passFailData.map((d) => d.Pass), name: 'Pass', type: 'scatter', mode: 'lines+markers', marker: { color: colors[0], size: 6 }, line: { width: 2 } },
        { x, y: passFailData.map((d) => d.Fail), name: 'Fail', type: 'scatter', mode: 'lines+markers', marker: { color: colors[1], size: 6 }, line: { width: 2 } },
      ]
    if (type === 'scatter')
      return [
        { x, y: passFailData.map((d) => d.Pass), name: 'Pass', type: 'scatter', mode: 'markers', marker: { color: colors[0], size: 8 } },
        { x, y: passFailData.map((d) => d.Fail), name: 'Fail', type: 'scatter', mode: 'markers', marker: { color: colors[1], size: 8 } },
      ]
    return [
        { x, y: passFailData.map((d) => d.Pass), name: 'Pass', type: 'bar', marker: { color: colors[0] } },
        { x, y: passFailData.map((d) => d.Fail), name: 'Fail', type: 'bar', marker: { color: colors[1] } },
      ]
  }, [type, colors, x])

  const barMode = type === 'bar' ? { barmode: 'group' as const } : {}
  return <PlotWrapper data={plotData} layout={{ ...layout, ...barMode }} onGraphDivReady={onGraphDivReady} />
})

const ProjectStatusChart = memo(({ type, colors, onGraphDivReady }: ChartProps) => {
  const x = useMemo(() => projectStatusData.map((d) => d.name), [])
  const layout = useMemo(() => getBaseLayout(type === 'pie'), [type])

  if (type === 'pie') {
    const total = useMemo(
      () =>
        projectStatusData.reduce(
          (a, c) => ({ success: a.success + c.success, failed: a.failed + c.failed, in_progress: a.in_progress + c.in_progress }),
          { success: 0, failed: 0, in_progress: 0 },
        ),
      [],
    )
    const data: Partial<Plotly.PlotData>[] = [
      {
        values: [total.success, total.failed, total.in_progress],
        labels: ['Success', 'Failed', 'In Progress'],
        type: 'pie',
        marker: { colors: [...colors] },
        textinfo: 'label+percent',
        textfont: { size: 10 },
        hovertemplate: '%{label}<br>%{value}<br>%{percent}<extra></extra>',
      },
    ]
    return <PlotWrapper data={data} layout={layout} onGraphDivReady={onGraphDivReady} />
  }

  const plotData: Partial<Plotly.PlotData>[] = useMemo(() => {
    if (type === 'line')
      return [
        { x, y: projectStatusData.map((d) => d.success), name: 'Success', type: 'scatter', mode: 'lines+markers', marker: { color: colors[0], size: 6 }, line: { width: 2 } },
        { x, y: projectStatusData.map((d) => d.failed), name: 'Failed', type: 'scatter', mode: 'lines+markers', marker: { color: colors[1], size: 6 }, line: { width: 2 } },
        { x, y: projectStatusData.map((d) => d.in_progress), name: 'In Progress', type: 'scatter', mode: 'lines+markers', marker: { color: colors[2], size: 6 }, line: { width: 2 } },
      ]
    if (type === 'scatter')
      return [
        { x, y: projectStatusData.map((d) => d.success), name: 'Success', type: 'scatter', mode: 'markers', marker: { color: colors[0], size: 8 } },
        { x, y: projectStatusData.map((d) => d.failed), name: 'Failed', type: 'scatter', mode: 'markers', marker: { color: colors[1], size: 8 } },
        { x, y: projectStatusData.map((d) => d.in_progress), name: 'In Progress', type: 'scatter', mode: 'markers', marker: { color: colors[2], size: 8 } },
      ]
    return [
      { x, y: projectStatusData.map((d) => d.success), name: 'Success', type: 'bar', marker: { color: colors[0] } },
      { x, y: projectStatusData.map((d) => d.failed), name: 'Failed', type: 'bar', marker: { color: colors[1] } },
      { x, y: projectStatusData.map((d) => d.in_progress), name: 'In Progress', type: 'bar', marker: { color: colors[2] } },
    ]
  }, [type, colors, x])

  const barMode = type === 'bar' ? { barmode: 'group' as const } : {}
  return <PlotWrapper data={plotData} layout={{ ...layout, ...barMode }} onGraphDivReady={onGraphDivReady} />
})

// Widget list --------------------------------------------------------------
const widgets = [
  { id: '1', title: 'Data Latency', chart: DepartmentBudgetChart },
  { id: '2', title: 'Data Quality', chart: PassFailChart },
  { id: '3', title: 'Job Status', chart: ProjectStatusChart },
] as const

// Reusable Chart Card ------------------------------------------------------
interface ChartCardProps {
  id: string
  title: string
  ChartComp: React.ComponentType<ChartProps>
  state: { type: ChartType; scheme: ColorSchemeId }
  setState: (fn: (prev: Record<string, { type: ChartType; scheme: ColorSchemeId }>) => Record<string, { type: ChartType; scheme: ColorSchemeId }>) => void
}

const ChartCard: React.FC<ChartCardProps> = ({ id, title, ChartComp, state, setState }) => {
  const scheme = COLOR_SCHEMES.find((s) => s.id === state.scheme) ?? COLOR_SCHEMES[0]
  const colors = scheme.colors as readonly string[]

  const [expanded, setExpanded] = useState(false)
  const [graphDiv, setGraphDiv] = useState<PlotlyHTMLElement | null>(null)

  const handleDownload = useCallback(async () => {
    if (!graphDiv) return
    try {
      await PlotlyCore.downloadImage(graphDiv, { 
        format: 'png', 
        filename: title.replace(/\s+/g, '-').toLowerCase(), 
        width: 2800, 
        height: 1800 
      })
    } catch (e) {
      console.error('Download failed', e)
    }
  }, [graphDiv, title])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
      <Card className="h-full min-h-0 bg-card/90 backdrop-blur border-border rounded-2xl shadow-sm">
        <CardHeader className="p-3 pb-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" aria-hidden />
              <h3 className="text-sm font-semibold text-foreground leading-none">{title}</h3>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Export PNG" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Expand" onClick={() => setExpanded(true)}>
                <Maximize2 className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Options">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur border-border">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Chart Type
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-background/95 backdrop-blur border-border">
                      <DropdownMenuRadioGroup
                        value={state.type}
                        onValueChange={(val) => setState((prev) => ({ ...prev, [id]: { ...prev[id], type: val as ChartType } }))}
                      >
                        {CHART_TYPES.map((t) => (
                          <DropdownMenuRadioItem key={t.id} value={t.id}>
                            {t.name}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Color Scheme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[240px] bg-background/95 backdrop-blur border-border">
                      <DropdownMenuRadioGroup
                        value={state.scheme}
                        onValueChange={(val) => setState((prev) => ({ ...prev, [id]: { ...prev[id], scheme: val as ColorSchemeId } }))}
                      >
                        {COLOR_SCHEMES.map((s) => (
                          <DropdownMenuRadioItem key={s.id} value={s.id} className="flex items-center gap-2">
                            <span className="flex gap-1">
                              {s.colors.map((c, i) => (
                                <span key={i} className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: c }} />
                              ))}
                            </span>
                            <span className="ml-1 text-sm">{s.name}</span>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 min-h-0">
          <div className="w-full h-[360px] md:h-[380px] lg:h-[400px] min-h-0 border border-border/60 rounded-xl overflow-hidden">
            <ChartComp type={state.type} colors={colors} onGraphDivReady={setGraphDiv} />
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen dialog */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-[95vw] w-[1200px] h-[80vh] p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle className="text-base">{title}</DialogTitle>
            <DialogDescription className="text-xs">Expanded view</DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-4 h-[calc(80vh-72px)]">
            <div className="w-full h-full border border-border/60 rounded-xl overflow-hidden">
              <ChartComp type={state.type} colors={colors} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// Main component -----------------------------------------------------------
export const ChatDashboard: React.FC = () => {
  const navigation = useNavigation()

  const [stateById, setStateById] = useState<Record<string, { type: ChartType; scheme: ColorSchemeId }>>(
    () => widgets.reduce((acc, w) => ({ ...acc, [w.id]: { type: 'bar', scheme: 'default' } }), {} as Record<string, { type: ChartType; scheme: ColorSchemeId }>),
  )

  const handleBrowseAll = () => navigation.handleNavigation(ROUTES.DATAOPS.INDEX)

  return (
    <div className="w-full min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-end mb-2 px-4 pt-2">
        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleBrowseAll}>
          Browse All <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0 px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr min-h-0">
          {widgets.map((w) => (
            <ChartCard key={w.id} id={w.id} title={w.title} ChartComp={w.chart} state={stateById[w.id]} setState={setStateById} />
          ))}
        </div>
      </div>
    </div>
  )
}

export const FeatureShowcase = ChatDashboard