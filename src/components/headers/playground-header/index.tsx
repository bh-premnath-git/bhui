import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { patchFlowOperation } from '@/store/slices/designer/flowSlice';
import { patchPipelineOperation } from '@/store/slices/designer/pipelineSlice';
import { Flow } from "@/types/designer/flow";
import { Pipeline } from "@/types/designer/pipeline";
import { NameEditor } from "./HeaderInput";
import SearchNode from "./SearchNode";
import { AutoSaveStatus } from "./AutoSave";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export interface PlayGroundHeaderProps {
  playGroundHeader?: "flow" | "pipeline";
}

export function PlaygroundHeader({ playGroundHeader }: PlayGroundHeaderProps) {
  const isFlow = playGroundHeader === "flow";
  const dispatch = useAppDispatch();
  
  // Select the appropriate state based on playground type
  const { selectedFlow } = useAppSelector((state: RootState) => state.flow);
  const { selectedPipeline } = useAppSelector((state: RootState) => state.pipeline);
  const autoSaveStatus = 'saved'; // or 'saving' or 'off'
  const lastSavedTime = new Date().toISOString(); // replace with actual last saved time
  const toggleAutoSave = () => {}; // your toggle function
  const navigate = useNavigate();
  
  const currentItem = isFlow ? selectedFlow : selectedPipeline;
  
  const itemName = isFlow 
    ? (currentItem as Flow)?.flow_name 
    : (currentItem as Pipeline)?.pipeline_name;
  
  const itemId = isFlow 
    ? (currentItem as Flow)?.flow_id 
    : (currentItem as Pipeline)?.pipeline_id;

  const handleSave = async (newName: string) => {
    if (!currentItem) return;
    
    if (isFlow) {
      await dispatch(patchFlowOperation({
        flowId: itemId,
        data: { flow_name: newName, flow_key: newName }
      })).unwrap();
    } else {
      await dispatch(patchPipelineOperation({
        pipelineId: itemId, 
        data: { pipeline_name: newName, pipeline_key: newName }
      })).unwrap();
    }
  };
  
  const handleBackClick = () => {
    if (isFlow) {
      navigate("designers/manage-flow");
    } else {
      navigate("designers/build-datapipeline/");   
    }
  };


  return (
    <div className="bg-[#fff] w-[100%] p-0 border-b border-border">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card p-2 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Button
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              variant="ghost" size="icon" aria-label="Go back" onClick={handleBackClick}>
              <ChevronLeft className="h-4 w-4" />
          </Button>
          <AutoSaveStatus 
            status={autoSaveStatus}
            lastSaved={lastSavedTime}
            onToggle={toggleAutoSave}
          />
          <NameEditor 
            initialName={itemName || ''}
            onSave={handleSave}
            placeholder={isFlow ? 'Flow name...' : 'Pipeline name...'}
          />
        </div>
      </div>
    </div>
  );
}