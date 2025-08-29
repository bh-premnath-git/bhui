import { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { LoadingFallback } from './LoadingFallback';

// Lazy-loaded components
const DataOpsHub = lazy(() => import("@/pages/dataops/DataopsHub"));
const OpsHub = lazy(() => import("@/pages/dataops/OpsHub"));
const AlertsHub = lazy(() => import("@/pages/dataops/AlertsHub"));
const ReleaseBundle = lazy(() => import("@/pages/dataops/ReleaseBundle"));
const DataOpsXplore = lazy(() => import("@/pages/dataops/DataopsExplorer"));

export const DataOpsRoutes = (
  <>
    <Route 
      path={ROUTES.DATAOPS.INDEX} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DataOpsHub />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.DATAOPS.OPS_HUB} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <OpsHub />
        </Suspense>
      } 
    />
    <Route 
      path={`${ROUTES.DATAOPS.OPS_HUB}/data-xplorer`} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DataOpsXplore />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.DATAOPS.ALERTS} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <AlertsHub />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.DATAOPS.RELEASE} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <ReleaseBundle />
        </Suspense>
      } 
    />
  </>
);

export default DataOpsRoutes;
