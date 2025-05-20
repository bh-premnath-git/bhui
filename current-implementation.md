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

#### Route-Specific Rendering


## Admin Connection Management Implementation

### Architecture Overview
- **Pages Layer**: Lightweight wrapper components that render feature components
- **Feature Layer**: Core implementation of connection management functionality
- **Redux Store**: Central state management for connection data
- **API Integration**: RESTful operations through custom hooks
- **Services**: Connection management service for Redux interaction

### Flow Diagram
```
Page Component
    ↓
Feature Component
    ↓
Hooks (useConnections) → API Calls → Backend
    ↓
Redux Store ← Service (connMgtSrv)
    ↓
UI Components
```

### File Locations
- Page Components:
  - `src/pages/admin/connection/ConnectionList.tsx`
  - `src/pages/admin/connection/ConnectionAdd.tsx`
  - `src/pages/admin/connection/ConnectionEdit.tsx`
- Feature Implementation:
  - `src/features/admin/connection/AddConnection.tsx`
  - `src/features/admin/connection/EditConnection.tsx`
  - `src/features/admin/connection/ListConnection.tsx`
- UI Components:
  - `src/features/admin/connection/components/ConnectionForm.tsx`
  - `src/features/admin/connection/components/FormFields.tsx`
  - `src/features/admin/connection/components/ConnectionPageLayout.tsx`
  - `src/features/admin/connection/components/DeleteConnectionDialog.tsx`
- Data Access Layer:
  - `src/features/admin/connection/hooks/useConnection.ts`
  - `src/features/admin/connection/services/connMgtSrv.ts`
- State Management:
  - `src/store/slices/admin/connection.ts`
- Data Schema:
  - `src/types/admin/connection.ts`

### Data Flow
1. **Listing Connections**:
   - Page component renders feature component
   - `useConnections` hook fetches connection data via API call
   - Data stored in Redux for shared access
   - `ListConnection` renders connections in data table

2. **Creating Connections**:
   - Two-step process: select connection type → configure connection
   - Connection type search with debounced name validation
   - Dynamic schema loading based on connection type
   - Form validation with custom schema
   - Encrypted credential handling for sensitive data
   - API submission with success/error toast notifications

3. **Editing Connections**:
   - Connection data loaded from API with connection ID
   - Existing credentials properly handled with encryption
   - Same form component used but with edit mode flag
   - Form prefilled with existing connection data

4. **Deleting Connections**:
   - Modal confirmation dialog 
   - Uses custom event for triggering delete dialog
   - API call to delete with Redux state update

### Redux Implementation
```typescript
// connection.ts Redux slice
const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    setconnection: (state, action: PayloadAction<Connection[]>) => {
      state.connection = action.payload;
    },
    setSelectedconnection: (state, action: PayloadAction<Connection | null>) => {
      state.selectedconnection = action.payload;
    },
    // Additional reducers...
  },
});
```

### API Integration with Custom Hooks
```typescript
// useConnections hook for API operations
export const useConnections = (options: UseConnectionsOptions = { shouldFetch: true }) => {
  const { getOne, getAll } = useResource<Connection>(
    '/connection_registry/connection_config',
    CATALOG_API_PORT,
    true
  );
  
  const { create, update, remove } = useResource<ConnectionValue>(
    '/connection_registry/connection_config',
    CATALOG_API_PORT,
    true
  );

  // API operations implemented with callbacks
  const handleCreateConnection = useCallback(async (data: ConnectionValue) => {
    await createConnectionMutation.mutateAsync({ data });
  }, [createConnectionMutation]);
  
  // Other handler methods...
  
  return {
    connections,
    isLoading,
    handleCreateConnection,
    handleUpdateConnection,
    handleDeleteConnection,
    // Other properties...
  };
}
```

### Connection Type Management
- Source vs. Destination categorization
- Visual card-based selection interface
- Dynamic schema loading based on connection type
- Type-specific configuration generation

### Dynamic Form Generation
- Schema-driven form rendering
- Custom handling for special fields (JSON credentials)
- Zod validation schema generation from connection specification
- Specialized field transformations for different connection types

### Error Handling
- Toast notifications for user feedback
- Connection validation with immediate feedback
- Form validation with field-level error messages
- API error handling with standardized approach

### UI Implementation Patterns
- Card-based connection type selection
- Tabs for source/destination categorization
- Search filtering for connection types
- Tailwind styling with consistent UI elements
- Table view for connection list with sort/filter

