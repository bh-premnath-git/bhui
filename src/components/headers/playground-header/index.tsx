import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { patchFlowOperation } from '@/store/slices/designer/flowSlice';
import { patchPipelineOperation } from '@/store/slices/designer/pipelineSlice';
import { Flow } from "@/types/designer/flow";
import { Pipeline } from "@/types/designer/pipeline";
import { NameEditor } from "./HeaderInput";
import { AutoSaveStatus } from "./AutoSave";
import { Button } from "@/components/ui/button";
import { CloudCog, Database, FileJson, Settings, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ClusterConfigDialog } from '../build-playground-header/ClusterConfigDialog';
import { useMemo, useState } from 'react';
import { CommitPart, DeployingPart, EnvironmentSelect, PlaybackButton, SchedulePicker, SettingsModal } from '../flow-playground-header';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ParameterModal } from '../build-playground-header/ParameterModal';
import { JsonToPipelineDialog } from '../build-playground-header/JsonToPipelineDialog';
import { AIButton } from './AIChatButton';
import NodeDropList from '@/components/bh-reactflow-comps/builddata/NodeDropList';
import nodeData from '@/pages/designers/data-pipeline/data/node_display.json';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { ToolbarNodes } from '@/components/bh-reactflow-comps/flow/toolbar/ToolbarNodes';
import PipelineControls from '../build-playground-header/components/PipelineControls';
import { useModules } from '@/hooks/useModules';


export interface PlayGroundHeaderProps {
  playGroundHeader?: "flow" | "pipeline";
}



export function PlaygroundHeader({ playGroundHeader }: PlayGroundHeaderProps) {
  const isFlow = playGroundHeader === "flow";
  const dispatch = useAppDispatch();

  const { selectedFlow } = useAppSelector((state: RootState) => state.flow);
  const { selectedPipeline } = useAppSelector((state: RootState) => state.pipeline);
  const { pipelineDtl } = useAppSelector((state: RootState) => state.buildPipeline);
  const autoSaveStatus = 'saved';
  const lastSavedTime = new Date().toISOString();
  const toggleAutoSave = () => { };
  const [isPipelineParamOpen, setIsPipelineParamOpen] = useState(false);
  const [showClusterDropdown, setShowClusterDropdown] = useState(false);
  const [isJsonToPipelineOpen, setIsJsonToPipelineOpen] = useState(false);
  const [isSparkParamOpen, setIsSparkParamOpen] = useState(false);
  const filteredNodes = useMemo(() => nodeData.nodes, []);
  const [moduleTypes] = useModules();
  console.log(moduleTypes)
  // const activeModule = moduleTypes.find((type) => type.id === activeType);
  let flowNodes = moduleTypes.map((type) => {
    return {
      "ui_properties": {
        "module_name": type.label,
        "color": type.color,
        "icon": type.icon,
        "id": type.id,
        "ports": {
          "inputs": type.label?.toLowerCase()?.toString()=="sensor"?0:1,
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
          properties:  type.operators.map((op) => op.properties),
          description: type?.description,
          fullyOptimized: false,
        }
      }
    };
  });
  console.log(moduleTypes)
  const {
    handleNodeClick, addNodeToHistory,
    isPipelineRunning, handleNext, handleStop, handleRun
  } = usePipelineContext();

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
    <div className="bg-[#fff] w-full p-0 border-border z-50">
      <div className="flex flex-col sm:flex-row items-center justify-between bg-card">
        {/* Left section - AutoSave, NameEditor, and action buttons */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
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

          {isFlow && <SettingsModal />}

          {!isFlow && (
            <div className="flex items-center space-x-2">
              <Popover open={showClusterDropdown} onOpenChange={setShowClusterDropdown}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        aria-label="Parameters"
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white"
                      >
                        <CloudCog className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Detach Cluster</p>
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


              {/* <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsJsonToPipelineOpen(true)}
                    aria-label="Convert JSON to Pipeline"
                  >
                    <FileJson className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Convert JSON to Pipeline</p>
                </TooltipContent>
              </Tooltip> */}
            </div>
          )}
        </div>

        {/* Middle section - Node controls */}
        <div className="flex items-center justify-center gap-3 px-2 w-full sm:w-auto">
          <NodeDropList
            filteredNodes={isFlow ? flowNodes : filteredNodes}
            handleNodeClick={handleNodeClick}
            addNodeToHistory={addNodeToHistory}
          />
        </div>

        {/* Right section - Pipeline controls and AI button */}
        <div className="flex items-center justify-end space-x-4 w-full sm:w-auto">
          {!isFlow && (
            <PipelineControls
              handleRunClick={handleRun}
              handleStop={handleStop}
              handleNext={handleNext}
              isPipelineRunning={isPipelineRunning}
            />
          )}

          {isFlow && (
            <div className="flex items-center space-x-3">
              <EnvironmentSelect />
              <SchedulePicker />
              <DeployingPart />
              <CommitPart />
              <PlaybackButton />
            </div>
          )}

          <div className="border-l border-border pl-4">
            <AIButton variant={playGroundHeader} color="#009f59" />
          </div>
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
          {/* <JsonToPipelineDialog
            isOpen={isJsonToPipelineOpen}
            onClose={() => setIsJsonToPipelineOpen(false)}
          /> */}
        </>
      )}
    </div>
  );
}  