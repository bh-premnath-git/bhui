import { useState, Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import kc from './configration/keycloak';
import { httpClient } from './configration/HttpClient';
import store from './store/store';
import { createTheme, ThemeProvider } from '@mui/material';
// const BuildDataPipeLine = lazy(() => import('./oldpages/BuildPipeline/BuildDataPipeLine'));
const Catalog = lazy(() => import('./pages/catalog'));
const Catalogs = lazy(() => import('./components/Catalog/Catalogs'));
const Designer = lazy(() => import('./pages/designer'));
const DataOpsHub = lazy(() => import('@/pages/allDataOps'));
const Dataops = lazy(() => import('@/pages/allDataOps'));
const ShowingLogs = lazy(() => import('./components/Dataops/ShowingLogs'));
const Alerts = lazy(() => import('@/pages/alerts'));
const MonitorPage = lazy(() => import('./components/Alert/MonitorPage'));
const Configure = lazy(() => import('./components/Alert/Configure'));
const ManageFlow = lazy(() => import('@/pages/manageFlow/FlowPlayGround'));

const Dashboard = lazy(() => import('@/pages/dashboard'));
const Loading = lazy(() => import('@/pages/loadingPage'));
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
const FlowPlayGround = lazy(() => import('@/components/FlowPlay'));
const DataCatalog = lazy(() => import('@/pages/dataCatalog/dataCatalog'));
const CatalogsSchema = lazy(() => import('@/pages/dataCatalog/catalogSchema'));
const AllUsers = lazy(() => import('@/pages/allUsers'));
const AddUser = lazy(() => import('@/pages/addUser'));
const AllCustomers = lazy(() => import('@/pages/allCustomers'));
const AddCustomers = lazy(() => import('@/pages/AddCustomers'));
const AllBuildDataPipeLine = lazy(() => import('@/pages/allBuildDataPipeLine'));
const BuildPlayGround = lazy(() => import('@/pages/buildPipeLine/buildPlayGround'));
const AllReleaseBundle = lazy(() => import('@/pages/allReleaseBundle'));
const CreateBundle = lazy(() => import('@/pages/createBundle'));
const ReleaseBundle = lazy(() => import('@/pages/releaseBundle'));
interface LayoutProps {
  isAuthenticated: boolean;
  logout: () => void;
}

const Layout = ({ isAuthenticated, logout }: LayoutProps) => (
  <div className="flex flex-col h-screen">
    <Header isAuthenticated={isAuthenticated} logout={logout} />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto overflow-x-hidden	 p-2 ml-16">
        <Outlet />
      </main>
    </div>
  </div>
);

function App() {
  const [step, setStep] = useState<any>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const keycloakInitialized = useRef(false);
  

  useEffect(() => {
    const initializeKeycloak = async () => {
      if (keycloakInitialized.current) {
        return;
      }

      keycloakInitialized.current = true;

      try {
        const authenticated = await kc.init({
          onLoad: 'login-required',
          checkLoginIframe: true,
          pkceMethod: 'S256',
        });

        if (authenticated) {
          setIsAuthenticated(true);
          sessionStorage.setItem('authenticated', 'true');
          sessionStorage.setItem('token', JSON.stringify(kc.token));
          httpClient.defaults.headers.common['Authorization'] = `Bearer ${kc.token}`;
          startTokenRefresh();
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak', error);
      }
    };

    initializeKeycloak();

    return () => {
      stopTokenRefresh();
    };
  }, []);

  // Function to start token refresh process
  const startTokenRefresh = () => {
    kc.onTokenExpired = () => {
      kc.updateToken(30) // Refresh token if it expires in the next 30 seconds
        .then((refreshed) => {
          if (refreshed) {
            sessionStorage.setItem('token', JSON.stringify(kc.token));
            httpClient.defaults.headers.common['Authorization'] = `Bearer ${kc.token}`;
          } else {
            console.warn('Token is still valid, no refresh needed');
          }
        })
        .catch(() => {
          console.error('Failed to refresh the token, or the session has expired');
          logout(); // Optionally, log out if the token cannot be refreshed
        });
    };
  };

  // Function to stop token refresh process
  const stopTokenRefresh = () => {
    kc.clearToken();
  };

  function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authenticated');
    kc.logout({
      // redirectUri: 'http://54.157.234.126:5000/landing',
      redirectUri: 'http://localhost:5000/dashboard',
    });
  }

  function handleBreadStep(step: any) {
    setStep(step);
  }

  const routeList = [
    { path: "/", element: <RedirectToDash /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/login", element: <Login /> },
    { path: "/admin-console", element: <AdminConsole /> },
    { path: "/admin-console/manage-users", element: <PageNotFound /> },
    { path: "/admin-console/manage-customer", element: <PageNotFound /> },
    { path: "/all-projects", element: <AllProjects /> },
    { path: "/all-projects/new", element: <ProjectCreate /> },
    { path: "/projects/:id", element: <ProjectEdit/>},
    { path: "/all-environment", element: <AllEnvironments /> },
    { path: "/all-environment/new", element: <EnvironmentCreate /> },
    { path: "/environments/:id", element: <EnvironmentEdit /> },
    { path: "/designer/manage-flow", element: <AllFlows /> },
    { path: '/designer/flow-playground', element: <ManageFlow /> },
    { path: "*", element: <PageNotFound /> },
    { path: '/data-catalog', element: <Catalog /> },
    { path: '/Catalog/Catalogs', element: <Catalogs /> },
    { path: '/Designer', element: <Designer /> },
    // { path: '/Designer/Build Data PipeLine', element: <CodePipelineLanding /> },
    { path: '/DataOps Hub/Dashboard', element: <DataOpsHub /> },
    { path: '/DataOps Hub/Ops Hub', element: <Dataops /> },
    { path: '/DataOps-Hub/Dataops/View-All-Log', element: <ShowingLogs /> },
    { path: '/Alerts', element: <Alerts /> },
    { path: '/Alerts/New Monitor', element: <MonitorPage /> },
    { path: '/Alerts/New Monitor/Monitor', element: <Configure /> },
    { path: '/Designer/Manage Flow', element: <FlowPlayGround /> },
    { path: '/DataCatalog', element: <DataCatalog /> },
    { path: '/DataCatalog/schema', element: <CatalogsSchema /> },
    { path: '/AllUsers', element: <AllUsers /> },
    { path: '/AddUser', element: <AddUser /> },
    { path: '/AllCustomers', element: <AllCustomers /> },
    { path: '/AddCustomers', element: <AddCustomers /> },
    { path: '/AllBuildDataPipeLine', element: <AllBuildDataPipeLine /> },
    { path: '/BuildPlayGround/:id', element: <BuildPlayGround /> },
    { path: '/BuildPlayGround', element: <BuildPlayGround /> },
    { path: '/dataops-hub/ops-hub', element: <Dataops /> },
    { path: '/AllDataOps', element: <Dataops /> },
    { path: '/AllReleaseBundle', element: <AllReleaseBundle /> },
    { path: '/bundle', element: <CreateBundle /> },
    { path: '/ReleaseBundle', element: <ReleaseBundle /> },
  ];


  const theme = createTheme({
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
      MuiSelect: { // For Select component font
        styleOverrides: {
          root: {
            fontFamily: 'Inter',
            fontSize:'15px',
            fontWeight:'normal'
          },
        },
      },
      MuiMenuItem: { // For each menu item font
        styleOverrides: {
          root: {
            fontFamily: 'Inter',
            fontSize:'15px'

          },
        },
      },

    }

  });

  return (
    <ThemeProvider theme={theme}>

      <Provider store={store}>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route element={<Layout isAuthenticated={isAuthenticated} logout={logout} />} >
                {routeList.map((route, index) => (
                  <Route key={`${index}-${route.path}`} path={route.path} element={route.element} />
                ))}
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
