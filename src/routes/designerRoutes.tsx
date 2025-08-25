import { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { LoadingFallback } from './LoadingFallback';

// Lazy-loaded components
const DesignerDashboard = lazy(() => import("@/pages/designers/DesignerDashboard"));
const DataPipeCanvas = lazy(() => import("@/pages/designers/DataPipelineCanvas"));
const DataFlowCanvas = lazy(() => import("@/pages/designers/DataFlowCanva"));
const NotebookEditor = lazy(() => import("@/pages/data-catalog/Notebook"));

export const DesignerRoutes = (
  <>
    <Route
      path={ROUTES.DESIGNERS.INDEX}
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DesignerDashboard />
        </Suspense>
      }
    />
    {/* Route for creating a NEW build playground (id is null) */}
    <Route
      path={ROUTES.DESIGNERS.BUILD_PLAYGROUND(null)}
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DataPipeCanvas />
        </Suspense>
      }
    />

    {/* Route for viewing/editing an EXISTING build playground (with :id) */}
    <Route
      path={ROUTES.DESIGNERS.BUILD_PLAYGROUND(':id')}
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DataPipeCanvas />
        </Suspense>
      }
    />

    {/* Route for creating a NEW data flow playground (id is null) */}
    <Route
      path={ROUTES.DESIGNERS.Data_FLOW_PLAYGROUND(null)}
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DataFlowCanvas />
        </Suspense>
      }
    />

    {/* Route for viewing/editing an EXISTING data flow playground (with :id) */}
    <Route
      path={ROUTES.DESIGNERS.Data_FLOW_PLAYGROUND(':id')}
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DataFlowCanvas />
        </Suspense>
      }
    />

    <Route
      path={ROUTES.DESIGNERS.NOTEBOOK}
      element={
        <Suspense fallback={<LoadingFallback />}>
          <NotebookEditor />
        </Suspense>
      }
    />

  </>
);

export default DesignerRoutes;
