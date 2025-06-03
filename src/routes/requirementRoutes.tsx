import { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { LoadingFallback } from './LoadingFallback';

const RequirementDashboard = lazy(() => import("@/pages/designers/requirements/RequirementDashboard"));
const RequirementDetails = lazy(() => import("@/pages/designers/requirements/RequirementDetails"));
const RequirementForm = lazy(() => import("@/pages/designers/requirements/RequirementForm"));

export const RequirementRoutes = (
  <>
    <Route 
      path={ROUTES.DESIGNERS.REQUIREMENTS.INDEX} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <RequirementDashboard />
        </Suspense>
      } 
    />
    <Route 
      path="/designers/requirements/:id" 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <RequirementDetails />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.DESIGNERS.REQUIREMENTS.NEW} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <RequirementForm />
        </Suspense>
      } 
    />

  </>
);

export default RequirementRoutes;