### Component Structure
1. **AddConnection Component**
   - Manages connection type selection workflow
   - Provides search functionality for connection types
   - Validates connection name availability in real-time
   - Groups connections by source/destination with tab navigation
   - Displays visual cards for each connection type with images

2. **ConnectionForm Component**
   - Dynamically loads schema based on connection type
   - Handles both creation and editing modes
   - Manages form validation with Zod schemas
   - Processes connection-specific configuration
   - Securely handles credentials with encryption

3. **FormFields Component**
   - Renders dynamic form fields based on connection schema
   - Supports various input types (text, password, number, etc.)
   - Handles specialized fields (textarea for JSON credentials)
   - Shows proper validation feedback

### Key Features
1. **Dynamic Schema Loading**:
   - Loads connection schemas from JSON files
   - Adapts UI based on connection type requirements
   - Custom handling for special connections (BigQuery, Local)

2. **Secure Credential Handling**:
   - Encrypts sensitive connection information
   - Uses the same encryption library as environment management
   - Handles decryption for edit scenarios

3. **Real-time Validation**:
   - Connection name availability checking
   - Form field validation with immediate feedback
   - Custom validation rules per connection type

4. **Connection Type Management**:
   - Visual categorization (source/destination)
   - Searchable connection type catalog
   - Visual representation with appropriate icons

5. **Connection Configuration**:
   - Type-specific form generation
   - Custom configuration for database-specific parameters
   - Support for connection testing

### Technical Implementation
```tsx
// Dynamic schema loading based on connection type
useEffect(() => {
  const loadSchema = async () => {
    setIsLoading(true);
    try {
      if (connectionName.toLowerCase() === 'local') {
        // Custom schema for local connections
        const localSchema = {
          connectionSpecification: {
            properties: {
              file_path_prefix: {
                type: "string",
                title: "File Path Prefix",
                description: "The path prefix for local files",
                minLength: 1
              }
            },
            required: ["file_path_prefix"]
          }
        };
        setSchema(localSchema.connectionSpecification);
      } else {
        // Load schema from JSON file for other connection types
        const module = await import(
          `@/components/bh-reactflow-comps/builddata/json/${connectionName.toLowerCase()}.json`
        );
        setSchema(module.default.connectionSpecification);
      }
    } catch (error) {
      console.error('Failed to load schema:', error);
      toast.error('Failed to load connection schema');
    } finally {
      setIsLoading(false);
    }
  };

  loadSchema();
}, [connectionName]);

// Connection-specific configuration handling
const getConfigUnionForType = (connectionName: string, data: any, connectionType: string) => {
  const type = connectionName.toLowerCase();
  const dynamicTypeField = connectionType === 'source' ? 'source_type' : 'destination_type';
  
  // Base configuration with type
  const commonFields = {
    [dynamicTypeField]: type,
  };

  // Connection-specific handling (example: Postgres)
  if (type === 'postgres') {
    return {
      host: data.host || '',
      port: data.port ? String(data.port) : '5432',
      database: data.database || '',
      username: data.username || '',
      password: data.password || '',
      schemas: Array.isArray(data.schemas) ? data.schemas[0] : data.schemas || 'public',
      ...(data.ssl_mode && { ssl_mode: data.ssl_mode }),
      ...(data.jdbc_url_params && { jdbc_url_params: data.jdbc_url_params }),
      ...commonFields,
    };
  }
  
  // Additional connection types handled similarly...
};

### Data Flow
- User selects connection type from categorized grid
- Dynamic form loads based on connection type
- Form validation ensures required fields are complete
- Submission process handles special encoding for credentials
- Success/failure feedback provided via toast notifications

### User Experience Considerations
- Visual categorization with source/destination tabs
- Searchable connection type catalog
- Intuitive form validation with clear error messages
- Connection name availability checking in real-time
- Consistent styling with connection-specific icons

## Connection Management UI/UX Enhancements

### Visual Design Improvements

1. **Connection Selection Cards**
   - Implement subtle hover animations with scale transform (1.02-1.05)
   - Add gradient borders or accent colors based on connection category
   - Use consistent icon sizing with proper padding (56px x 56px container)
   - Apply soft drop shadows on hover (0 8px 30px rgba(0,0,0,0.12))
   - Add subtle branded background patterns for each card

2. **Layout Refinements**
   - Change grid layout to responsive masonry grid for better space utilization
   - Implement virtualized scrolling for performance with many connection types
   - Group connections by category with visual separators
   - Add "Featured" or "Recently Used" section at the top

3. **Navigation & Workflow**
   - Add stepper component to visualize multi-step connection process
   - Implement breadcrumb navigation for context awareness
   - Use slide/fade transitions between selection and form states
   - Add connection type comparison tooltips

### Interactive Enhancements

1. **Connection Type Selection**
   - Add visual tags for connection types (Database, Storage, API, etc.)
   - Implement quick-filter chips above the search (e.g., Databases, Cloud Storage)
   - Show connection popularity or usage metrics as small badges
   - Add keyboard navigation support for accessibility

2. **Search Experience**
   - Implement search highlighting for matched terms
   - Add voice search capability for accessibility
   - Show recent searches in dropdown
   - Implement search suggestions based on partial matches

3. **Form Interactions**
   - Add field auto-completion for common inputs
   - Implement progressive disclosure for complex form sections
   - Add inline validation with helpful suggestions
   - Provide "Test Connection" button with inline results

### Visual Styling Updates

```tsx
// Enhanced connection card component with improved UI
<Card 
  key={type.id}
  className={`
    transition-all duration-300 
    border-[1.5px] 
    ${connectionConfigName.trim() 
      ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg border-transparent hover:border-primary/30' 
      : 'opacity-70 cursor-not-allowed'}
    ${isRecommended(type) ? 'bg-gradient-to-r from-primary/5 to-transparent' : ''}
  `}
  onClick={() => handleCardClick(type)}
