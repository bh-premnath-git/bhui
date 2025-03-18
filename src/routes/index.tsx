import { Route, Routes } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProtectedLayout from '@/components/ProtectedLayout';
import Navbar from '@/components/Navbar';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import { DataCatalogRoutes } from './dataCatalogRoutes';
import { DesignerRoutes } from './designerRoutes';
import { DataOpsRoutes } from './dataOpsRoutes';
import { AdminRoutes } from './adminRoutes';

export const AppRoutes = () => {
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

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        {/* Data Catalog Routes */}
        {DataCatalogRoutes}

        {/* Designer Routes */}
        {DesignerRoutes}

        {/* DataOps Routes */}
        {DataOpsRoutes}

        {/* Admin Routes */}
        {AdminRoutes}
      </Route>
      
      {/* Catch all not found routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
