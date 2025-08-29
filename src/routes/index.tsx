import { Route, Routes } from 'react-router-dom';
import { useMemo } from 'react';
import { ROUTES } from '@/config/routes';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProtectedLayout from '@/components/ProtectedLayout';
import Navbar from '@/components/Navbar';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import { HomeRoutes } from './homeRoutes';
import { DataCatalogRoutes } from './dataCatalogRoutes';
import { DesignerRoutes } from './designerRoutes';
import { DataOpsRoutes } from './dataOpsRoutes';
import { AdminRoutes } from './adminRoutes';
import { RequirementRoutes } from './requirementRoutes'

export const AppRoutes = () => {
  const protectedRoutes = useMemo(() => (
    <>
      {HomeRoutes}
      {DataCatalogRoutes}
      {DesignerRoutes}
      {DataOpsRoutes}
      {AdminRoutes}
      {RequirementRoutes}
    </>
  ), []);

  return (
    <Routes>
      <Route
        path={ROUTES.INDEX}
        element={
          <>
            <Navbar />
            <div className="flex-1">
              <Index />
            </div>
          </>
        }
      />
      <Route path={ROUTES.LOGIN} element={<Login />} />

      {/* Tenant-specific route - shows same content as root but allows tenant extraction */}
      <Route
        path="/tenant/:tenantId"
        element={
          <>
            <Navbar />
            <div className="flex-1">
              <Index />
            </div>
          </>
        }
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        {protectedRoutes}

      </Route>
      
      {/* Catch all not found routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
