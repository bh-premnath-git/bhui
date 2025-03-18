# App.tsx Modularization Guide

I've created a modular structure for your routes to make the codebase more maintainable. Here's how to implement it:

## File Structure
```
src/
├── routes/
│   ├── AppRoutes.tsx        - Main routes component
│   ├── LoadingFallback.tsx  - Shared loading component
│   ├── dataCatalogRoutes.tsx - Data Catalog route definitions
│   ├── designerRoutes.tsx   - Designer route definitions
│   ├── dataOpsRoutes.tsx    - DataOps route definitions
│   └── adminRoutes.tsx      - Admin route definitions
└── App.tsx                  - Simplified App component
```

## Implementation Steps

### 1. Replace your App.tsx with this code:

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { KeycloakProvider } from "./hooks/useKeycloak";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppRoutes } from "./routes/AppRoutes";

// Create query client for React Query
const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <KeycloakProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </KeycloakProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
```

### 2. All route files have been created in your codebase:
- LoadingFallback.tsx
- AppRoutes.tsx
- dataCatalogRoutes.tsx
- designerRoutes.tsx
- dataOpsRoutes.tsx
- adminRoutes.tsx

### Benefits of this modularization:
- Improved code organization and readability
- Better separation of concerns
- Easier maintenance and extension
- Simplified App.tsx component
- Grouping routes by feature area
