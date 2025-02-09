import { lazy, Suspense } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import Loading from "@/components/lazy-loading/Loading";

const DataCatalog = lazy(() => import("@/pages/data-catalog"));
const Xplore = lazy(() => import("@/pages/data-catalog/xplorer"));
const SavedDashboard = lazy(() => import("@/pages/saved-dashboard"));

const Designer = lazy(() => import("@/pages/designers/designers"));
const BuildDataPipeline = lazy(() => import("@/pages/designers/build-data-pipeline"));
const BuildPlayGround = lazy(() => import("@/pages/designers/build-playground"));
const ManageFlow = lazy(() => import("@/pages/designers/manage-flow"));
const FlowPlayGround = lazy(() => import("@/pages/designers/floe-playground"));

const OpsHub = lazy(() => import("@/pages/dataops-hub/ops-hub"));
const AlertsHub = lazy(() => import("@/pages/dataops-hub/alerts-hub"));
const ManageReleases = lazy(() => import("@/pages/dataops-hub/manage-releases"));

const AdminConsole = lazy(() => import("@/pages/admin-console/admin-console"));
const ManageUsers = lazy(() => import("@/pages/admin-console/manage-users/user"));
const AddUser = lazy(() => import("@/pages/admin-console/manage-users/add-user"));
const EditUser = lazy(() => import("@/pages/admin-console/manage-users/edit-user"));
const ManageProjects = lazy(() => import("@/pages/admin-console/manage-projects/projects"));
const AddProject = lazy(() => import("@/pages/admin-console/manage-projects/add-project"));
const EditProject = lazy(() => import("@/pages/admin-console/manage-projects/edit-project"));
const ManageEnvironments = lazy(() => import("@/pages/admin-console/manage-environments/environments"));
const AddEnvironment = lazy(() => import("@/pages/admin-console/manage-environments/add-environment"));
const EditEnvironment = lazy(() => import("@/pages/admin-console/manage-environments/edit-environment"));

const Dashboard = lazy(() => import("@/pages/dataops-hub/dashboard"));
const PageNotFound = lazy(() => import("@/pages/NotFound"));

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent = ({ children }: MainContentProps) => (
  <main className="flex-1 overflow-auto p-1 bg-background">
    {children}
  </main>
);

export const AppLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <MainContent>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/data-catalog" element={<DataCatalog />} />
              <Route path="data-catalog/xplore" element={<Xplore />} />
              <Route path="/saved-dashboard/:id" element={<SavedDashboard />} />

              <Route path="/designers" element={<Designer />} />
              <Route path="/designers/build-datapipeline" element={<BuildDataPipeline />} />
              <Route path="/designers/build-playground/:id" element={<BuildPlayGround />} />
              <Route path="/designers/manage-flow" element={<ManageFlow />} />
              <Route path="/designers/flow-playground:id" element={<FlowPlayGround />} />

              <Route path="/dataops-hub/ops-hub" element={<OpsHub />} />
              <Route path="/dataops-hub/alerts" element={<AlertsHub />} />
              <Route path="/dataops-hub/release-bundle" element={<ManageReleases />} />

              <Route path="/admin-console" element={<AdminConsole />} />
              <Route path="/admin-console/users" element={<ManageUsers />} />
              <Route path="/admin-console/users/add" element={<AddUser />} />
              <Route path="/admin-console/users/:id" element={<EditUser />} />
              <Route path="/admin-console/projects" element={<ManageProjects />} />
              <Route path="/admin-console/projects/add" element={<AddProject />} />
              <Route path="/admin-console/projects/:id" element={<EditProject />} />
              <Route path="/admin-console/environment" element={<ManageEnvironments />} />
              <Route path="/admin-console/environment/add" element={<AddEnvironment />} />
              <Route path="/admin-console/environment/:id" element={<EditEnvironment />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </MainContent>
      </div>
    </div>
  );
};