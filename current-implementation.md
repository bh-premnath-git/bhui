## ProtectedLayout Component Implementation
## Application Root Implementation

### File Location
- Main component: `src/App.tsx`

### File Locations
- Main component: `src/components/ProtectedLayout.tsx`
- Dependent components:
  - `src/components/Sidebar.tsx`
  - `src/components/Header.tsx`
  - `src/components/RightAside.tsx`
  - `src/components/BottomDrawer.tsx`

### Component Hierarchy
- Wraps app content with theme and sidebar contexts
- Orchestrates:
  - `Sidebar` (collapsible)
  - `Header` (fixed position)
  - Main content area (`Outlet` for router)
  - `RightAside` (conditional sidebar)
  - `BottomDrawer` (conditional bottom panel)

## Navigation Components

### File Locations
- Header Component: `src/components/Header.tsx`
- Breadcrumb Component: `src/components/NavigationBreadcrumb.tsx`

### Header Component

#### Core Functionality
- Renders the fixed application header at the top of the layout
- Dynamically adjusts content based on current route
- Integrates with sidebar state to manage responsive behavior
- Provides integration points for route-specific AI chat buttons

#### Route-Specific Rendering
- **Playground Routes**: Renders specialized `PlaygroundHeader` component 
- **DataOps Hub**: Combines breadcrumb with DataOps-specific AI chat button
- **Data Xplorer**: Shows navigation breadcrumb with explorer AI chat functionality
- **Notebook Route**: Displays notebook-specific AI button
- **Default**: Renders standard breadcrumb navigation

#### Dynamic Adjustments
- Automatically adapts to sidebar expanded/collapsed state
- Adjusts width based on right aside panel open/closed state
- Uses backdrop blur effect for modern UI appearance

#### Integration Points
```tsx
// AI Chat Button integration example
if (isDataOpsHubRoute(location.pathname)) {
  return (
    <div className={cn(isRightAsideOpen ? "w-[69%]" : "w-[100%]","flex justify-between")}>
      <NavigationBreadcrumb />
      <AIChatButton variant="dataops" />
    </div>
  );
}
```

### Navigation Breadcrumb

#### Core Functionality
- Provides hierarchical navigation indicators
- Dynamically generates breadcrumb path based on current route
- Handles special routes with custom breadcrumb generation
- Implements home redirect for authenticated users

#### Special Features
- Handles deep navigation paths by analyzing all path segments
- Matches routes against navigation configuration from `navigation.ts`
- Formats report names from URL parameters (e.g., converts 'orders-report' to 'Orders Report')
- Provides Home icon for root navigation item

#### Implementation Notes
- Uses shadcn/ui breadcrumb components with custom styling
- Integrates with React Router for navigation
- Implements special case handling for specific routes like Xplorer and Data Catalog
- Auto-generates breadcrumb items by parsing URL segments

## Admin Project Management Implementation

### File Locations
- Page Components:
  - `src/pages/admin/project/ProjectList.tsx`
  - `src/pages/admin/project/ProjectAdd.tsx`
  - `src/pages/admin/project/ProjectEdit.tsx`
- Feature Implementation:
  - `src/features/admin/projects/AddProject.tsx`
  - `src/features/admin/projects/EditProject.tsx`
  - `src/features/admin/projects/hooks/useProjects.ts`
- UI Components:
  - `src/features/admin/projects/components/ProjectForm.tsx`
  - `src/features/admin/projects/components/FormFields.tsx`
  - `src/features/admin/projects/components/ProjectPageLayout.tsx`
- Data Schema:
  - `src/features/admin/projects/components/projectFormSchema.ts`
  - `src/types/admin/project.ts`

### Project Add Page

#### Component Hierarchy
1. **ProjectAdd** (Pages layer)
   - Wrapped with `withPageErrorBoundary` for error handling
   - Renders `AddProject` feature component

2. **AddProject** (Feature layer)
   - Manages state for project creation:
     - Form submission state
     - GitHub token validation
     - Error handling
   - Renders `ProjectPageLayout` with `ProjectForm`

