import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, CloudCog, Edit, Link, Clock, Settings, Check, CloudOff, Loader2, CloudUpload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SettingsModal } from './CustomToolbar'
import { useSelector } from 'react-redux';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { RootState } from '@/store/store'
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomBuildToolbar = React.memo(({ buildPipeLineDtl, showLeavePrompt, setShowLeavePrompt }: any) => {
  const [isVisual, setIsVisual] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [pipeLineName, setPipeLineName] = useState("Flow_type 1")
  const navigate = useNavigate();
  const { isSaving, lastSaved, hasUnsavedChanges } = useSelector((state: RootState) => state.autoSave);

  const formatLastSaved = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  const renderSaveStatus = () => {
    const baseClasses = "flex items-center p-1.5 rounded-md transition-all duration-300 ease-in-out hover:shadow-md";
    const iconClasses = "h-5 w-5 transition-transform duration-300 ease-in-out";

    if (isSaving) {
      return (
        <Tooltip>
          <TooltipTrigger>
            <div className={cn(
              baseClasses,
              "bg-blue-50 text-blue-700 border border-blue-200"
            )}>
              <div className="relative">
                <Loader2 className={cn(iconClasses, "animate-spin")} />
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400 animate-ping" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-blue-50 text-blue-700 border-blue-200">
            <div className="flex items-center gap-2">
              <CloudCog className="h-4 w-4" />
              <span>Saving changes...</span>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    if (lastSaved) {
      return (
        <Tooltip>
          <TooltipTrigger>
            <div className={cn(
              baseClasses,
              "bg-green-50 text-green-700 border border-green-200",
              "group"
            )}>
              <div className="relative">
                <CloudUpload className={cn(
                  iconClasses,
                  "group-hover:scale-110 group-hover:rotate-12"
                )} />
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-green-50 text-green-700 border-green-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Last saved at {formatLastSaved(lastSaved)}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger>
          <div className={cn(
            baseClasses,
            "bg-orange-50 text-orange-700 border border-orange-200",
            "group"
          )}>
            <div className="relative">
              <CloudOff className={cn(
                iconClasses,
                "group-hover:scale-110 group-hover:-rotate-12"
              )} />
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
            </div>
          </div>
        </TooltipTrigger>

      </Tooltip>
    );
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowLeavePrompt(true);
    } else {
      navigate("/designers/build-datapipeline/");
    }
  };

  useEffect(() => {
    if (buildPipeLineDtl && buildPipeLineDtl?.pipeline_name) {
      setPipeLineName(() => buildPipeLineDtl?.pipeline_name);
    }
  }, [buildPipeLineDtl?.pipeline_name]);
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
              <Input
                type="text"
                className="pr-8"
                value={pipeLineName}
                onChange={(e) => setPipeLineName(e.target.value)}
                aria-label="Flow type"
              />
              <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2" aria-label="Edit flow type">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <Button className="flex items-center space-x-1 bg-black">
              <span>Detach Cluster</span>
              <Link className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button className='border bg-gray-50' variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} aria-label="Open settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Visual</span>
            <Switch
              checked={isVisual}
              onCheckedChange={setIsVisual}
              className={`${!isVisual ? '!bg-[#07A206]' : ''}`}
              aria-label="Toggle between visual and code view"
            />
            <span className="text-sm font-medium">Code</span>
          </div>
        </div>
      </TooltipProvider>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}) 