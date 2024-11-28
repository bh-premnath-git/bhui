import { createTheme } from '@mui/material';
import { lazy } from 'react';
const Catalog = lazy(() => import('@/pages/catalog'));
const Catalogs = lazy(() => import('@/components/Catalog/Catalogs'));
const Designer = lazy(() => import('@/pages/designer'));
const DataOpsHub = lazy(() => import('@/pages/allDataOps'));
const Dataops = lazy(() => import('@/pages/allDataOps'));
const ShowingLogs = lazy(() => import('@/components/Dataops/ShowingLogs'));
const Alerts = lazy(() => import('@/pages/alerts'));
const MonitorPage = lazy(() => import('@/components/Alert/MonitorPage'));
const Configure = lazy(() => import('@/components/Alert/Configure'));
const ManageFlow = lazy(() => import('@/pages/manageFlow/FlowPlayGround'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Login = lazy(() => import('@/pages/login'));
const AdminConsole = lazy(() => import('@/pages/adminConsole'));
const AllProjects = lazy(() => import('@/pages/allProjects'));
const ProjectCreate = lazy(() => import('@/pages/projectCreate'));
const ProjectEdit = lazy(() => import('@/pages/projectEdit'));
const AllEnvironments = lazy(() => import('@/pages/allEnvironments'));
const EnvironmentCreate = lazy(() => import('@/pages/environmentCreate'));
const EnvironmentEdit = lazy(() => import('@/pages/environmentEdit'));
const AllFlows = lazy(() => import('@/pages/allFlows'));
const PageNotFound = lazy(() => import('@/pages/pageNotFound'));
const RedirectToDash = lazy(() => import('@/components/RedirectToDash'));
const DataCatalog = lazy(() => import('@/pages/dataCatalog/dataCatalog'));
const CatalogsSchema = lazy(() => import('@/pages/dataCatalog/catalogSchema'));
const AllUsers = lazy(() => import('@/pages/allUsers'));
const AddUser = lazy(() => import('@/pages/addUser'));
const EditUser = lazy(() => import('@/pages/editUser'));
const AllCustomers = lazy(() => import('@/pages/allCustomers'));
const AddCustomers = lazy(() => import('@/pages/AddCustomers'));
const EditCustomer = lazy(() => import('@/pages/EditCustomers'));
const AllBuildDataPipeLine = lazy(() => import('@/pages/allBuildDataPipeLine'));
const BuildPlayGround = lazy(() => import('@/pages/buildPipeLine/buildPlayGround'));
const AllReleaseBundle = lazy(() => import('@/pages/allReleaseBundle'));
const CreateBundle = lazy(() => import('@/pages/createBundle'));
const ReleaseBundle = lazy(() => import('@/pages/releaseBundle'));
export const routeList = [
    { path: "/", element: <RedirectToDash /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/login", element: <Login /> },
    { path: "/admin-console", element: <AdminConsole /> },
    { path: "/admin-console/manage-users", element: <PageNotFound /> },
    { path: "/admin-console/manage-customer", element: <PageNotFound /> },
    { path: "/admin-console/projects", element: <AllProjects /> },
    { path: "/admin-console/projects/new", element: <ProjectCreate /> },
    { path: "/admin-console/projects/:id", element: <ProjectEdit /> },
    { path: "/admin-console/environment", element: <AllEnvironments /> },
    { path: "/admin-console/environment/new", element: <EnvironmentCreate /> },
    { path: "/admin-console/environment/:id", element: <EnvironmentEdit /> },
    { path: "/designers/manage-flow", element: <AllFlows /> },
    { path: '/designers/manage-flow/:id', element: <ManageFlow /> },
    { path: "*", element: <PageNotFound /> },
    { path: '/data-catalog', element: <Catalog /> },
    { path: '/Catalog/Catalogs', element: <Catalogs /> },
    { path: '/designers', element: <Designer /> },
    { path: '/DataOps Hub/Dashboard', element: <DataOpsHub /> },
    { path: '/DataOps Hub/Ops Hub', element: <Dataops /> },
    { path: '/DataOps-Hub/Dataops/View-All-Log', element: <ShowingLogs /> },
    { path: '/Alerts', element: <Alerts /> },
    { path: '/dataops-hub/alerts', element: <Alerts /> },
    { path: '/Alerts/New Monitor', element: <MonitorPage /> },
    { path: '/Alerts/New Monitor/Monitor', element: <Configure /> },
    { path: '/DataCatalog', element: <DataCatalog /> },
    { path: '/DataCatalog/schema', element: <CatalogsSchema /> },
    { path: '/admin-console/users', element: <AllUsers /> },
    { path: '/admin-console/users/new', element: <AddUser /> },
    { path: '/admin-console/users/:id', element: <EditUser /> },
    { path: '/admin-console/customers', element: <AllCustomers /> },
    { path: '/admin-console/customers/new', element: <AddCustomers /> },
    { path: '/admin-console/customers/:id', element: <EditCustomer /> },
    { path: '/designers/build-datapipeline/', element: <AllBuildDataPipeLine /> },
    { path: '/designers/build-playground/:id', element: <BuildPlayGround /> },
    { path: '/designers/build-playground/', element: <BuildPlayGround /> },
    { path: '/dataops-hub/ops-hub', element: <Dataops /> },
    { path: '/AllDataOps', element: <Dataops /> },
    { path: '/dataops-hub/release-bundle', element: <AllReleaseBundle /> },
    { path: '/dataops-hub/release-bundle/new', element: <CreateBundle /> },
    { path: '/ReleaseBundle', element: <ReleaseBundle /> },
  ];

  export const theme = createTheme({
    typography: {
      fontFamily: 'Inter ',
    },
    components: {

      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: 'Inter',
            textTransform: 'none',
          },
        }
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: 'Inter',
          }
        }
      },
      MuiSelect: { 
        styleOverrides: {
          root: {
            fontFamily: 'Inter',
            fontSize: '15px',
            fontWeight: 'normal'
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: 'Inter',
            fontSize: '15px'

          },
        },
      },

    }

  });