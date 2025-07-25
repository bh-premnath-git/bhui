File Hierarchy and Dependencies

src/pages/dataops/DataopsHub.tsx is a very small file that simply wraps the DataOpsHub feature component with the context provider and error boundary:

1  import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
2  import { DataOpsProvider } from "@/context/dataops/DataOpsContext"
3  import { DataOpsHub } from '@/features/dataops/DataOpsHub';
4  function DataOpsHubPage() {
5      return (
6          <DataOpsProvider>
7              <DataOpsHub />
8          </DataOpsProvider>
9      )
10 }
11
12 export default withPageErrorBoundary(DataOpsHubPage, 'DataOpsHub');

1. Context and State Management
DataOpsHubPage relies on DataOpsProvider from src/context/dataops/DataOpsContext.tsx.
This provider initializes state via DataOpsReducer and exposes both synchronous and asynchronous dispatch methods:

41 export const DataOpsProvider = ({ children }: { children: ReactNode }) => {
42   const [state, dispatch] = useReducer(dataOpsReducer, initialState);
...
58   return (
59     <DataOpsContext.Provider value={{ state, dispatch, dispatchAsync }}>
60       {children}
61     </DataOpsContext.Provider>
62   );
63 };

The reducer (DataOpsReducer.tsx) handles actions like SET_DASHBOARDS, ADD_WIDGET, and REMOVE_WIDGET to keep dashboards and widgets in sync:

76 export const dataOpsReducer = (state: DataOpsState, action: any): DataOpsState => {
77   switch (action.type) {
78     case "SET_DASHBOARDS":
79       return {
80         ...state,
81         dashboards: action.payload,
82         selectedDashboard: action.payload.length > 0 ? action.payload[0] : null
83       };
...
90     case "ADD_WIDGET":
91       const updatedWidgets = [...state.widgets, action.payload];
...
114         };
115         updatedDashboards = state.dashboards.map(dashboard => {
116           if (dashboard.dashboard_id === state.selectedDashboard?.dashboard_id) {
117             const updatedDashboard = {
118               ...dashboard,
119               dashboard_layout: [...(dashboard.dashboard_layout || []), newLayoutEntry]
120             };

2. Feature Component (DataOpsHub)
The main logic lives in src/features/dataops/DataOpsHub.tsx. It:

Fetches dashboards and widgets using custom hooks (useDataOpsDashboards, useDataOpsWidgets).

Updates context state with fetched data.

Handles loading and error reporting through the context.

Listens for custom events (chart-added-to-dashboard and widget-removed-from-dashboard) to dynamically add or remove widgets.

Example sections:

 9 export function DataOpsHub() {
10   const { state, dispatch, dispatchAsync } = useDataOps();
...
21   const {
22     widgets,
23     isLoading: isWidgetsLoading,
...
27   } = useDataOpsWidgets({
28     shouldFetch: widgetIds.length > 0,
29     widgetIds: widgetIds
30   });

Further down, event listener setup manages widget removal:

91   const handleWidgetRemoved = (event: CustomEvent) => {
92     if (!event.detail) { ... }
...
103     dispatch({ type: "REMOVE_WIDGET", payload: widgetId });
104     deleteWidget(widgetId);
105   };
107   document.addEventListener(WIDGET_REMOVED_EVENT, handleWidgetRemoved as EventListener);
...
110   return () => {
111     document.removeEventListener(WIDGET_REMOVED_EVENT, handleWidgetRemoved as EventListener);
112   };

Chart additions from the chat UI are handled similarly:

121   const handleChartAdded = (event: CustomEvent) => {
...
130     dispatchAsync({ type: "ADD_WIDGET", payload: chartDataFromEvent }).then(() => {
131       const payloadForCreateWidget = {
132         dashboard_id: state.selectedDashboard.dashboard_id ?? 101,
133         name: restOfChartData.name,
134         widget_type: restOfChartData.widget_type,
...
139       };
140       createWidget(payloadForCreateWidget);
141     });
142   };
144   document.addEventListener(CHART_ADDED_EVENT, handleChartAdded as EventListener);

3. Rendering
DataOpsHub ultimately renders a dashboard layout:

158   if (state.isLoading) {
159     return <LoadingState fullScreen />;
160   }
...
172   return (<div className="absolute inset-0"><Dashboard /></div>);

Dashboard (in src/features/dataops/dashboard/index.tsx) provides header and grid layout for widgets.

4. Supporting Utilities and Components
Event names originate from src/components/shared/GenericChatUI.tsx (CHART_ADDED_EVENT and WIDGET_REMOVED_EVENT).

Data compression/decompression uses src/lib/decompress.ts.

Loading and error states rely on LoadingState and ErrorState components.

Overall Flow
Routing points /dataops-hub to DataOpsHubPage.

Context provider wraps the feature, offering state and dispatch methods.

Feature component fetches dashboards/widgets, listens for events from the chat UI, and updates state accordingly.

Dashboard subcomponents render widgets in a responsive grid, allow filtering, and handle interactions (refresh, remove, edit).

Error and loading states are shown while fetching or when operations fail.

The dependencies thus span context files, dashboard widgets, hooks for fetching data, UI components for user interaction, and generic chat events for dynamic widget updates. The page itself mainly serves as the entry point, delegating the heavy logic to the provider and feature modules. This allows the rest of the app (headers, routes, etc.) to treat /dataops-hub as a self-contained module.

5  export async function updateWidgetLayout(
6      dashboards: Dashboard[],
7      dashboardId: number,
...
15      await delay(20);
...
37      dashboards[dashboardIndex] = dashboard;
38
39      return dashboard;

A “layout persistence” hook writes layout changes to localStorage:

javascript
Copy
11  export const useLayoutPersistence = ({ storageKey, dashboard, defaultDimensions }: LayoutConfig) => {
12    const [layouts, setLayouts] = useState<Layouts>(() => {
13      const savedLayout = localStorage.getItem(storageKey);
14      if (savedLayout) {
15        try {
16          return JSON.parse(savedLayout);
...
45      setLayouts(allLayouts);
46      localStorage.setItem(storageKey, JSON.stringify(allLayouts));

DashboardLayout calls handleLayoutChange from this hook to save positions but ignores the stored layout when rendering, always defaulting to a fresh initialLayout:

python-repl
Copy
31    const { handleLayoutChange } = useLayoutPersistence({
...
112   const initialLayout = renderableWidgets.map((widget, index) => ({
      i: widget.id.toString(),
      x: (index % 2) * DEFAULT_WIDGET_WIDTH,
      y: Math.floor(index / 2) * DEFAULT_WIDGET_HEIGHT,
...
129        layouts={{
130          lg: initialLayout,
131          md: initialLayout,
...

Because the stored layout isn’t reapplied, refreshing the page resets widget positions and sizes.

To keep layout changes across refreshes you could:

Use the layouts returned by useLayoutPersistence when rendering <ResponsiveGridLayout>—falling back to initialLayout only if no saved layout exists.

Optionally persist the updated layout to the backend (e.g., by extending updateWidgetLayout to make an API call) if cross‑device persistence is needed.