import { RootState } from '@/store';
import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react'
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
import { setUnsavedChanges } from '@/store/slices/designer/features/autoSaveSlice';
import { CATALOG_API_PORT } from '@/config/platformenv';
import { AutoSaveChanges, AutoSaveDefault, LastSave } from './AutoSave';

export function BuildPlaygroundHeader() {
  const { buildPipeLineDtl } = useSelector(
    (state: RootState) => state.buildPipeline
  );
  const { id } = useParams();

  console.log(id)
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isSaving, lastSaved, hasUnsavedChanges,pipeLineNameData } = useSelector((state: RootState) => state.autoSave);
  const [pipeLineName, setPipeLineName]:any = useState(pipeLineNameData?.pipeLineName);
  const [tempPipeLineName, setTempPipeLineName]:any = useState(pipeLineNameData?.pipeLineName);
  const [isPipelineParamOpen, setIsPipelineParamOpen] = useState(false);
  const [isSparkParamOpen, setIsSparkParamOpen] = useState(false);
  const [showClusterDropdown, setShowClusterDropdown] = useState(false);

  

  const renderSaveStatus = () => {
   
    if (isSaving) {
      return (
        <AutoSaveChanges />
      );
    }

    if (lastSaved) {
      return (
        <LastSave lastSaved={lastSaved} />
      );
    }

    return (
      <AutoSaveDefault />
    );
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      // setShowLeavePrompt(true);
    } else {
      navigate("/designers/build-datapipeline/");
    }
  };

  useEffect(() => {
    if (pipeLineNameData?.pipeLineName) {
      setPipeLineName(pipeLineNameData.pipeLineName);
      setTempPipeLineName(pipeLineNameData.pipeLineName);
    } else if (buildPipeLineDtl?.pipeline_name) {
      setPipeLineName(buildPipeLineDtl.pipeline_name);
      setTempPipeLineName(buildPipeLineDtl.pipeline_name);
    }
  }, [buildPipeLineDtl?.pipeline_name, pipeLineNameData?.pipeLineName]);

  const handleNameEdit = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPipeLineName(e.target.value);
  };

  const handleNameSubmit = async () => {
    if (tempPipeLineName.trim() && tempPipeLineName !== pipeLineName) {
      try {
        await apiService.patch({
          portNumber: CATALOG_API_PORT,
          url: `/pipeline/${id}}`,
          usePrefix: true,
          method: 'PATCH',
          data: { pipeline_name: tempPipeLineName }
        });
        
        setPipeLineName(tempPipeLineName);
        dispatch(setPipeLineName({ pipeLineName: tempPipeLineName }));
        dispatch(setUnsavedChanges());
      } catch (error) {
        console.error("Error updating pipeline name:", error);
        setTempPipeLineName(pipeLineName);
      }
    } else {
      setTempPipeLineName(pipeLineName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setTempPipeLineName(pipeLineName);
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

            {renderSaveStatus()}

            <div className="relative flex-grow sm:w-40">
              {isEditing ? (
                <Input
                  type="text"
                  className="pr-8"
                  value={tempPipeLineName}
                  onChange={handleNameChange}
                  onBlur={handleNameSubmit}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  aria-label="Edit pipeline name"
                />
              ) : (
                <div className="flex items-center">
                  <span className="flex-grow truncate pr-8">{pipeLineName}</span>
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