>
  <CardContent className="p-6 flex flex-col items-center relative">
    {isPopular(type) && (
      <span className="absolute top-2 right-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
        Popular
      </span>
    )}
    <div className="w-16 h-16 mb-4 flex items-center justify-center bg-background rounded-xl p-2 shadow-sm">
      <img 
        src={connectionImages[type.connection_name]} 
        alt={type.connection_display_name}
        className="max-w-[80%] max-h-[80%] object-contain transition-all"
      />
    </div>
    <CardTitle className="text-center text-sm mb-1 line-clamp-1">
      {type.connection_display_name}
    </CardTitle>
    <CardDescription className="text-center text-xs line-clamp-2">
      {type.connection_description}
    </CardDescription>
    <div className="mt-3 flex flex-wrap justify-center gap-1">
      {getTags(type).map(tag => (
        <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
          {tag}
        </span>
      ))}
    </div>
  </CardContent>
</Card>
```

### Search Component Enhancements

```tsx
// Enhanced search component with better UX
<div className="relative mb-6">
  <div className="flex items-center space-x-2 mb-2">
    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">All</Badge>
    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Databases</Badge>
    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Cloud</Badge>
    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Local</Badge>
  </div>
  
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
    <Input
      placeholder="Search connections..."
      className="pl-10 pr-8"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    {searchTerm && (
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
        onClick={() => setSearchTerm('')}
      >
        <X className="h-3 w-3" />
      </Button>
    )}
  </div>
  
  {searchTerm && filteredConnections?.length === 0 && (
    <p className="text-sm text-muted-foreground mt-1">
      No connections found. Try different keywords.
    </p>
  )}
</div>
```

### Form Navigation Improvements

```tsx
// Multi-step form navigation with progress indicator
<div className="mb-6">
  <div className="flex items-center justify-between max-w-lg mb-8">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>
        1
      </div>
      <span className="text-xs mt-1">Basics</span>
    </div>
    <div className="flex-1 h-1 bg-muted mx-2">
      <div className={`h-full bg-primary ${currentStep >= 2 ? 'w-full' : 'w-0'} transition-all duration-300`}></div>
    </div>
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>
        2
      </div>
      <span className="text-xs mt-1">Details</span>
    </div>
    <div className="flex-1 h-1 bg-muted mx-2">
      <div className={`h-full bg-primary ${currentStep >= 3 ? 'w-full' : 'w-0'} transition-all duration-300`}></div>
    </div>
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-muted'}`}>
        3
      </div>
      <span className="text-xs mt-1">Test</span>
    </div>
  </div>
  
  {/* Form content based on current step */}
</div>
```

### Additional UX Enhancements

1. **Onboarding Features**:
   - Add tooltips for first-time users
   - Implement guided setup for common connection types
   - Add interactive examples for complex fields

2. **Feedback Mechanisms**:
   - Enhance success/error states with animated feedback
   - Add progress indicators for operations like testing connections
   - Provide inline help text with examples

3. **Connection Management**:
   - Add connection grouping/tagging capability
   - Implement favorites system for frequently used connections
   - Add bulk operations for connection management
   - Provide connection health status indicators

### Mobile Responsiveness
- Optimize card sizes for smaller screens
- Implement collapsible sections for form fields
- Use bottom sheets instead of modals on mobile
- Add touch-optimized interactions
