## DataOps Dashboard Integration within ProtectedLayout

The `src/features/dataops/dashboard/index.tsx` component, typically imported and used as `Dashboard`, serves as the primary user interface for displaying DataOps dashboards and their associated widgets. Its integration into the application's routed structure under `ProtectedLayout` is as follows:

### 1. `ProtectedLayout.tsx` - The Application Shell

-   **File**: `src/components/ProtectedLayout.tsx`
-   **Role**: This component establishes the main visual and structural framework for authenticated sections of the application.
-   **Key Features** (based on provided snippet and memory):
    -   Wraps content with `ThemeProvider` and `SidebarProvider` for consistent theming and sidebar state management.
    -   Orchestrates a layout consisting of:
        -   A collapsible `Sidebar` (`src/components/Sidebar.tsx`).
        -   A `Header` (`src/components/Header.tsx`).
        -   A main content area (`<main>`) that uses `<Outlet />` from React Router to render the content of the currently active route.
        -   Conditional `RightAside` and `BottomDrawer` panels for supplementary information or actions.
    -   The main content area dynamically adjusts its margins based on the sidebar's expanded/collapsed state.

### 2. Routing Mechanism

The application's routing is set up hierarchically:

-   **`src/App.tsx`**: The root application component. It initializes global providers (Keycloak, Redux, React Query, etc.) and renders `<AppRoutes />`.
-   **`src/routes/index.tsx` (`AppRoutes`)**: This file defines the top-level routing structure.
    -   It uses `ProtectedLayout` to wrap all routes that require authentication.
    -   It aggregates route definitions from more specific route files, including `DataOpsRoutes`.
-   **`src/routes/dataOpsRoutes.tsx` (`DataOpsRoutes`)**: This file contains routes specific to the DataOps section.
    -   The primary DataOps route (e.g., mapped to `ROUTES.DATAOPS.INDEX`) is configured to render the `DataOpsHubPage` component. This rendering is typically done using React's lazy loading (`React.lazy`) for better performance, with a `Suspense` fallback.

### 3. Page-Level Component: `DataOpsHubPage`

-   **File**: `src/pages/dataops/DataopsHub.tsx`
-   **Role**: This component acts as the entry point for the DataOps Hub page.
-   **Functionality**:
    -   It wraps the main feature component (`DataOpsHub` from `src/features/dataops/DataOpsHub.tsx`) with necessary context providers, such as `DataOpsProvider`.
    -   It includes an error boundary (`withPageErrorBoundary`) to catch and handle errors specific to this page.

### 4. Feature Component: `DataOpsHub`

-   **File**: `src/features/dataops/DataOpsHub.tsx`
-   **Role**: This is the core logic component for the DataOps Hub.
-   **Functionality**:
    -   Utilizes custom hooks like `useDataOpsDashboards` and `useDataOpsWidgets` (from `src/features/dataops/dataOpsHubs/hooks/useDataOpsDash.ts`) to fetch dashboard list and individual widget data.
    -   Manages loading and error states for these data fetching operations.
    -   Processes the fetched data (e.g., extracting widget IDs from dashboard layouts).
    -   Updates a shared `DataOpsContext` with the fetched dashboards and widgets.
    -   Finally, it renders the `Dashboard` component.

### 5. UI Component: `Dashboard` (from `src/features/dataops/dashboard/index.tsx`)

-   **File**: `src/features/dataops/dashboard/index.tsx`
-   **Role**: This is the component responsible for the actual presentation of the DataOps dashboards.
-   **Structure**: It orchestrates the main dashboard view by rendering two key sub-components:
    1.  `DashboardHeader`
    2.  `DashboardLayout`
-   **Styling**: The main container uses `flex flex-col min-h-screen bg-background` to ensure it takes up at least the full screen height with a background color.

#### 5.1. `DashboardHeader.tsx`

