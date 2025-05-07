import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useFlow } from '@/contexts/FlowContext';
import { getEnvironmentList, setSelectedEnv, patchFlowOperation } from '@/redux/FlowSlice';
import { ChevronLeft, CloudSun, Cloud, CloudOff, Edit, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaybackButton } from '@/components/ReactFlowComps/flow/toolbar/PlaybackButton';
import { SettingsModal } from './SettingsModal';
import { EnvironmentSelect } from './EnvironmentSelect';
import { CustomToolbarProps } from './types';
import SchedulePicker from './SchedulePicker';
import { CommitPart } from './CommitPart';
import { DeployingPart } from './DeployingPart';

interface EnvNames {
  bh_env_name: string;
  airflow_env_name: string;
}

export const CustomToolbar: React.FC<CustomToolbarProps> = ({ selectedData }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [flowType, setFlowType] = useState(selectedData?.flow_name || "Flow_type 1");
  const [selectedEnvironment, setSelectedEnvironment] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("none");
  const [selectedEnvName, setSelectedEnvName] = useState<EnvNames>({
    bh_env_name: "",
    airflow_env_name: ""
  });
  const { autoSave, isSaved, isSaving, isPlaying, toggleAutoSave, togglePlayback, selectedFlowId } = useFlow();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const environments = useAppSelector((state) => state.flowApi.environments);

  const handleEnvironmentChange = useCallback(
    (value: string) => {
      setSelectedEnvironment(value);
      dispatch(setSelectedEnv(value));
    },
    [dispatch]
  );

  const renameFlowById = useCallback(
    async (name: string) => {
      if (!name || name === selectedData?.flow_name) return;
      try {
        dispatch(patchFlowOperation({ flow_id: selectedData.id, data: { flow_name: name, flow_key: name } }));
      } catch (error) {
        console.error("Error renaming flow:", error);
      }
    },
    [dispatch, selectedData?.flow_name, selectedData?.id]
  );

  const getCloudIcon = useMemo(() => {
    if (isSaving) return <CloudSun className="h-9 w-9 text-blue-500 animate-pulse" />;
    if (autoSave) {
      return isSaved ? (
        <Cloud className="h-9 w-9 text-blue-500" />
      ) : (
        <CloudSun className="h-9 w-9 text-blue-500" />
      );
    }
    return <CloudOff className="h-9 w-9 text-gray-400" />;
  }, [isSaving, autoSave, isSaved]);

  useEffect(() => {
    dispatch(getEnvironmentList()).catch((error) => {
      console.error('Error fetching environments:', error);
    });
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
              className="border hover:bg-gray-100 rounded-md h-10 w-10 p-0.5"
              onClick={() => navigate("designers/manage-flow")}
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="border hover:bg-gray-100 rounded-md h-10 w-10 p-0.5"
              onClick={toggleAutoSave}
              title={autoSave ? "Auto-save enabled" : "Auto-save disabled"}
            >
              {getCloudIcon}
            </Button>

            <div className="relative w-64">
              <Input
                value={flowType}
                onChange={(e) => setFlowType(e.target.value)}
                onBlur={() => renameFlowById(flowType)}
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
              className="border hover:bg-gray-100 rounded-md h-10 w-10 p-2"
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
              selectedEnv={setSelectedEnvName}
            />

            <SchedulePicker
              value={selectedSchedule}
              onChange={setSelectedSchedule}
              selectedData={selectedData?.flow_deployment?.[0]}
            />
          </div>

          {/* Right group */}
          <div className="flex items-center space-x-4">
            <DeployingPart selectedData={selectedData} selectedEnvName={selectedEnvName} />
            <CommitPart selectedData={selectedData?.flow_deployment[0]} />
            <PlaybackButton isPlaying={isPlaying} onToggle={togglePlayback} selectedFlowId={selectedFlowId} selectedData={selectedData?.flow_deployment[0]} flowName={selectedData?.flow_name} selectedEnvName={selectedEnvName} />
          </div>
        </div>

        <SettingsModal isOpen={isSettingsOpen} selectedData={selectedData} onClose={() => setIsSettingsOpen(false)} />
      </div>
    </div>
  );
};
