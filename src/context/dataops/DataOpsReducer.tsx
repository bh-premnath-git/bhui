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
    
    case "SET_WIDGETS":
      return {
        ...state,
        widgets: action.payload
      };
    
    case "UPDATE_WIDGET":
      return {
        ...state,
        widgets: state.widgets.map(widget =>
          widget.widget_id === action.payload.widget_id
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