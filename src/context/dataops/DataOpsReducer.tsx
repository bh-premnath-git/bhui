import { DataOpsState } from "./DataOpsContext";

// Initial state
export const initialState: DataOpsState = {
  dashboards: [],
  selectedDashboard: null,
  widgets: [],
  isLoading: false,
  error: null,
  filters: {
    projectName: null,
    timeRange: null,
  }
};

// Helper function to find the next available position in the grid
const findNextAvailablePosition = (layouts = [], cols = 12, defaultSize = { w: 6, h: 4 }) => {
  if (!layouts || layouts.length === 0) {
    return { x: 0, y: 0 }; // First widget goes at the top left
  }

  // Create a grid representation to track occupied spaces
  const grid = [];
  const maxY = Math.max(...layouts.map(layout => 
    (layout.widget_coordinates?.y || 0) + (layout.widget_size?.h || defaultSize.h)
  ), 0);
  
  // Initialize grid with enough rows
  for (let y = 0; y <= maxY + defaultSize.h; y++) {
    grid[y] = new Array(cols).fill(false);
  }
  
  // Mark occupied cells in the grid
  layouts.forEach(layout => {
    const x = layout.widget_coordinates?.x || 0;
    const y = layout.widget_coordinates?.y || 0;
    const w = layout.widget_size?.w || defaultSize.w;
    const h = layout.widget_size?.h || defaultSize.h;
    
    for (let i = y; i < y + h; i++) {
      for (let j = x; j < x + w; j++) {
        if (i < grid.length && j < cols) {
          grid[i][j] = true; // Mark as occupied
        }
      }
    }
  });
  
  // Find the first available position that can fit the widget
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x <= cols - defaultSize.w; x++) {
      let canFit = true;
      
      // Check if the entire widget can fit at this position
      for (let i = 0; i < defaultSize.h; i++) {
        for (let j = 0; j < defaultSize.w; j++) {
          if (y + i >= grid.length || grid[y + i][x + j]) {
            canFit = false;
            break;
          }
        }
        if (!canFit) break;
      }
      
      if (canFit) {
        return { x, y };
      }
    }
  }
  
  // Fallback: Place below all existing widgets
  return { x: 0, y: maxY + 1 };
};

// Reducer function
export const dataOpsReducer = (state: DataOpsState, action: any): DataOpsState => {
  switch (action.type) {
    case "SET_DASHBOARDS":
      return {
        ...state,
        dashboards: action.payload,
        selectedDashboard: action.payload.length > 0 ? action.payload[0] : null
      };

    case "SET_SELECTED_DASHBOARD":
      return {
        ...state,
        selectedDashboard: action.payload
      };
    case "ADD_WIDGET":
      const updatedWidgets = [...state.widgets, action.payload];
      let updatedDashboards = [...state.dashboards];
      let updatedSelectedDashboard = state.selectedDashboard;
      
      if (state.selectedDashboard) {
        // Find optimal position for the new widget
        const defaultSize = { w: 6, h: 4 };
        const nextPosition = findNextAvailablePosition(
          state.selectedDashboard.dashboard_layout,
          12, // Total columns
          defaultSize
        );

        const newLayoutEntry = {
          // Add required properties to match DashboardLayout interface
          layout_id: Date.now(), // Generate a temporary ID (will be replaced by backend)
          dashboard_id: state.selectedDashboard.dashboard_id,
          widget_id: action.payload.id,
          order_index: (state.widgets.length + 1).toString(),
          widget_coordinates: nextPosition,
          widget_size: defaultSize,
          widget_type: action.payload.widget_type,
          visibility: action.payload.visibility || 'private'
        };
        updatedDashboards = state.dashboards.map(dashboard => {
          if (dashboard.dashboard_id === state.selectedDashboard?.dashboard_id) {
            const updatedDashboard = {
              ...dashboard,
              dashboard_layout: [...(dashboard.dashboard_layout || []), newLayoutEntry]
            };
            updatedSelectedDashboard = updatedDashboard;
            return updatedDashboard;
          }
          return dashboard;
        });
      }
      
      return {
        ...state,
        widgets: updatedWidgets,
        dashboards: updatedDashboards,
        selectedDashboard: updatedSelectedDashboard
      };
    
    case "REMOVE_WIDGET":
      const widgetIdToRemove = action.payload.toString();
      const filteredWidgets = state.widgets.filter(
        widget => widget.id?.toString() !== widgetIdToRemove
      );
      
      let dashboardsAfterRemoval = [...state.dashboards];
      let selectedDashboardAfterRemoval = state.selectedDashboard;
      
      // Remove the widget layout entry from dashboard layout
      if (state.selectedDashboard) {
        dashboardsAfterRemoval = state.dashboards.map(dashboard => {
          if (dashboard.dashboard_id === state.selectedDashboard?.dashboard_id) {
            const filteredLayout = dashboard.dashboard_layout.filter(
              layout => layout.widget_id?.toString() !== widgetIdToRemove
            );
            
            const updatedDashboard = {
              ...dashboard,
              dashboard_layout: filteredLayout
            };
            selectedDashboardAfterRemoval = updatedDashboard;
            return updatedDashboard;
          }
          return dashboard;
        });
      }
      
      return {
        ...state,
        widgets: filteredWidgets,
        dashboards: dashboardsAfterRemoval,
        selectedDashboard: selectedDashboardAfterRemoval
      };
      
    case "SET_WIDGETS":
      return {
        ...state,
        widgets: action.payload
      };

    case "UPDATE_WIDGET":
      return {
        ...state,
        widgets: state.widgets.map(widget =>
          widget.id === action.payload.id
            ? action.payload
            : widget
        )
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload
      };

    case "SET_PROJECT_FILTER":
      return {
        ...state,
        filters: {
          ...state.filters,
          projectName: action.payload
        }
      };

    case "SET_TIME_RANGE_FILTER":
      return {
        ...state,
        filters: {
          ...state.filters,
          timeRange: action.payload
        }
      };

    case "RESET_FILTERS":
      return {
        ...state,
        filters: {
          projectName: null,
          timeRange: null
        }
      };

    default:
      return state;
  }
};