import { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { LoadingFallback } from './LoadingFallback';

// Lazy-loaded components
const DesignerDashboard = lazy(() => import("@/pages/designers/DesignerDashboard"));
const BuildDataPipeline = lazy(() => import("@/pages/designers/BuildDataPipeline"));
const DataPipeCanvas = lazy(() => import("@/pages/designers/DataPipelineCanvas"));
const ManageFlow = lazy(() => import("@/pages/designers/ManageFlow"));
const FlowCanvas = lazy(() => import("@/pages/designers/FlowCanvas"));
const DataFlowCanvas = lazy(() => import("@/pages/designers/DataFlowCanva"));
const NotebookEditor = lazy(() => import("@/pages/data-catalog/Notebook"));

export const DesignerRoutes = (
  <>
    <Route 
      path={ROUTES.DESIGNERS.INDEX} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DesignerDashboard />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.DESIGNERS.BUILD_PIPELINE} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DataPipeCanvas />
        </Suspense>
      } 
    />
    <Route 
      path="/designers/build-playground/:id" 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DataPipeCanvas />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.DESIGNERS.MANAGE_FLOW} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <ManageFlow />
        </Suspense>
      } 
    />
    <Route 
      path="/designers/flow-playground/:id" 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <FlowCanvas />
        </Suspense>
      } 
    />
     <Route 
      path="/designers/data-flow-playground/:id" 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DataFlowCanvas />
        </Suspense>
      } 
    />
    <Route 
      path="/designers/data-flow-playground" 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <DataFlowCanvas />
        </Suspense>
      } 
    />
    <Route 
      path={ROUTES.DESIGNERS.NOTEBOOK} 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <NotebookEditor />
        </Suspense>
      } 
    />
   
  </>
);

export default DesignerRoutes;
