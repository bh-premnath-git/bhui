import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { patchFlowOperation } from '@/store/slices/designer/flowSlice';
import { patchPipelineOperation } from '@/store/slices/designer/pipelineSlice';
import { Flow } from "@/types/designer/flow";
import { Pipeline } from "@/types/designer/pipeline";
import { PipelineSelector } from "./PipelineSelector";
import { FlowSelector } from "./FlowSelector";
import { AutoSaveStatus } from "./AutoSave";
import { Button } from "@/components/ui/button";
import { CloudCog, Settings, PlusCircle, Server } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ClusterConfigDialog } from '../build-playground-header/ClusterConfigDialog';
import { useMemo, useState } from 'react';
import CreatePipelineDialog from '@/features/designers/pipeline/components/CreatePipelineDialog';
import { CreateFlowDialog } from '@/features/designers/flow/components/CreateFlowDialog';
import { CommitPart, DeployingPart, EnvironmentSelect, PlaybackButton, SchedulePicker, SettingsModal } from '../flow-playground-header';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ParameterModal } from '../build-playground-header/ParameterModal';
import { AIButton } from './AIChatButton';
import NodeDropList from '@/components/bh-reactflow-comps/builddata/NodeDropList';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { useFlow } from '@/context/designers/FlowContext';
import PipelineControls from '../build-playground-header/components/PipelineControls';
import { useModules } from '@/hooks/useModules';
import { usePipelineModules } from '@/hooks/usePipelineModules';
import { useSidebar } from '@/context/SidebarContext';
import { ModeSelector } from './ModeSelector';

export interface PlayGroundHeaderProps {
  playGroundHeader?: "flow" | "pipeline";
}

