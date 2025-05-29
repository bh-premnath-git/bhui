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
        const newLayoutEntry = {
          // Add required properties to match DashboardLayout interface
          layout_id: Date.now(), // Generate a temporary ID (will be replaced by backend)
          dashboard_id: state.selectedDashboard.dashboard_id,
          widget_id: action.payload.id,
          order_index: (state.widgets.length + 1).toString(),
          widget_coordinates: { x: 0, y: Math.floor(state.widgets.length / 2) * 4 },
          widget_size: { w: 6, h: 4 },
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