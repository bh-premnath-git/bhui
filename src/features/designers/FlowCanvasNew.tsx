// src/features/designers/FlowCanvasNew.tsx
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useRedux';
import { useFlow as useFlowApi } from '@/features/designers/flow/hooks/useFlow';
import { CustomControls } from '@/components/bh-reactflow-comps/flow/flow/CustomControls';
import { nodeTypes } from '@/components/bh-reactflow-comps/flow/nodeTypes';
import { edgeTypes } from '@/components/bh-reactflow-comps/flow/edgeTypes';
import { ComposableCanvas } from '@/components/ComposableCanvas';
import { setSelectedEnv, setSelectedFlow } from '@/store/slices/designer/flowSlice';
import { setEnabled } from '@/store/slices/gitSlice';
import { Controls } from '@xyflow/react';
import { GitControlsFooterPortal } from '@/components/git/GitControlsFooter';
import { CommitModal } from '@/components/git/CommitModal';


export const FlowCanvasNew = () => {
  const { id } = useParams();
  const { useFetchFlowById } = useFlowApi();
  const { data: flow, isLoading, isError } = useFetchFlowById(id || '');
  const dispatch = useAppDispatch();

  // Handle flow data loading
  useEffect(() => {
    if (flow) {
      dispatch(setSelectedFlow(flow));
      if (flow.flow_deployment?.[0]?.bh_env_id) {
        dispatch(setSelectedEnv(Number(flow.flow_deployment[0].bh_env_id)));
      }
    }
  }, [flow, dispatch]);

   // Enable git integration when component mounts
   useEffect(() => {
    dispatch(setEnabled(true));
    
    // Cleanup: disable git when component unmounts
    return () => {
      dispatch(setEnabled(false));
    };
  }, [dispatch]);

  return (
   <><ComposableCanvas
      type="flow"
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      loading={isLoading}
      error={isError}
      errorTitle="Error loading flow"
      errorDescription="Please try again later"
      defaultViewport={{ x: 0, y: 0, zoom: 1.8 }}
      snapGrid={[15, 15]}
      renderControls={false}
    >
      <Controls 
        position="bottom-right"
        showZoom={false} 
        showFitView={false}
        showInteractive={false} 
      >
        <CustomControls />
      </Controls>
    </ComposableCanvas>
    <GitControlsFooterPortal />
    <CommitModal />
    </>
  );
};

export default FlowCanvasNew;