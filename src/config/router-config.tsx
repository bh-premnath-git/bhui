import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { ROUTES } from './routes';

// Lazy load all pages
const NotFound = lazy(() => import('@/pages/NotFound'));
const DataCatalog = lazy(() => import('@/features/data-catalog/DataCatalog'));
const DesignerDashboard = lazy(() => import('@/features/designers/DesignerDashboard'));
const BuildDataPipeline = lazy(() => import('@/features/designers/BuildDataPipeline'));
const DataPipeCanvas = lazy(() => import('@/features/designers/DataPipelineCanvas'));
const ManageFlow = lazy(() => import('@/features/designers/ManageFlow'));
const FlowCanvas = lazy(() => import('@/features/designers/FlowCanvas'));
const DataOpsHub = lazy(() => import('@/features/dataops/DataOpsHub'));
const OpsHub = lazy(() => import('@/features/dataops/OpsHub'));
const AlertsHub = lazy(() => import('@/features/dataops/AlertsHub'));
const ReleaseBundle = lazy(() => import('@/features/dataops/ReleaseBundle'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminManage'));
const Users = lazy(() => import('@/pages/admin/user/UserList'));
const AddUser = lazy(() => import('@/pages/admin/user/UserAdd'));
const EditUser = lazy(() => import('@/pages/admin/user/UserEdit'));
const Projects = lazy(() => import('@/pages/admin/project/ProjectList'));
const AddProject = lazy(() => import('@/features/admin/projects/pages/AddProject'));
const EditProject = lazy(() => import('@/features/admin/projects/pages/EditProject'));
const Environment = lazy(() => import('@/pages/admin/environment/EnvironmentList'));
const AddEnvironment = lazy(() => import('@/features/admin/environment/pages/AddEnvironment'));
const EditEnvironment = lazy(() => import('@/features/admin/environment/pages/EditEnvironment'));

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
  // Designer routes
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
  // DataOps routes
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
  // Project routes
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
  // Environment routes
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
    path: '*',
    element: <NotFound />
  }
];
