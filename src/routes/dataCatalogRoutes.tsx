import { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { LoadingFallback } from './LoadingFallback';
import ReportDetails from '@/pages/data-catalog/xplorer/ReportDetails';

// Lazy-loaded components
const DataCatalog = lazy(() => import("@/pages/data-catalog/DataCatalog"));
const XplorerPage = lazy(() => import("@/pages/data-catalog/XplorerPage"));
const DatasourceImport = lazy(() => import("@/pages/data-catalog/DatasourceImport"));
const Notebook = lazy(() => import("@/pages/data-catalog/Notebook"));

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
    {/* Route order matters! Put more specific paths after less specific paths */}
    <Route
      path={`${ROUTES.DATA_CATALOG}/xplorer`}
      element={
        <Suspense fallback={<LoadingFallback />}>
          <XplorerPage />
        </Suspense>
      }
    />
    <Route
      path={`${ROUTES.DATA_CATALOG}/xplorer/:reportId`}
      element={
        <Suspense fallback={<LoadingFallback />}>
          <ReportDetails />
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
    <Route
      path={`${ROUTES.DATA_CATALOG}/notebook`}
      element={
        <Suspense fallback={<LoadingFallback />}>
          <Notebook />
        </Suspense>
      }
    />
  </>
);

export default DataCatalogRoutes;
