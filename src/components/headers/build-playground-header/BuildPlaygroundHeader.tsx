import { RootState } from '@/store';
import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Edit, Link, Database, Zap, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from "@/components/ui/separator"
import { ParameterModal } from './ParameterModal'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ClusterConfigDialog } from './ClusterConfigDialog'
import { apiService } from '@/lib/api/api-service';
// import { setUnsavedChanges } from '@/store/slices/designer/features/autoSaveSlice';
import { CATALOG_API_PORT } from '@/config/platformenv';
import { AutoSaveChanges, AutoSaveDefault, LastSave } from './AutoSave';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
// import { AIButton } from '../flow-playground-header';
import { PipeLineAIButton } from './PipeLineAIButton';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import SearchNode from './components/SearchNode';
import NodeDropList from '@/components/bh-reactflow-comps/builddata/NodeDropList';
import nodeData from '@/pages/designers/data-pipeline/data/node_display.json';
import { HiOutlinePlay } from 'react-icons/hi';
import { MdOutlineStop, MdOutlineSkipNext } from 'react-icons/md';
import PipelineControls from './components/PipelineControls';
import { patchPipelineOperation } from '@/store/slices/designer/pipelineSlice';
import { PipelineNameEditor } from './components/PipelineNameEditor';

export function BuildPlaygroundHeader() {
  // console.log("BuildPlaygroundHeader rendered");
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    pipelineName: contextPipelineName,
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    handleSearch,
    handleSearchResultClick,
    searchTerm,
    searchResults,
    highlightedNodeId,
    handleNodeClick, addNodeToHistory,
    handleRunClick, isPipelineRunning,handleNext,handleStop,handleRun
  } = usePipelineContext();
  const localState = useMemo(() => ({
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    pipelineName: contextPipelineName?.pipeLineName,

  }), [isSaving, lastSaved, hasUnsavedChanges, contextPipelineName]);
  // console.log(lastSaved,"localState",isSaving)
  console.log(contextPipelineName, "contextPipelineName")

  const { buildPipeLineDtl } = useSelector((state: RootState) => state.buildPipeline);
  const { selectedPipeline } = useAppSelector((state) => state.pipeline);
  console.log(selectedPipeline, "selectedPipeline")

  const [localPipelineName, setLocalPipelineName] = useState(selectedPipeline?.pipeline_name || contextPipelineName?.pipeLineName || '');
  const [tempPipelineName, setTempPipelineName] = useState(selectedPipeline?.pipeline_name || contextPipelineName?.pipeLineName || '');
  const [isPipelineParamOpen, setIsPipelineParamOpen] = useState(false);
  const [isSparkParamOpen, setIsSparkParamOpen] = useState(false);
  const [showClusterDropdown, setShowClusterDropdown] = useState(false);
  const filteredNodes = useMemo(() => nodeData.nodes, []);

  console.log(selectedPipeline, "selectedPipeline")

  // Update the useEffect hooks to properly handle name changes
useEffect(() => {
  // Priority 1: Selected pipeline from Redux
  if (selectedPipeline?.pipeline_name) {
    setLocalPipelineName(selectedPipeline.pipeline_name);
    setTempPipelineName(selectedPipeline.pipeline_name);
  } 
  // Priority 2: Context pipeline name
  else if (contextPipelineName?.pipeLineName) {
    setLocalPipelineName(contextPipelineName.pipeLineName);
    setTempPipelineName(contextPipelineName.pipeLineName);
  }
  // Priority 3: Build pipeline detail
  else if (buildPipeLineDtl?.pipeline_name) {
    setLocalPipelineName(buildPipeLineDtl.pipeline_name);
    setTempPipelineName(buildPipeLineDtl.pipeline_name);
  }
}, [selectedPipeline?.pipeline_name, contextPipelineName?.pipeLineName, buildPipeLineDtl?.pipeline_name]);

  const renderSaveStatus = useMemo(() => {
    if (localState.isSaving) {
      return <AutoSaveChanges />;
    }
    if (localState.lastSaved) {
      return <LastSave lastSaved={localState.lastSaved} />;
    }
    return <AutoSaveDefault />;
  }, [localState]);

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      // setShowLeavePrompt(true);
    } else {
      navigate("/designers/build-datapipeline/");
    }
  };


  return (
    <div className="bg-[#fff] w-[100%] p-0 border-b border-border">
      <TooltipProvider>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card p-2 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              variant="ghost" size="icon" aria-label="Go back" onClick={handleBackClick}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {renderSaveStatus}

            <PipelineNameEditor />
            
            <Popover open={showClusterDropdown} onOpenChange={setShowClusterDropdown}>
              <PopoverTrigger asChild>
                <Button className="flex items-center gap-2 bg-[#1C1C1C] hover:bg-[#2C2C2C] text-white">
                  <span>Detach Cluster</span>
                  <Link className="h-4 w-4" aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-6" align="start">
                <ClusterConfigDialog />
              </PopoverContent>
            </Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className='border bg-gray-50'
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsPipelineParamOpen(true)}
                  aria-label="Pipeline Parameters"
                >
                  <Database className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pipeline Parameters</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip >
              <TooltipTrigger asChild>
                <Button
                  className='border bg-gray-50'
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSparkParamOpen(true)}
                  aria-label="Spark Parameters"
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Spark Parameters</p>
              </TooltipContent>
            </Tooltip>
            <PipelineControls
              handleRunClick={handleRun}
              handleStop={handleStop}
              handleNext={handleNext}
              isPipelineRunning={isPipelineRunning}
            />

            <div className="flex justify-center gap-4 border-l border-border pl-3">
                  <NodeDropList
                      filteredNodes={filteredNodes}
                      handleNodeClick={handleNodeClick}
                      addNodeToHistory={addNodeToHistory}
                  />
              </div>

          </div>
          <div className="flex justify-end w-full sm:w-auto ">
            <div className='px-6'>
              <SearchNode searchTerm={searchTerm} handleSearch={handleSearch} searchResults={searchResults} handleSearchResultClick={handleSearchResultClick} />
            </div>
            <div className="border-l border-border pl-6 ">
              <PipeLineAIButton />
            </div>
           
          </div>
        </div>
      </TooltipProvider>
      <ParameterModal
        isOpen={isPipelineParamOpen}
        onClose={() => setIsPipelineParamOpen(false)}
        type="pipeline"
      />
      <ParameterModal
        isOpen={isSparkParamOpen}
        onClose={() => setIsSparkParamOpen(false)}
        type="spark"
      />

    </div>
  )
}
