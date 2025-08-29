import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Widget } from '@/types/dataops/dataops-dash';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

/* --------------------------------------------------------------------- */
/*  Types                                                                */
/* --------------------------------------------------------------------- */

export interface WidgetLayout {
  x: number; y: number; w: number; h: number;
}

export interface DashboardLayoutResponse {
  widget_coordinates: {
    x: number;
    y: number;
  };
  widget_size: {
    w: number;
    h: number;
  };
}

export type ChartType =
  | 'bar' | 'line' | 'scatter' | 'pie' | 'area'
  | 'histogram' | 'box' | 'heatmap' | 'treemap' | 'funnel';

export const CHART_TYPE_ORDER: ChartType[] = [
  'bar', 'line', 'scatter', 'pie', 'area',
  'histogram', 'box', 'heatmap', 'treemap', 'funnel',
];

export type ColorScheme =
  | 'default' | 'viridis' | 'plasma' | 'inferno' | 'magma'
  | 'blues' | 'greens' | 'reds' | 'rainbow' | 'sinebow'
  | 'turbo' | 'custom';

export const COLOR_SCHEME_ORDER: ColorScheme[] = [
  'default', 'viridis', 'plasma', 'inferno', 'magma',
  'blues', 'greens', 'reds', 'rainbow', 'sinebow', 'turbo',
];

export type WidgetView = 'chart' | 'table' | 'sql' | 'settings';

export type WidgetState = Omit<Widget, 'id'> & {
  id: string;
  /* UI state ----------------------------------------------------------- */
  isFlipped: boolean;
  isMaximized: boolean;

  /* Presentation ------------------------------------------------------- */
  view: WidgetView;
  chartType: ChartType;
  color: { scheme: ColorScheme; customPalette?: string[] };

  isChartTypePickerOpen: boolean;
  isColorSchemePickerOpen: boolean;

  /* Meta --------------------------------------------------------------- */
  lastRefreshed: number;
  layout: WidgetLayout;
}

export interface DashboardState {
  widgets: Record<string, WidgetState>;
  isGridLocked: boolean;
  layoutMap: Record<string, {layout_id: string; x: number; y: number; w: number; h: number; order_index: string }>;
}

/* --------------------------------------------------------------------- */
/*  Initial state helper                                                 */
/* --------------------------------------------------------------------- */

const now = () => Date.now();

const DEFAULT_WIDGET: Omit<WidgetState, 'id'> = {
  name: 'Untitled Widget',
  owner: '',
  widget_type: '',
  visibility: '',
  sql_query: '',
  executed_query: [],
  plotly_data: null,
  chart_config: { type: 'bar', xAxis: '', yAxis: '', series: [], title: '', metric: '' },
  meta_data: {},
  dashboard_layout: [],
  isFlipped: false,
  isMaximized: false,
  view: 'chart',
  chartType: 'bar',
  color: { scheme: 'default' },
  isChartTypePickerOpen: false,
  isColorSchemePickerOpen: false,
  lastRefreshed: now(),
  // Let RGL auto-place to the lowest open spot:
  layout: { x: 0, y: Number.POSITIVE_INFINITY, w: 4, h: 6 },
};

const initialState: DashboardState = {
  widgets: {},
  isGridLocked: false,
  layoutMap: {},
};

const ensure = (s: DashboardState, id: string) => s.widgets[id];

