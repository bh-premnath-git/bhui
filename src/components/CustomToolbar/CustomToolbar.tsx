import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useFlow } from '@/contexts/FlowContext';
import { getEnvironmentList, setSelectedEnv } from '@/redux/FlowSlice';
import {
  ChevronLeft,
  CloudSun,
  Cloud,
  CloudOff,
  Edit,
  GitCommit,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from 'lucide-react';
import { PlaybackButton } from '../ReactFlowComps/flow/toolbar/PlaybackButton';
import { SettingsModal } from './SettingsModal';
import { CustomToolbarProps } from './types';

export const CustomToolbar: React.FC<CustomToolbarProps> = ({ selectedData }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [flowType, setFlowType] = useState("Flow_type 1");
  const [selectedEnvironment, setSelectedEnvironment] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("none");
  const { autoSave, isSaved, isSaving, isPlaying, toggleAutoSave, togglePlayback } = useFlow();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { environments: data } = useAppSelector((state) => state.flowApi);

  const environmentOptions = [
    { value: "select", label: "Select Environment" },
    ...data.map(env => ({
      value: env.id.toString(),
      label: env.envName
    }))
  ];

  const schedules = [
    { value: 'none', label: 'No Schedule' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const handleEnvironmentChange = (value: string) => {
    setSelectedEnvironment(value);
    dispatch(setSelectedEnv(value));
  };

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
            <Select value={selectedEnvironment} onValueChange={handleEnvironmentChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Environment" />
              </SelectTrigger>
              <SelectContent>
                {environmentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Schedule" />
              </SelectTrigger>
              <SelectContent>
                {schedules.map((schedule) => (
                  <SelectItem key={schedule.value} value={schedule.value}>
                    {schedule.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Right group */}
          <div className="flex items-center space-x-4">
            <time
              className="text-sm bg-white px-3 py-1 rounded-md border-2 border-gray-200"
              dateTime="2023-11-28T08:45"
            >
              Last deployed: 2023-11-28 08:45
            </time>
<PlaybackButton isPlaying={isPlaying} onToggle={togglePlayback} />
            <Button
              variant="ghost"
              size="icon"
              className="border-1 border-gray-200 hover:bg-gray-100 rounded-full h-10 w-10 p-2"
              aria-label="Commit changes"
            >
              <GitCommit className="h-4 w-4" />
            </Button>
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