export function PlaygroundHeader({ playGroundHeader }: PlayGroundHeaderProps) {
  const isFlow = playGroundHeader === "flow";
  const dispatch = useAppDispatch();
  const { selectedFlow } = useAppSelector((state: RootState) => state.flow);
  const { selectedPipeline } = useAppSelector((state: RootState) => state.pipeline);
  const { pipelineDtl, pipelineType, selectedEngineType } = useAppSelector((state: RootState) => state.buildPipeline);
  const { isRightAsideComponent } = useAppSelector((state: RootState) => state.chat);
  
  // Get actual autosave status from pipeline context (only for pipeline mode)
  let pipelineContext = null;
  let flowContext = null;
  try {
    if (!isFlow) {
      pipelineContext = usePipelineContext();
    } else {
      flowContext = useFlow();
    }
  } catch (error) {
    // Pipeline context not available
    console.warn('Pipeline context not available:', error);
  }
  
  const { 
    isSaving, 
    hasUnsavedChanges, 
    lastSaved, 
    saveError 
  } = pipelineContext || {};
  
  // Calculate the autosave status based on actual state (only for pipeline mode)
  const autoSaveStatus = !isFlow ? (
    saveError 
      ? 'error' 
      : isSaving 
        ? 'saving' 
        : hasUnsavedChanges 
          ? 'unsaved' 
          : 'saved'
  ) : 'saved'; // Default to saved for flows
  
  const lastSavedTime = lastSaved?.toISOString() || new Date().toISOString();
  const toggleAutoSave = () => { }; // Keep as no-op for now
  const [isPipelineParamOpen, setIsPipelineParamOpen] = useState(false);
  const [showClusterDropdown, setShowClusterDropdown] = useState(false);
  const [isSparkParamOpen, setIsSparkParamOpen] = useState(false);
  const [createPipelineDialogOpen, setCreatePipelineDialogOpen] = useState(false);
  const [createFlowDialogOpen, setCreateFlowDialogOpen] = useState(false);
  
  // Use dynamic modules based on engine type for pipeline, static for flow
  const [flowModuleTypes] = useModules(); // For flow
  const pipelineModuleTypes = usePipelineModules(selectedEngineType); // For pipeline
  // Choose the appropriate module types based on context
  const moduleTypes = isFlow ? flowModuleTypes : pipelineModuleTypes;
  
  const filteredNodes = useMemo(() => {
    // Generate dynamic nodes from moduleTypes
    return moduleTypes.map((type, index) => ({
      ui_properties: {
        module_name: type.label,
        color: type.color,
        icon: type.icon,
        id: type.id,
        ports: type.ports || {
          inputs: 1,
          outputs: 1,
          maxInputs: 1
        },
        meta: {
          type: type?.type,
          moduleInfo: {
            color: type?.color,
            icon: type?.icon,
            label: type?.label,
          },
          properties: type.operators?.map((op: any) => op.properties) || [],
          description: type?.description,
          fullyOptimized: false,
        }
      }
    }));
  }, [moduleTypes]);

  // console.log('Selected Engine Type:', selectedEngineType);
  // console.log('Module Types:', moduleTypes);
  // console.log('Filtered Nodes:', filteredNodes);

  let flowNodes = moduleTypes.map((type) => {
    return {
      "ui_properties": {
        "module_name": type.label,
        "type": type.type,
        "color": type.color,
        "icon": type.icon,
        "id": type.id,
        "ports": {
          "inputs": type.label?.toLowerCase()?.toString() == "sensor" ? 0 : 1,
          "outputs": 1,
          "maxInputs": 1
        },
        meta: {
          type: type?.type,
          moduleInfo: {
            color: type?.color,
            icon: type?.icon,
            label: type?.label,
          },
          properties: type.operators?.map((op) => op.properties) || [],
          description: type?.description,
          fullyOptimized: false,
        }
      }
    };
  });
  const {
    isPipelineRunning, handleNext, handleStop, handleRun,
    isPipelineValid, pipelineValidationErrors, pipelineValidationWarnings,
    attachedCluster,
  } = isFlow ? flowContext : pipelineContext;

  const contextHandleNodeClick = isFlow ? flowContext?.handleNodeClick : pipelineContext?.handleNodeClick;
  const contextAddNodeToHistory = isFlow ? flowContext?.addNodeToHistory : pipelineContext?.addNodeToHistory;

  const isClusterAttached = !!attachedCluster;
  const { isRightAsideOpen } = useSidebar();

  const currentItem = isFlow ? selectedFlow : (selectedPipeline || pipelineDtl);

  const itemName = isFlow
    ? (currentItem as Flow)?.flow_name
    : (currentItem as Pipeline)?.pipeline_name || (currentItem as any)?.name;

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


  return (
    <div className="bg-[#fff] w-full p-0 border-border z-50 overflow-hidden">
      <div className="flex items-center justify-between bg-card min-w-0 gap-2">
        {/* Left section - AutoSave, NameEditor, and action buttons */}
        <div className="flex items-center space-x-2 min-w-0 flex-shrink-0 ml-4">
          <AutoSaveStatus
            status={autoSaveStatus}
            lastSaved={lastSavedTime}
            onToggle={toggleAutoSave}
          />

          {isFlow ? (
            <div className="flex items-center gap-2">
              <FlowSelector
                initialName={itemName || ''}
                onSave={handleSave}
                placeholder="Select flow..."
              />
              {!isRightAsideComponent && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCreateFlowDialogOpen(true)}
                      className="h-9 w-9 text-primary hover:text-primary/80 hover:bg-primary/10"
                      aria-label="Create new flow"
                    >
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create new flow</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {!isRightAsideComponent&&(<PipelineSelector
                initialName={itemName || ''}
                onSave={handleSave}
                placeholder="Select pipeline..."
              />)}
              {!isRightAsideComponent && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCreatePipelineDialogOpen(true)}
                      className="h-9 w-9 text-primary hover:text-primary/80 hover:bg-primary/10"
                      aria-label="Create new pipeline"
                    >
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create new pipeline</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {isFlow && <SettingsModal />}

          {!isFlow && (
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="hidden lg:block">
                <ModeSelector />
              </div>

              <div className="h-6 w-px bg-gray-300 mx-2 hidden lg:block" />

              <Popover open={showClusterDropdown} onOpenChange={setShowClusterDropdown}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        aria-label={isClusterAttached ? `Cluster: ${attachedCluster?.name ?? ''}` : "Attach cluster"}
                        className={
                          `h-9 px-2 flex items-center gap-2 text-white ` +
                          (isClusterAttached
                            ? "bg-emerald-600 hover:bg-emerald-500"
                            : "bg-gray-800 hover:bg-gray-700")
                        }
                      >
                        <div className="relative">
                          <Server className="h-5 w-5" />
                          {!isClusterAttached && (
                            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 opacity-75 animate-ping" />
                          )}
                          <span
                            className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white ${
                              isClusterAttached ? "bg-emerald-400" : "bg-amber-500"
                            }`}
                          />
                        </div>
                        {isClusterAttached && (
                          <span className="hidden xl:block text-xs font-medium truncate max-w-[160px]">
                            {attachedCluster?.name}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isClusterAttached ? (
                      <p>Attached: {attachedCluster?.name}</p>
                    ) : (
                      <p>Attach cluster</p>
                    )}
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-[400px] p-6" align="start">
                  <ClusterConfigDialog />
                </PopoverContent>
              </Popover>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setIsPipelineParamOpen(true)}
                    aria-label="Parameters"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pipeline settings</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Middle section - Node controls (pipeline only, requires context) */}
        {!isFlow && pipelineContext && pipelineType?.toLowerCase() !== "requirement" && (
          <div className="flex items-center justify-center gap-2 px-1 flex-1 min-w-0">
            <NodeDropList
              filteredNodes={isFlow ? flowNodes : filteredNodes}
              handleNodeClick={contextHandleNodeClick}
              addNodeToHistory={contextAddNodeToHistory}
            />
          </div>
        )}

        {/* Right section - Pipeline controls and AI button */}
        <div className="flex items-center justify-end space-x-2 flex-shrink-0  mr-4">
          {!isFlow && (
            <PipelineControls
              handleRunClick={handleRun}
              handleStop={handleStop}
              handleNext={handleNext}
              isPipelineRunning={isPipelineRunning}
              isValid={isPipelineValid}
              validationErrors={pipelineValidationErrors}
              validationWarnings={pipelineValidationWarnings}

            />
          )}

          {isFlow && (
            <div className="flex items-center space-x-2 overflow-hidden">
              <EnvironmentSelect />
              <div className="hidden md:block">
                <SchedulePicker />
              </div>
              <DeployingPart />
              <div className="hidden lg:block">
                <CommitPart />
              </div>
              <PlaybackButton />
            </div>
          )}

          {!isRightAsideOpen && (
           <>
           {!isRightAsideComponent&&( <div className="border-l border-border pl-2 flex-shrink-0">
              <AIButton variant={playGroundHeader} color="#009f59" />
            </div>)}
           </>
          )}
        </div>
      </div>

      {!isFlow && (
        <>
          <ParameterModal
            isOpen={isPipelineParamOpen || isSparkParamOpen}
            onClose={() => {
              setIsPipelineParamOpen(false);
              setIsSparkParamOpen(false);
            }}
          />

        </>
      )}

      {/* Create Pipeline Dialog for pipeline mode */}
      {!isFlow && (
        <CreatePipelineDialog
          open={createPipelineDialogOpen}
          handleClose={() => setCreatePipelineDialogOpen(false)}
        />
      )}

      {/* Create Flow Dialog for flow mode */}
      {isFlow && (
        <CreateFlowDialog
          open={createFlowDialogOpen}
          onOpenChange={setCreateFlowDialogOpen}
        />
      )}
    </div>
  );
}  