export const updateDashboardLayout = createAsyncThunk(
  'dashboard/updateDashboardLayout',
  async ({ layoutId, layout }: { layoutId: string; layout: { x: number; y: number; w: number; h: number } }, thunkAPI) => {
    try {
      const response: DashboardLayoutResponse = await apiService.patch({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/dashboard/dashboard_layout/${layoutId}/`,
        usePrefix: true,
        method: 'PATCH',
        data: {
          "widget_coordinates": {
            "x": layout.x,
            "y": layout.y,
          },
          "widget_size": {
            "w": layout.w,
            "h": layout.h
          }
        },
        metadata: {
          errorMessage: 'Failed to update dashboard layout'
        }
      });
      return { layoutId, layout: response };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/* --------------------------------------------------------------------- */
/*  Slice                                                                */
/* --------------------------------------------------------------------- */

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    addWidget: (
      s,
      { payload }: PayloadAction<Partial<Omit<Widget, 'id'>> & { id: string; layout?: WidgetLayout }>,
    ) => {
      const id = payload.id;
      // If a layout is provided (e.g., from dashboard definition), use it; otherwise keep the auto-pack Infinity default
      const incomingLayout = payload.layout ?? DEFAULT_WIDGET.layout;
      s.widgets[id] = { ...DEFAULT_WIDGET, ...payload, id, layout: incomingLayout };
    },
    removeWidget: (s, { payload }: PayloadAction<string>) => {
      delete s.widgets[payload];
      delete s.layoutMap[payload];
    },
    setLayoutMap: (s, { payload }: PayloadAction<Record<string, { layout_id: string; x: number; y: number; w: number; h: number; order_index: string }>>) => {
      s.layoutMap = payload;
    },
    updateLayoutMapEntry: (s, { payload }: PayloadAction<{ widgetId: string; layout: { layout_id: string; x: number; y: number; w: number; h: number; order_index: string } }>) => {
      s.layoutMap[payload.widgetId] = payload.layout;
    },
    removeLayoutMapEntry: (s, { payload }: PayloadAction<string>) => {
      delete s.layoutMap[payload];
    },
    flipWidget: (s, { payload }: PayloadAction<string>) => {
      const w = ensure(s, payload); if (w) w.isFlipped = !w.isFlipped;
    },
    toggleMaximize: (s, { payload }: PayloadAction<string>) => {
      const w = ensure(s, payload); if (w) w.isMaximized = !w.isMaximized;
    },
    refreshWidget: (s, { payload }: PayloadAction<string>) => {
      const w = ensure(s, payload); if (w) w.lastRefreshed = now();
    },
    updateWidgetLayout: (s, { payload }: PayloadAction<{ id: string; layout: WidgetLayout }>) => {
      const w = ensure(s, payload.id); if (w) w.layout = { ...w.layout, ...payload.layout };
    },

    toggleGridLock: (s) => { s.isGridLocked = !s.isGridLocked; },
    setGridLock: (s, { payload }: PayloadAction<boolean>) => { s.isGridLocked = payload; },

    setWidgetView: (s, { payload }: PayloadAction<{ id: string; view: WidgetView }>) => {
      const w = ensure(s, payload.id); if (w) w.view = payload.view;
    },

    setChartType: (s, { payload }: PayloadAction<{ id: string; chartType: ChartType }>) => {
      const w = ensure(s, payload.id); if (w) w.chartType = payload.chartType;
    },

    setColorScheme: (s, { payload }: PayloadAction<{ id: string; scheme: ColorScheme; customPalette?: string[] }>) => {
      const w = ensure(s, payload.id); if (!w) return;
      if (payload.scheme === 'custom') {
        w.color = { scheme: 'custom', customPalette: payload.customPalette ?? [] };
      } else {
        w.color = { scheme: payload.scheme };
      }
    },

    toggleChartTypePicker: (s, { payload }: PayloadAction<string>) => {
      const w = ensure(s, payload);
      if (!w) return;
      w.isChartTypePickerOpen = !w.isChartTypePickerOpen;
      if (w.isChartTypePickerOpen) {
        w.isColorSchemePickerOpen = false;
        w.isFlipped = false;
      }
    },
    toggleColorSchemePicker: (s, { payload }: PayloadAction<string>) => {
      const w = ensure(s, payload);
      if (!w) return;
      w.isColorSchemePickerOpen = !w.isColorSchemePickerOpen;
      if (w.isColorSchemePickerOpen) {
        w.isChartTypePickerOpen = false;
        w.isFlipped = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateDashboardLayout.pending, (state) => {
        // Optional: Add loading state if needed
      })
      .addCase(updateDashboardLayout.fulfilled, (state, action) => {
        // Update the layoutMap with the new layout data
        const { layoutId, layout } = action.payload;
        const widgetId = Object.keys(state.layoutMap).find((key) => state.layoutMap[key].layout_id === layoutId);
        
        if (widgetId && state.layoutMap[widgetId]) {
          const currentLayout = state.layoutMap[widgetId];
          state.layoutMap[widgetId] = {
            ...currentLayout,
            x: layout.widget_coordinates?.x ?? currentLayout.x,
            y: layout.widget_coordinates?.y ?? currentLayout.y,
            w: layout.widget_size?.w ?? currentLayout.w,
            h: layout.widget_size?.h ?? currentLayout.h
          };
        }
      })
      .addCase(updateDashboardLayout.rejected, (state, action) => {
        // Optional: Handle error state
        console.error('Failed to update dashboard layout:', action.payload);
      });
  },
});

export const {
  addWidget,
  removeWidget,
  flipWidget,
  toggleMaximize,
  refreshWidget,
  updateWidgetLayout,
  toggleGridLock,
  setGridLock,
  setWidgetView,
  setChartType,
  setColorScheme,
  toggleChartTypePicker,
  toggleColorSchemePicker,
  setLayoutMap,
  updateLayoutMapEntry,
  removeLayoutMapEntry,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
