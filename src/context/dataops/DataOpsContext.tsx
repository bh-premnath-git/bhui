import { createContext, useContext, useReducer, ReactNode } from "react";
import { Dashboard, Widget} from "@/types/dataops/dataops-dash";
import { dataOpsReducer, initialState } from "./DataOpsReducer";

// Define the context state type
export type DataOpsState = {
  dashboards: Dashboard[];
  selectedDashboard: Dashboard | null;
  widgets: Widget[];
  isLoading: boolean;
  error: string | null;
  filters: {
    projectName: string | null;
    timeRange: string | null;
  };
};

// Define the context actions
type DataOpsAction = 
  | { type: "SET_DASHBOARDS"; payload: Dashboard[] }
  | { type: "SET_SELECTED_DASHBOARD"; payload: Dashboard }
  | { type: "SET_WIDGETS"; payload: Widget[] }
  | { type: "UPDATE_WIDGET"; payload: Widget }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PROJECT_FILTER"; payload: string | null }
  | { type: "SET_TIME_RANGE_FILTER"; payload: string | null }
  | { type: "RESET_FILTERS" };

// Create the context with its dispatch function
type DataOpsContextType = {
  state: DataOpsState;
  dispatch: React.Dispatch<DataOpsAction>;
};

const DataOpsContext = createContext<DataOpsContextType | undefined>(undefined);

export const DataOpsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(dataOpsReducer, initialState);

  return (
    <DataOpsContext.Provider value={{ state, dispatch }}>
      {children}
    </DataOpsContext.Provider>
  );
};

export const useDataOps = () => {
  const context = useContext(DataOpsContext);
  if (context === undefined) {
    throw new Error("useDataOps must be used within a DataOpsProvider");
  }
  return context;
};