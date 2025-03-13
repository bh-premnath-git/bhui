import { RootState } from '@/store';
import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Edit, Link, Database, Zap} from 'lucide-react'
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

export function BuildPlaygroundHeader() {
  console.log("BuildPlaygroundHeader rendered");
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  
  const { 
    pipelineName: contextPipelineName, 
    setUnsavedChanges, 
    setSaving, 
    setSaved, 
    setPipeLineName,
    setLastSaved,
    lastSaved,
    isSaving,
    hasUnsavedChanges,
  } = usePipelineContext();
console.log(contextPipelineName,lastSaved,"contextPipelineName")
  const localState = useMemo(() => ({
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    pipelineName: contextPipelineName?.pipeLineName,
    
  }), [isSaving, lastSaved, hasUnsavedChanges, contextPipelineName]);
  console.log(lastSaved,"localState",isSaving)
  
  const [localPipelineName, setLocalPipelineName] = useState(contextPipelineName?.pipeLineName || '');
  const [tempPipelineName, setTempPipelineName] = useState(contextPipelineName?.pipeLineName || '');
  const [isPipelineParamOpen, setIsPipelineParamOpen] = useState(false);
  const [isSparkParamOpen, setIsSparkParamOpen] = useState(false);
  const [showClusterDropdown, setShowClusterDropdown] = useState(false);

  const { buildPipeLineDtl } = useSelector((state: RootState) => state.buildPipeline);

  useEffect(() => {
    if (contextPipelineName?.pipeLineName) {
      setLocalPipelineName(contextPipelineName.pipeLineName);
      setTempPipelineName(contextPipelineName.pipeLineName);
    } else if (buildPipeLineDtl?.pipeline_name) {
      setLocalPipelineName(buildPipeLineDtl.pipeline_name);
      setTempPipelineName(buildPipeLineDtl.pipeline_name);
    }
  }, [buildPipeLineDtl?.pipeline_name, contextPipelineName?.pipeLineName]);


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

  const handleNameEdit = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPipelineName(e.target.value);
  };

  const handleNameSubmit = async () => {
    if (tempPipelineName.trim() && tempPipelineName !== localPipelineName) {
      setSaving();
      try {
        await apiService.patch({
          portNumber: CATALOG_API_PORT,
          url: `/pipeline/${id}`,
          usePrefix: true,
          method: 'PATCH',
          data: { pipeline_name: tempPipelineName }
        });
        
        setLocalPipelineName(tempPipelineName);
        setPipeLineName({ pipeLineName: tempPipelineName });
        setSaved();
      } catch (error) {
        console.error("Error updating pipeline name:", error);
        setTempPipelineName(localPipelineName);
        setUnsavedChanges();
      }
    } else {
      setTempPipelineName(localPipelineName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setTempPipelineName(localPipelineName);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-[#F4F4F4] w-[100%]">
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

            <div className="relative flex-grow sm:w-40">
              {isEditing ? (
                <Input
                  type="text"
                  className="pr-8"
                  value={tempPipelineName}
                  onChange={handleNameChange}
                  onBlur={handleNameSubmit}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  aria-label="Edit pipeline name"
                />
              ) : (
                <div className="flex items-center">
                  <span className="flex-grow truncate pr-8">{localPipelineName}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2" 
                    onClick={handleNameEdit}
                    aria-label="Edit pipeline name"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
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
            <Tooltip>
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
