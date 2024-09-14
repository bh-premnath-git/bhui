import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { menuList } from './configration/menuList'
import Keycloak from 'keycloak-js';
import { httpClient } from './configration/HttpClient'
import { useState, Suspense, lazy } from 'react'

import { Provider } from 'react-redux'
import store from './redux/store'
import { elements } from 'chart.js'

const BuildDataPipeLine = lazy(() => import('./pages/BuildPipeline/BuildDataPipeLine'));
const DotLoader = lazy(() => import('./components/DotLoader'));
const Landing = lazy(() => import('./pages/portal/Landing'));
const DashBoard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/catalog/Catalog'));
const Catalogs = lazy(() => import('./pages/catalog/components/Catalogs'));
const Designer = lazy(() => import('./pages/Disigner/Designer'));
const Designers = lazy(() => import('./pages/Disigners/Designers'));
const OnboardLanding = lazy(() => import('./pages/OnBoardData/Components/OnboardLanding'));
const OnboardAllData = lazy(() => import('./pages/OnBoardData/OnboardAllData'));
const CodePipelineLanding = lazy(() => import('./pages/BuildPipeline/CodePipelineLanding'));
const BuildDataPipeLines = lazy(() => import('./pages/BuildPipeline/home/BuildDataPipeLine'));
// const VisualEtlHeader = lazy(() => import('./pages/BuildPipeline/components/VisualEtlHeader'));
const Userlanding = lazy(() => import('./pages/Admin-Console/Admin-Console'));
const DataOpsHub = lazy(() => import('./pages/DataOpsHub/dataOpsHub'));
const Dataops = lazy(() => import('./pages/Dataops/Dataops'));
const ShowingLogs = lazy(() => import('./pages/Dataops/ShowingLogs'));
const Alerts = lazy(() => import('./pages/Alerts/Alerts'));
const MonitorPage = lazy(() => import('./pages/Alerts/MonitorPage'));
const NoPage = lazy(() => import('./pages/portal/NoPage'));
const Configure = lazy(() => import('./pages/Alerts/Configure'));
const Users = lazy(() => import('./pages/Admin-Console/Users/Users'));
const User = lazy(() => import('./pages/Admin-Console/Users/Component/User'));
const Customers = lazy(() => import('./pages/Admin-Console/Customer/Customers'));
const Customer = lazy(() => import('./pages/Admin-Console/Customer/component/Customer'));
const Projects = lazy(() => import('./pages/Admin-Console/Project/Environments'));
const AllProject = lazy(() => import('./pages/github-project/AllProject'));
const ProjectForm = lazy(() => import('./pages/github-project/ProjectForm'));
const Environment = lazy(() => import('./pages/Admin-Console/Project/Component/Environment'));
const PublishData = lazy(() => import('./pages/PublishData/PublishData'));
const Target = lazy(() => import('./pages/PublishData/Target'));
const RunquaryDetails = lazy(() => import('./pages/PublishData/RunquaryDetails'));
const PublishDataTable = lazy(() => import('./pages/PublishData/PublishDataTable'));
const CodePipelineTable = lazy(() => import('./pages/CodePipeline/CodePipelineTable'));
const CodePipelineData = lazy(() => import('./pages/CodePipeline/CodepipelineData'));
const Explorer = lazy(() => import('./pages/Explorer/Explorer'));
const ManageFlow = lazy(() => import('./pages/ManageFlow/ManageFlow'));

let initOptions = {
  url: 'http://localhost:8080/',
  realm: 'bighammer-realm',
  clientId: 'bighammer-ui',
}
let kc = new Keycloak(initOptions);
if (!sessionStorage.getItem('authenticated')) {
  kc.init({
    onLoad: 'login-required', // Supported values: 'check-sso' , 'login-required'
    checkLoginIframe: true,
    pkceMethod: 'S256'
  }).then((auth) => {
    if (!auth) {
      // window.location.reload();
    } else {
      console.info("Authenticated");
      console.log('auth', auth);
      console.log('Keycloak', kc);
      console.log('Access Token', kc.token);

      sessionStorage.setItem('authenticated', 'true');
      sessionStorage.setItem('token', JSON.stringify(kc!.token!));

      httpClient.defaults.headers.common['Authorization'] = `Bearer ${kc.token}`;
      window.location.href = '/Home';
      kc.onTokenExpired = () => {
        console.log('token expired');
      }
    }
  }, () => {
    console.error("Authentication Failed");
  });
}