-   **File**: `src/features/dataops/dashboard/DashboardHeader.tsx`
-   **Role**: Provides a sticky header for the dashboard, containing global controls like filters.
-   **Key Features & Styling**:
    -   **Layout**: Uses `flex flex-wrap gap-4 items-center` for arranging filter components.
    -   **Sticky Behavior**: Styled with `bg-background sticky top-0 z-10 border-b border-border/40 pb-2` to remain at the top during scroll, with a subtle bottom border.
    -   **Project Filter**:
        -   A `Select` dropdown dynamically populated with project names derived from widget data in `DataOpsContext`.
        -   Allows filtering by project or showing "All Projects".
        -   Updates `filters.projectName` in `DataOpsContext`.
        -   Styled with `min-w-[200px]` and uses a `Filter` icon.
    -   **Time Range Filter**:
        -   A `Select` dropdown with predefined time periods (e.g., "Today", "Last 7 Days").
        -   Allows filtering by time range or showing "All Time".
        -   Updates `filters.timeRange` in `DataOpsContext`.
        -   Styled with `min-w-[200px]` and uses a `Filter` icon.
    -   **Clear Filters Button**:
        -   A `Button` with `variant="ghost"` that appears only when filters are active.
        -   Resets both `projectName` and `timeRange` filters in `DataOpsContext`.
        -   Includes an `XCircle` icon and styled with `text-muted-foreground hover:text-foreground`.

#### 5.2. `DashboardLayout.tsx`

-   **File**: `src/features/dataops/dashboard/DashboardLayout.tsx`
-   **Role**: Manages the rendering, arrangement, and interactivity of widgets within the dashboard.
-   **Key Features & Styling**:
    -   **Grid System**: Utilizes `ResponsiveGridLayout` from `react-grid-layout` (wrapped with `WidthProvider`) for a responsive, draggable, and resizable widget area.
        -   `className="layout"`
        -   Responsive breakpoints (`lg`, `md`, `sm`, `xs`, `xxs`) and corresponding column counts.
        -   `rowHeight={80}`, `margin={[8, 8]}`, `containerPadding={[0, 0]}`.
        -   `isDraggable`, `isResizable` (with `resizeHandles={['se']}`), `draggableHandle=".widget-header"`.
        -   `compactType="vertical"`, `useCSSTransforms={true}`.
    -   **Layout Persistence**: Employs `useLayoutPersistence` hook to save and load widget layouts (position, size) to/from local storage (key: `dashboard_layout`).
    -   **Widget Ordering & Filtering**:
        -   `orderedWidgets`: Memoized array, sorts widgets based on `order_index` from `selectedDashboard.dashboard_layout`.
        -   `filteredWidgets`: Memoized array, applies filters from `DataOpsContext` (project, time range) to the `executed_query` data of each widget using `applyFilters` utility.
    -   **Widget Rendering**: Maps over `filteredWidgets` to render each `Widget` component (`src/features/dataops/dashboard/widgets/Widget.tsx`) inside a `div` with `key` and styling (`rounded-lg shadow-sm transition-all duration-300`).
    -   **Layout Updates**: The `onLayoutChange` handler processes layout changes, and attempts to persist them via an API call to `updateWidgetLayout` with widget ID, order index, coordinates, and size.
    -   **Empty State**: Displays an informative message with a `LayoutDashboard` icon when `filteredWidgets` is empty. The message content adapts based on whether filters are active.
        -   Styled with `min-h-[300px] flex flex-col items-center justify-center p-4 bg-card border rounded-lg`.
    -   **Overall Styling**: The main container has `p-2 transition-all duration-300`.

In summary, `src/features/dataops/dashboard/index.tsx` is not a "route component" in the sense that it's directly assigned to a `<Route element={...} />`. Instead, it's a crucial UI component that forms the core content of the DataOps Hub page. This page *is* a routed component, and it leverages `ProtectedLayout` for its overall structure and `DataOpsHub` (feature component) to manage data and logic before rendering the `Dashboard`.