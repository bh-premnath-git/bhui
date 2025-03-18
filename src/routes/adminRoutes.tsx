import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { LoadingFallback } from './LoadingFallback';

// Lazy-loaded components
const AdminDashboard = lazy(() => import("@/pages/admin/AdminManage"));
const Users = lazy(() => import("@/pages/admin/user/UserList"));
const AddUser = lazy(() => import("@/pages/admin/user/UserAdd"));
const EditUser = lazy(() => import("@/pages/admin/user/UserEdit"));
const Projects = lazy(() => import("@/pages/admin/project/ProjectList"));
const AddProject = lazy(() => import("@/pages/admin/project/ProjectAdd"));
const EditProject = lazy(() => import("@/pages/admin/project/ProjectEdit"));
const Environment = lazy(() => import("@/pages/admin/environment/EnvironmentList"));
const AddEnvironment = lazy(() => import("@/pages/admin/environment/EnvironmentAdd"));
const EditEnvironment = lazy(() => import("@/pages/admin/environment/EnvironmentEdit"));
const Connection = lazy(() => import("@/pages/admin/connection/ConnectionList"));
const AddConnection = lazy(() => import("@/pages/admin/connection/ConnectionAdd"));
const EditConnection = lazy(() => import("@/pages/admin/connection/ConnectionEdit"));

export const AdminRoutes = (
  <>
    <Route 
      path={ROUTES.ADMIN.INDEX} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminDashboard />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.ADMIN.USERS.INDEX} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <Users />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.ADMIN.USERS.ADD} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <AddUser />
        </Suspense>
      } 
    />
    <Route 
      path="/admin-console/users/edit/:id" 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <EditUser />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.ADMIN.PROJECTS.INDEX} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <Projects />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.ADMIN.PROJECTS.ADD} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <AddProject />
        </Suspense>
      } 
    />
    <Route 
      path="/admin-console/projects/edit/:id" 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <EditProject />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.ADMIN.ENVIRONMENT.INDEX} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <Environment />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.ADMIN.ENVIRONMENT.ADD} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <AddEnvironment />
        </Suspense>
      } 
    />
    <Route 
      path="/admin-console/environment/edit/:id" 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <EditEnvironment />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.ADMIN.CONNECTION.INDEX} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <Connection />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.ADMIN.CONNECTION.ADD} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <AddConnection />
        </Suspense>
      } 
    />
    <Route 
      path="/admin-console/connection/edit/:id" 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <EditConnection />
        </Suspense>
      } 
    />
  </>
);

export default AdminRoutes;
