import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { LoadingFallback } from './LoadingFallback';

// Lazy-loaded components
const DataOpsHub = lazy(() => import("@/pages/dataops/DataopsHub"));
const OpsHub = lazy(() => import("@/pages/dataops/OpsHub"));
const AlertsHub = lazy(() => import("@/pages/dataops/AlertsHub"));
const ReleaseBundle = lazy(() => import("@/pages/dataops/ReleaseBundle"));

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
