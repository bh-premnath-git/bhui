import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useFlow } from '@/contexts/FlowContext';
import { getEnvironmentList, setSelectedEnv, patchFlowOperation } from '@/redux/FlowSlice';
import {
  ChevronLeft,
  CloudSun,
  Cloud,
  CloudOff,
  Edit,
  GitCommit,
  Clock,
  Settings
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaybackButton } from '@/components/ReactFlowComps/flow/toolbar/PlaybackButton';
import { SettingsModal } from './SettingsModal';
import { EnvironmentSelect } from './EnvironmentSelect';
import { CustomToolbarProps } from './types';
import SchedulePicker from './SchedulePicker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const CustomToolbar: React.FC<CustomToolbarProps> = ({ selectedData }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [flowType, setFlowType] = useState("Flow_type 1");
  const [selectedEnvironment, setSelectedEnvironment] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("none");
  const { autoSave, isSaved, isSaving, isPlaying, toggleAutoSave, togglePlayback, selectedFlowId } = useFlow();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { environments } = useAppSelector((state) => state.flowApi);

  const handleEnvironmentChange = (value: string) => {
    setSelectedEnvironment(value);
    dispatch(setSelectedEnv(value));
  };

  const renameflowByid = async (name) => {
    try {
      const payload = {
        flow_name: name,
        flow_key: name
      }
      dispatch(patchFlowOperation({ flow_id: selectedData.id, data: payload }))
    } catch (error) {
      console.error("error", error);
    }
  }

  const getCloudIcon = () => {
    if (isSaving) return <CloudSun className="h-9 w-9 text-blue-500 animate-pulse" />;
    if (autoSave) {
      return isSaved ?
        <Cloud className="h-9 w-9 text-blue-500" /> :
        <CloudSun className="h-9 w-9 text-blue-500" />;
    }
    return <CloudOff className="h-9 w-9 text-gray-400" />;
  };

  useEffect(() => {
    if (selectedData?.flow_name) {
      setFlowType(selectedData.flow_name);
    }
  }, [selectedData?.flow_name]);

  useEffect(() => {
    const fetchEnvironments = async () => {
      try {
        await dispatch(getEnvironmentList());
      } catch (error) {
        console.error('Error fetching environments:', error);
      }
    };
    fetchEnvironments();
  }, [dispatch]);


  return (
    <div className="bg-white border-b">
      <div className="max-w-screen-xl px-1 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Left group */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 rounded-full h-10 w-10 p-0.5"
              onClick={() => navigate("designers/manage-flow")}
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 rounded-full h-10 w-10 p-0.5"
              onClick={toggleAutoSave}
              title={autoSave ? "Auto-save enabled" : "Auto-save disabled"}
            >
              {getCloudIcon()}
            </Button>

            <div className="relative w-64">
              <Input
                value={flowType}
                onChange={(e) => setFlowType(e.target.value)}
                onBlur={() => {
                  if (flowType && flowType !== selectedData?.flow_name) {
                    renameflowByid(flowType);
                  }
                }}
                className="pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-full h-8 w-8 p-2"
              >
                <Edit className="h-4 w-4 text-gray-500" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 rounded-full h-10 w-10 p-2"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-6 w-6 text-gray-600" />
            </Button>
          </div>

          {/* Middle group */}
          <div className="flex items-center space-x-4">
            <EnvironmentSelect
              value={selectedEnvironment}
              onValueChange={handleEnvironmentChange}
              environments={environments}
              selectedData={selectedData?.flow_deployment?.[0]}
            />

            <SchedulePicker
              value={selectedSchedule}
              onChange={setSelectedSchedule}
              selectedData={selectedData?.flow_deployment?.[0]}
            />
          </div>

          {/* Right group */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors duration-200 ease-in-out">
              <Clock className="h-4 w-4 text-gray-500" />
              <time
                className="text-sm"
                dateTime="2023-11-28T08:45"
              >
                Last deployed: <span className="font-medium">{"none"}</span>
              </time>
            </div>

            <PlaybackButton isPlaying={isPlaying} onToggle={togglePlayback} selectedFlowId={selectedFlowId} />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="border-1 border-gray-200 hover:bg-gray-100 rounded-full h-10 w-10 p-2"
                  >
                    <GitCommit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  className="bg-gray-900 px-3 py-1.5 text-xs font-medium text-white rounded-md border-0"
                  sideOffset={5}
                >
                  <p>Commit changes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        selectedData={selectedData}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};