function App() {
  const [infoMessage, setInfoMessage] = useState('');
  const [step, setStep] = useState<any>();

  const callBackend = () => {
    httpClient.get('https://mockbin.com/request')
  };

  const menuItems: any[] = menuList;

  async function logout() {
    kc.init({
      onLoad: 'login-required',
      checkLoginIframe: true,
      pkceMethod: 'S256'
    }).then((auth) => {
      if (auth) {
        console.log('Authenticated');
      } else {
        console.log('Not authenticated');
      }
    }, () => {
      console.error("Authentication Failed");
    })
    await sessionStorage.removeItem('token');
    await sessionStorage.removeItem('authenticated');

    await kc.logout({
      redirectUri: 'http://localhost:5000/landing'
    });
  }

  function handleBreadStep(step: any) {
    setStep(step);
  }
  const routeList = [
    { path: "/Designer/Build-Data-Pipe-Line", element: <BuildDataPipeLine/> },
    { path: "/Designer/Build Data Pipe Line", element: <BuildDataPipeLines/> },
    { path: "/", element: <DotLoader/> },
    { path: "/Landing", element: <Landing/> },
    { path: "/Home", element: <DashBoard/> },
    { path: "/Data-Config", element: <Home/> },
    { path: "/Data Catalog", element: <Catalog/> },
    { path: "/Catalog/Catalogs", element: <Catalogs/> },
    { path: "/Designer", element: <Designer/> },
    { path: "/Designers", element: <Designers/> },
    { path: "/Designer/Onboard-Data", element: <OnboardLanding handleBreadStep={handleBreadStep}/> },
    { path: "/Designer/Onboard Data", element: <OnboardAllData/> },
    { path: "/Designer/Build Data PipeLine", element: <CodePipelineLanding/> },
    // { path: "/Designer/BuildPipeLine/new", element: <VisualEtlHeader/> },
    { path: "/Admin Console", element: <Userlanding/> },
    { path: "/DataOps Hub/Dashboard", element: <DataOpsHub/> },
    { path: "/DataOps Hub/Ops Hub", element: <Dataops/> },
    { path: "/DataOps-Hub/Dataops/View-All-Log", element: <ShowingLogs/> },
    { path: "/Alerts", element: <Alerts/> },
    { path: "/Alerts/New Monitor", element: <MonitorPage/> },
    { path: "/Alerts/New Monitor/Monitor", element: <Configure/> },
    { path: "*", element: <NoPage/> },
    { path: "/Admin Console/Manage Data Platform Users", element: <Users/> },
    { path: "/Admin Console/Manage Data Platform Users/Add User", element: <User/> },
    { path: "/Admin Console/Manage Customer", element: <Customers/> },
    { path: "/Admin Console/Manage Customer/Add Customer", element: <Customer handleBreadStep={handleBreadStep}/> },
    { path: "/All Environment", element: <Projects/> },
    { path: "/All Projects", element: <AllProject/> },
    { path: "/All Projects/New", element: <ProjectForm/> },
    { path: "/Admin-Console/Environment/New", element: <Environment handleBreadStep={handleBreadStep}/> },
    { path: "/Designer/Publish Data", element: <PublishData/> },
    { path: "/Designer/targetsteps", element: <Target handleBreadStep={handleBreadStep}/> },
    { path: "/publisher/runquarydetails", element: <RunquaryDetails/> },
    { path: "/publisher/publishdatatable", element: <PublishDataTable/> },
    { path: "/Designer/Code Data Pipelines", element: <CodePipelineTable/> },
    { path: "/Designer/Codepipeline1", element: <CodePipelineData/> },
    { path: "/DataOps Hub/Explorer", element: <Explorer/> },
    { path: "/Designer/Manage Flow", element: <ManageFlow/> },
  ];
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Header onLogout={logout} step={step} />
        <Sidebar menuItems={menuItems} />
        <div className='content'>
          <Suspense fallback={<DotLoader />}>
            <Routes>
              {routeList.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </Provider>
  )
}

export default App
