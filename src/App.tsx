import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState, Suspense, lazy, useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { menuList } from './configration/menuList';
import kc from './configration/keycloak';
import { httpClient } from './configration/HttpClient';
import store from './Redux/store';

// Lazy-loaded components
const BuildDataPipeLine = lazy(() => import('./pages/BuildPipeline/BuildDataPipeLine'));
const DotLoader = lazy(() => import('./components/DotLoader'));
const RedirectToHome = lazy(() => import('./components/RediectToHome'));
const Landing = lazy(() => import('./pages/Portal/Landing'));
const DashBoard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog/Catalog'));
const Catalogs = lazy(() => import('./pages/Catalog/components/Catalogs'));
const Designer = lazy(() => import('./pages/Designer/Designer'));
const Designers = lazy(() => import('./pages/Designers/Designers'));
const OnboardLanding = lazy(() => import('./pages/OnBoardData/Components/OnboardLanding'));
const OnboardAllData = lazy(() => import('./pages/OnBoardData/OnboardAllData'));
const CodePipelineLanding = lazy(() => import('./pages/BuildPipeline/CodePipelineLanding'));
const BuildDataPipeLines = lazy(() => import('./pages/BuildPipeline/home/BuildDataPipeLine'));
const Userlanding = lazy(() => import('./pages/Admin-Console/Admin-Console'));
const DataOpsHub = lazy(() => import('./pages/DataOpsHub/DataOpsHub'));
const Dataops = lazy(() => import('./pages/Dataops/Dataops'));
const ShowingLogs = lazy(() => import('./pages/Dataops/ShowingLogs'));
const Alerts = lazy(() => import('./pages/Alerts/Alerts'));
const MonitorPage = lazy(() => import('./pages/Alerts/MonitorPage'));
const NoPage = lazy(() => import('./pages/Portal/NoPage'));
const Configure = lazy(() => import('./pages/Alerts/Configure'));
const Users = lazy(() => import('./pages/Admin-Console/Users/Users'));
const User = lazy(() => import('./pages/Admin-Console/Users/Component/User'));
const Customers = lazy(() => import('./pages/Admin-Console/Customer/Customers'));
const Customer = lazy(() => import('./pages/Admin-Console/Customer/component/Customer'));
const Projects = lazy(() => import('./pages/Admin-Console/Project/Environments'));
const AllProject = lazy(() => import('./pages/GithubProject/AllProject'));
const ProjectForm = lazy(() => import('./pages/GithubProject/ProjectForm'));
const Environment = lazy(() => import('./pages/Admin-Console/Project/Component/Environment'));
const PublishData = lazy(() => import('./pages/PublishData/PublishData'));
const Target = lazy(() => import('./pages/PublishData/Target'));
const RunquaryDetails = lazy(() => import('./pages/PublishData/RunquaryDetails'));
const PublishDataTable = lazy(() => import('./pages/PublishData/PublishDataTable'));
const CodePipelineTable = lazy(() => import('./pages/CodePipeline/CodePipelineTable'));
const CodePipelineData = lazy(() => import('./pages/CodePipeline/CodepipelineData'));
const Explorer = lazy(() => import('./pages/Explorer/Explorer'));
const ManageFlow = lazy(() => import('./pages/ManageFlow/ManageFlow'));
const FlowPlayGround = lazy(() => import('./pages/ManageFlow/FlowPlayGround'));


function App() {
  const [step, setStep] = useState<any>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const menuItems: any[] = menuList;
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
    { path: '/Designer/Build-Data-Pipe-Line', element: <BuildDataPipeLine /> },
    { path: '/Designer/Build Data Pipe Line', element: <BuildDataPipeLines /> },
    { path: '/', element: <RedirectToHome /> },
    { path: '/Landing', element: <Landing /> },
    { path: '/Home', element: <DashBoard /> },
    { path: '/Data-Config', element: <Home /> },
    { path: '/Data Catalog', element: <Catalog /> },
    { path: '/Catalog/Catalogs', element: <Catalogs /> },
    { path: '/Designer', element: <Designer /> },
    { path: '/Designers', element: <Designers /> },
    { path: '/Designer/Onboard-Data', element: <OnboardLanding handleBreadStep={handleBreadStep} /> },
    { path: '/Designer/Onboard Data', element: <OnboardAllData /> },
    { path: '/Designer/Build Data PipeLine', element: <CodePipelineLanding /> },
    { path: '/Admin Console', element: <Userlanding /> },
    { path: '/DataOps Hub/Dashboard', element: <DataOpsHub /> },
    { path: '/DataOps Hub/Ops Hub', element: <Dataops /> },
    { path: '/DataOps-Hub/Dataops/View-All-Log', element: <ShowingLogs /> },
    { path: '/Alerts', element: <Alerts /> },
    { path: '/Alerts/New Monitor', element: <MonitorPage /> },
    { path: '/Alerts/New Monitor/Monitor', element: <Configure /> },
    { path: '*', element: <NoPage /> },
    { path: '/Admin Console/Manage Data Platform Users', element: <Users /> },
    { path: '/Admin Console/Manage Data Platform Users/Add User', element: <User /> },
    { path: '/Admin Console/Manage Customer', element: <Customers /> },
    { path: '/Admin Console/Manage Customer/Add Customer', element: <Customer handleBreadStep={handleBreadStep} /> },
    { path: '/All Environment', element: <Projects /> },
    { path: '/All Projects', element: <AllProject /> },
    { path: '/All Projects/New', element: <ProjectForm /> },
    { path: '/Admin-Console/Environment/New', element: <Environment handleBreadStep={handleBreadStep} /> },
    { path: '/Designer/Publish Data', element: <PublishData /> },
    { path: '/Designer/targetsteps', element: <Target handleBreadStep={handleBreadStep} /> },
    { path: '/publisher/runquarydetails', element: <RunquaryDetails /> },
    { path: '/publisher/publishdatatable', element: <PublishDataTable /> },
    { path: '/Designer/Code Data Pipelines', element: <CodePipelineTable /> },
    { path: '/Designer/Codepipeline1', element: <CodePipelineData /> },
    { path: '/DataOps Hub/Explorer', element: <Explorer /> },
    { path: '/Designer/Manage Flow', element: <ManageFlow /> },
    { path: '/Designer/FlowPlayGround', element: <FlowPlayGround /> },
  ];

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Header onLogout={logout} step={step} />
        <Sidebar menuItems={menuItems} />
        <div className="content">
          <Suspense fallback={<DotLoader />}>
            <Routes>
              {routeList.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
