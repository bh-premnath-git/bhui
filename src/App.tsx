import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { menuList } from './configration/menuList'
import SignInPage from './pages/SignInPage'
import DashBoard from './pages/Dashboard/Dashboard'
import Landing from './pages/portal/Landing'
import Catalog from './pages/catalog/Catalog'
import Catalogs from './pages/catalog/components/Catalogs'
import Designer from './pages/Disigner/Designer'
import OnboardAllData from './pages/OnBoardData/OnboardAllData'
import OnboardLanding from './pages/OnBoardData/Components/OnboardLanding'
import CodePipelineLanding from './pages/BuildPipeline/CodePipelineLanding'
import VisualEtlHeader from './pages/BuildPipeline/components/VisualEtlHeader'
import Userlanding from './pages/Admin-Console/Admin-Console'
import Dataops from './pages/Dataops/Dataops'
import ShowingLogs from './pages/Dataops/ShowingLogs'
import Alerts from './pages/Alerts/Alerts'
import MonitorPage from './pages/Alerts/MonitorPage'
import NoPage from './pages/portal/NoPage'
import Keycloak from 'keycloak-js';
import { httpClient } from './configration/HttpClient'
import { useState } from 'react'
import Users from './pages/Admin-Console/Users/Users'
import User from './pages/Admin-Console/Users/Component/User'
import Customers from './pages/Admin-Console/Customer/Customers'
import Customer from './pages/Admin-Console/Customer/component/Customer'
import Projects from './pages/Admin-Console/Project/Projects'
import Project from './pages/Admin-Console/Project/Component/Project'
import PublishData from './pages/PublishData/PublishData'
import Target from './pages/PublishData/Target'
import RunquaryDetails from './pages/PublishData/RunquaryDetails'
import DeliveryOptionsStep from './pages/PublishData/DeliveryOptionsStep'
import PublishDataTable from './pages/PublishData/PublishDataTable'
import CodePipelineTable from './pages/CodePipeline/CodePipelineTable'
import CodePipelineData from './pages/CodePipeline/CodepipelineData'
import Home1 from './pages/Explorer/home'
import { Explore } from '@mui/icons-material'
import Explorer from './pages/Explorer/Explorer'
import QueryDatasetComponent from './pages/Explorer/QueryDataset'
import DotLoader from './components/DotLoader'
import Configure from './pages/Alerts/Configure'
import DataOpsHub from './pages/DataOpsHub/dataOpsHub'

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
      /* Remove below logs if you are using this on production */
      console.info("Authenticated");
      console.log('auth', auth);
      console.log('Keycloak', kc);
      console.log('Access Token', kc.token);

      // Set flag indicating successful authentication
      sessionStorage.setItem('authenticated', 'true');
      sessionStorage.setItem('token', JSON.stringify(kc!.token!));

      /* http client will use this header in every request it sends */
      httpClient.defaults.headers.common['Authorization'] = `Bearer ${kc.token}`;
      window.location.href = '/landing';
      // alert(3)
      kc.onTokenExpired = () => {
        console.log('token expired');
      }
    }
  }, () => {
    /* Notify the user if necessary */
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
    // let kc = new Keycloak(initOptions);

    kc.init({
      onLoad: 'login-required', // Supported values: 'check-sso' , 'login-required'
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
  return (
    <>
      <BrowserRouter>
        <Header onLogout={logout} step={step} />
        <Sidebar menuItems={menuItems} />
        <div className='content'>
          <Routes>
            <Route>
              <Route path="/" element={<DotLoader />} />
              <Route path="/Landing" element={<Landing />} />
              <Route path="/Home" element={<DashBoard />} />
              <Route path="/Data-Config" element={<Home />} />
              <Route path="/Data Catalog" element={<Catalog />} />
              <Route path="/Catalog/Catalogs" element={<Catalogs />} />
              <Route path="/Designer" element={<Designer />} />
              <Route path="/Designer/Onboard-Data" element={<OnboardLanding handleBreadStep={handleBreadStep}/>} />
              <Route path="/Designer/Onboard Data" element={<OnboardAllData />} />
              <Route path="/Designer/Build Data PipeLine" element={<CodePipelineLanding />} />
              <Route path="/Designer/BuildPipeLine/new" element={<VisualEtlHeader />} />
              <Route path="/Admin Console" element={<Userlanding />} />
              <Route path="/DataOps Hub/Dashboard" element={<DataOpsHub />} />
              <Route path="/DataOps Hub/Ops Hub" element={<Dataops />} />
              <Route path="/DataOps-Hub/Dataops/View-All-Log" element={<ShowingLogs />} />
              <Route path="/Alerts" element={<Alerts />} />
              <Route path="/Alerts/New Monitor" element={<MonitorPage />} />
              <Route path="/Alerts/New Monitor/Monitor" element={<Configure />} />
              <Route path="*" element={<NoPage />} />
              <Route path="/Admin Console/Manage Data Platform Users" element={<Users />} />
              <Route path="/Admin Console/Manage Data Platform Users/Add User" element={<User />} />
              <Route path="/Admin Console/Manage Customer" element={<Customers />} />
              <Route path="/Admin Console/Manage Customer/Add Customer" element={<Customer handleBreadStep={handleBreadStep}/>} />
              <Route path="/All Projects" element={<Projects />} />
              <Route path="/Admin-Console/Projects/New" element={<Project handleBreadStep={handleBreadStep} />} />
              <Route path="/Designer/Publish Data" element={<PublishData />} />
              <Route path="/Designer/targetsteps" element={<Target handleBreadStep={handleBreadStep}/>} />
              <Route path="/publisher/runquarydetails" element={<RunquaryDetails />} />
              <Route path="/publisher/publishdatatable" element={<PublishDataTable />} />
              <Route path="/Designer/Code Data Pipelines" element={<CodePipelineTable />} />
              <Route path="/Designer/Codepipeline1" element={<CodePipelineData />} />
              <Route path="/DataOps Hub/Explorer" element={<Explorer />} />

              {/* <Route path="/query-dataset" element={<QueryDatasetComponent/>} /> */}
              </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
