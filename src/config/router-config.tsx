import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { ROUTES } from './routes';

// Lazy load all pages
const NotFound = lazy(() => import('@/pages/NotFound'));
const DataCatalog = lazy(() => import('@/pages/data-catalog'));
const XplorerPage = lazy(() => import('@/pages/data-catalog/XplorerPage'));
const DatasourceImport = lazy(() => import('@/pages/data-catalog/DatasourceImport'));
const DesignerDashboard = lazy(() => import('@/pages/designers/DesignerDashboard'));
const BuildDataPipeline = lazy(() => import('@/pages/designers/BuildDataPipeline'));
const DataPipeCanvas = lazy(() => import('@/pages/designers/DataPipelineCanvas'));
const ManageFlow = lazy(() => import('@/pages/designers/ManageFlow'));
const FlowCanvas = lazy(() => import('@/pages/designers/FlowCanvas'));
const DataOpsHub = lazy(() => import('@/pages/dataops/DataopsHub'));
const OpsHub = lazy(() => import('@/pages/dataops/OpsHub'));
const AlertsHub = lazy(() => import('@/pages/dataops/AlertsHub'));
const ReleaseBundle = lazy(() => import('@/pages/dataops/ReleaseBundle'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminManage'));
const Users = lazy(() => import('@/pages/admin/user/UserList'));
const AddUser = lazy(() => import('@/pages/admin/user/UserAdd'));
const EditUser = lazy(() => import('@/pages/admin/user/UserEdit'));
const Projects = lazy(() => import('@/pages/admin/project/ProjectList'));
const AddProject = lazy(() => import('@/pages/admin/project/ProjeAdd'));
const EditProject = lazy(() => import('@/pages/admin/project/ProjectEdit'));
const Environment = lazy(() => import('@/pages/admin/environment/EnvironmentList'));
const AddEnvironment = lazy(() => import('@/pages/admin/environment/EnvironmentAdd'));
const EditEnvironment = lazy(() => import('@/pages/admin/environment/EnvironmentEdit'));
const Connection = lazy(() => import('@/pages/admin/connection/ConnectionList'));
const AddConnection = lazy(() => import ('@/pages/admin/connection/ConnectionAdd'));
const EditConnection = lazy(() => import('@/pages/admin/connection/COnnectionEdit'));

export const routerConfig: RouteObject[] = [
  {
    path: ROUTES.INDEX,
    element: <Navigate to={ROUTES.DATAOPS.INDEX} replace={true} />,
  },
  {
    path: ROUTES.LOGIN,
    element: <Navigate to={ROUTES.DATAOPS.INDEX} replace={true} />,
  },
  {
    path: ROUTES.DATA_CATALOG,
    element: <DataCatalog />
  },
  {
    path: `${ROUTES.DATA_CATALOG}/xplorer`,
    element: <XplorerPage />
  },
  {
    path: `${ROUTES.DATA_CATALOG}/datasource-import`,
    element: <DatasourceImport />
  },
  {
    path: ROUTES.DESIGNERS.INDEX,
    element: <DesignerDashboard />
  },
  {
    path: ROUTES.DESIGNERS.BUILD_PIPELINE,
    element: <BuildDataPipeline />
  },
  {
    path: ROUTES.DESIGNERS.BUILD_PLAYGROUND(':id'),
    element: <DataPipeCanvas />
  },
  {
    path: ROUTES.DESIGNERS.MANAGE_FLOW,
    element: <ManageFlow />
  },
  {
    path: ROUTES.DESIGNERS.FLOW_PLAYGROUND(':id'),
    element: <FlowCanvas />
  },
  {
    path: ROUTES.DATAOPS.INDEX,
    element: <DataOpsHub />
  },
  {
    path: ROUTES.DATAOPS.OPS_HUB,
    element: <OpsHub />
  },
  {
    path: ROUTES.DATAOPS.ALERTS,
    element: <AlertsHub />
  },
  {
    path: ROUTES.DATAOPS.RELEASE,
    element: <ReleaseBundle />
  },
  // Admin routes
  {
    path: ROUTES.ADMIN.INDEX,
    element: <AdminDashboard />
  },
  // User routes
  {
    path: ROUTES.ADMIN.USERS.INDEX,
    element: <Users />
  },
  {
    path: ROUTES.ADMIN.USERS.ADD,
    element: <AddUser />
  },
  {
    path: ROUTES.ADMIN.USERS.EDIT(':id'),
    element: <EditUser />
  },
  {
    path: ROUTES.ADMIN.PROJECTS.INDEX,
    element: <Projects />
  },
  {
    path: ROUTES.ADMIN.PROJECTS.ADD,
    element: <AddProject />
  },
  {
    path: ROUTES.ADMIN.PROJECTS.EDIT(':id'),
    element: <EditProject />
  },
  {
    path: ROUTES.ADMIN.ENVIRONMENT.INDEX,
    element: <Environment />
  },
  {
    path: ROUTES.ADMIN.ENVIRONMENT.ADD,
    element: <AddEnvironment />
  },
  {
    path: ROUTES.ADMIN.ENVIRONMENT.EDIT(':id'),
    element: <EditEnvironment />
  },
  {
    path: ROUTES.ADMIN.CONNECTION.INDEX,
    element: <Connection />
  },
  {
    path: ROUTES.ADMIN.CONNECTION.ADD,
    element: <AddConnection />
  },
  {
    path: ROUTES.ADMIN.CONNECTION.EDIT(':id'),
    element: <EditConnection />
  },
  {
    path: '*',
    element: <NotFound />
  }
];
