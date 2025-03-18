import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { LoadingFallback } from './LoadingFallback';

// Lazy-loaded components
const DataCatalog = lazy(() => import("@/pages/data-catalog/DataCatalog"));
const XplorerPage = lazy(() => import("@/pages/data-catalog/XplorerPage"));
const DatasourceImport = lazy(() => import("@/pages/data-catalog/DatasourceImport"));

export const DataCatalogRoutes = (
  <>
    <Route 
      path={ROUTES.DATA_CATALOG} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DataCatalog />
        </Suspense>
      } 
    />
    <Route 
      path={`${ROUTES.DATA_CATALOG}/xplorer`} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <XplorerPage />
        </Suspense>
      } 
    />
    <Route 
      path={`${ROUTES.DATA_CATALOG}/datasource-import`} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DatasourceImport />
        </Suspense>
      } 
    />
  </>
);

export default DataCatalogRoutes;
