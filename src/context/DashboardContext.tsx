import { createContext, useContext, useReducer, ReactNode } from "react";
import { Dashboard, Widget } from "@/types/dataops/dataops-dash";

// Define the context state type
export type DashboardState = {
  dashboards: Dashboard[];
  selectedDashboard: Dashboard | null;
  widgets: Widget[];
  isLoading: boolean;
  error: string | null;
};

// Initial state
export const initialState: DashboardState = {
  dashboards: [],
  selectedDashboard: null,
  widgets: [],
  isLoading: false,
  error: null
};

// Define the context actions
type DashboardAction = 
  | { type: "SET_DASHBOARDS"; payload: Dashboard[] }
  | { type: "SET_SELECTED_DASHBOARD"; payload: Dashboard }
  | { type: "ADD_WIDGET"; payload: Widget }
  | { type: "REMOVE_WIDGET"; payload: string } // Widget ID to remove
  | { type: "SET_WIDGETS"; payload: Widget[] }
  | { type: "UPDATE_WIDGET"; payload: Widget }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// Helper function to find the next available position in the grid
const findNextAvailablePosition = (layouts = [], cols = 12, defaultSize = { w: 6, h: 4 }) => {
  if (!layouts || layouts.length === 0) {
    return { x: 0, y: 0 };
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
export const dashboardReducer = (state: DashboardState, action: any): DashboardState => {
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

    default:
      return state;
  }
};

// Create the context with its dispatch function
type DashboardContextType = {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  dispatchAsync: (action: DashboardAction) => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  
  // Create an async version of dispatch that returns a Promise
  const dispatchAsync = (action: DashboardAction): Promise<void> => {
    return new Promise<void>((resolve) => {
      dispatch(action);
      // Use requestAnimationFrame to wait for React to process the state update
      // This is not perfect but provides a good approximation of when the state update is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  };

  return (
    <DashboardContext.Provider value={{ state, dispatch, dispatchAsync }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};