3. **ProjectForm** (UI Component)
   - Implements form with React Hook Form and Zod validation
   - Manages form sections:
     - Project name with real-time validation
     - GitHub configuration fields
     - Tag management
   - Handles form submission and validation state

#### Data Flow
1. User enters project name → `debounceSearchProject` checks for duplicates
2. User fills GitHub details → `handleValidateGitHub` validates the token
3. User submits form → Data transformed via `transformFormToApiData`
4. `handleCreateProject` executes API call
5. On success → Redirect to projects list
6. On error → Error displayed in form

#### API Integration
- Uses `useResource` custom hook (Abstraction over React Query)
- Key API endpoints:
  - `/bh_project` (POST) - Project creation
  - `/bh_project/validate-token/` (POST) - Token validation
  - `/bh_project/search` (GET) - Duplicate project check
- Security features:
  - GitHub token encryption with `encrypt_string`
  - Separate validation before token usage

### Project Edit Page

#### Component Hierarchy
1. **ProjectEdit** (Pages layer)
   - Wrapped with `withPageErrorBoundary` for error handling
   - Renders `EditProject` feature component

2. **EditProject** (Feature layer)
   - Retrieves project data using ID from URL params
   - Manages state for:
     - Project loading
     - Form submission
     - Token validation (conditional)
     - Error handling
   - Transforms API data to form format with `transformProjectToFormData`
   - Renders `ProjectPageLayout` with `ProjectForm`

3. **ProjectForm** (UI Component)
   - Shared with Add page but in "edit" mode
   - Pre-fills form with project data
   - Handles conditional GitHub token validation

#### Data Flow
1. Component loads → Fetches project data if not in Redux store
2. User modifies form → Form validates changes
3. If GitHub token changed → `handleValidateGitHub` validates
4. User submits form → `transformFormToApiData` formats data
5. `handleUpdateProject` executes API call with project ID
6. On success → Redirect to projects list 
7. On error → Error displayed in form

#### Security Implementation
- GitHub token handling:
  - Never displays existing token in form (security)
  - Only encrypts and sends token if modified
  - Uses encryption with initialization vectors for token security
- Form validation:
  - Zod schema validation for all fields
  - Separate token validation via API

### Shared Components and Utilities

#### Forms and Validation
- Uses React Hook Form + Zod schema validation
- Shared project form schema between add/edit modes
- Data transformation utilities:
  - `transformFormToApiData`: Form → API format
  - `transformProjectToFormData`: API → Form format
  - `transformApiToFormData`: General utility

#### API and Data Management
- Custom `useProjects` hook for all project operations
- Features:
  - CRUD operations for projects
  - Token validation
  - Real-time project name validation
  - Error handling with toast notifications
- Redux integration for selected project state

#### UI Components
- `ProjectPageLayout`: Consistent layout for project pages
- Form field components with validation states
- Error display and success notifications
- Loading states for all async operations

### Redux State Management

#### File Locations
- Redux Store:
  - `src/store/index.ts` - Main Redux store configuration
  - `src/store/slices/admin/projectsSlice.ts` - Projects slice

#### Projects Slice Implementation
- **State Structure**:
  ```typescript
  interface ProjectsState {
    projects: Project[];
    selectedProject: Project | null;
    loading: boolean;
    error: string | null;
  }
  ```

- **Action Creators**:
  - `setProjects`: Updates the list of projects in the store
  - `setSelectedProject`: Sets the currently selected project
  - `setLoading`: Manages loading state for async operations
  - `setError`: Handles error states

- **Integration Points**:
  - `ProjectList.tsx`: Sets projects in store when fetched
  - `EditProject.tsx`: Retrieves/updates selected project
  - `useProjects` hook: Interfaces with Redux for project operations

#### State Management Flow
1. API data fetched via React Query in `useProjects` hook
2. Data dispatched to Redux store via slice actions
3. Components access projects data via Redux selectors
4. UI updates based on store state (loading, error, data)
5. Form operations update local state before API submission
6. On successful operations, store is updated to reflect changes

#### Benefits of Approach
- Centralized project state accessible across components
- Separation of concerns between API fetching and state management
- Consistent loading and error states throughout the application
- Optimized re-renders with Redux's shallow equality checks