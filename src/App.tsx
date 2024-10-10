import { useState, Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import kc from './configration/keycloak';
import { httpClient } from './configration/HttpClient';
import store from './store/store';
import { createTheme, ThemeProvider } from '@mui/material';

const BuildDataPipeLine = lazy(() => import('./oldpages/BuildPipeline/BuildDataPipeLine'));
const Landing = lazy(() => import('./oldpages/Portal/Landing'));
const DashBoard = lazy(() => import('./oldpages/Dashboard/Dashboard'));
const Home = lazy(() => import('./oldpages/Home'));
const Catalog = lazy(() => import('./oldpages/Catalog/Catalog'));
const Catalogs = lazy(() => import('./oldpages/Catalog/components/Catalogs'));
const Designer = lazy(() => import('./oldpages/Designer/Designer'));
const Designers = lazy(() => import('./oldpages/Designers/Designers'));
const OnboardLanding = lazy(() => import('./oldpages/OnBoardData/Components/OnboardLanding'));
const OnboardAllData = lazy(() => import('./oldpages/OnBoardData/OnboardAllData'));
const CodePipelineLanding = lazy(() => import('./oldpages/BuildPipeline/CodePipelineLanding'));
const BuildDataPipeLines = lazy(() => import('./oldpages/BuildPipeline/home/BuildDataPipeLine'));
const DataOpsHub = lazy(() => import('./oldpages/DataOpsHub/DataOpsHub'));
const Dataops = lazy(() => import('./oldpages/Dataops/Dataops'));
const ShowingLogs = lazy(() => import('./oldpages/Dataops/ShowingLogs'));
const Alerts = lazy(() => import('./oldpages/Alerts/Alerts'));
const MonitorPage = lazy(() => import('./oldpages/Alerts/MonitorPage'));
const Configure = lazy(() => import('./oldpages/Alerts/Configure'));
const PublishData = lazy(() => import('./oldpages/PublishData/PublishData'));
const Target = lazy(() => import('./oldpages/PublishData/Target'));
const RunquaryDetails = lazy(() => import('./oldpages/PublishData/RunquaryDetails'));
const PublishDataTable = lazy(() => import('./oldpages/PublishData/PublishDataTable'));
const CodePipelineTable = lazy(() => import('./oldpages/CodePipeline/CodePipelineTable'));
const CodePipelineData = lazy(() => import('./oldpages/CodePipeline/CodepipelineData'));
const Explorer = lazy(() => import('./oldpages/Explorer/Explorer'));
const ManageFlow = lazy(() => import('@/pages/manageFlow/FlowPlayGround'));

const Dashboard = lazy(() => import('@/pages/dashboard'));
const Loading = lazy(() => import('@/pages/loadingPage'));
const Login = lazy(() => import('@/pages/login'));
const AdminConsole = lazy(() => import('@/pages/adminConsole'));
const AllProjects = lazy(() => import('@/pages/allProjects'));
const ProjectCreate = lazy(() => import('@/pages/projectCreate'));
const AllEnvironments = lazy(() => import('@/pages/allEnvironments'));
const EnvironmentCreate = lazy(() => import('@/pages/environmentCreate'));
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
interface LayoutProps {
  isAuthenticated: boolean;
  logout: () => void;
}

const Layout = ({ isAuthenticated, logout }: LayoutProps) => (
  <div className="flex flex-col h-screen">
    <Header isAuthenticated={isAuthenticated} logout={logout} />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto p-2 ml-16">
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
      redirectUri: 'http://localhost:5000/landing',
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
    { path: "/all-environment", element: <AllEnvironments /> },
    { path: "/all-environment/new", element: <EnvironmentCreate /> },
    { path: "/designer/manage-flow", element: <AllFlows /> },
    { path: '/designer/flow-playground', element: <ManageFlow /> },
    { path: "*", element: <PageNotFound /> },
    { path: '/Designer/Build-Data-Pipe-Line', element: <BuildDataPipeLine /> },
    { path: '/Designer/BuildDataPipeLine', element: <BuildDataPipeLines /> },
    { path: '/Landing', element: <Landing /> },
    { path: '/Home', element: <DashBoard /> },
    { path: '/Data-Config', element: <Home /> },
    { path: '/data-catalog', element: <Catalog /> },
    { path: '/Catalog/Catalogs', element: <Catalogs /> },
    { path: '/Designer', element: <Designer /> },
    { path: '/Designers', element: <Designers /> },
    { path: '/Designer/Onboard-Data', element: <OnboardLanding handleBreadStep={handleBreadStep} /> },
    { path: '/Designer/Onboard Data', element: <OnboardAllData /> },
    { path: '/Designer/Build Data PipeLine', element: <CodePipelineLanding /> },
    { path: '/DataOps Hub/Dashboard', element: <DataOpsHub /> },
    { path: '/DataOps Hub/Ops Hub', element: <Dataops /> },
    { path: '/DataOps-Hub/Dataops/View-All-Log', element: <ShowingLogs /> },
    { path: '/Alerts', element: <Alerts /> },
    { path: '/Alerts/New Monitor', element: <MonitorPage /> },
    { path: '/Alerts/New Monitor/Monitor', element: <Configure /> },
    { path: '/Designer/Publish Data', element: <PublishData /> },
    { path: '/Designer/targetsteps', element: <Target handleBreadStep={handleBreadStep} /> },
    { path: '/publisher/runquarydetails', element: <RunquaryDetails /> },
    { path: '/publisher/publishdatatable', element: <PublishDataTable /> },
    { path: '/Designer/Code Data Pipelines', element: <CodePipelineTable /> },
    { path: '/Designer/Codepipeline1', element: <CodePipelineData /> },
    { path: '/DataOps Hub/Explorer', element: <Explorer /> },
    { path: '/Designer/Manage Flow', element: <FlowPlayGround /> },
    { path: '/DataCatalog', element: <DataCatalog /> },
    { path: '/DataCatalog/schema', element: <CatalogsSchema /> },
    { path: '/AllUsers', element: <AllUsers /> },
    { path: '/AddUser', element: <AddUser /> },
    { path: '/AllCustomers', element: <AllCustomers /> },
    { path: '/AddCustomers', element: <AddCustomers /> },
    { path: '/AllBuildDataPipeLine', element: <AllBuildDataPipeLine /> },
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
