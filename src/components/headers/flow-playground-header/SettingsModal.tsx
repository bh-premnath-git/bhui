import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Plus, X, Settings, Save, Loader } from 'lucide-react';
import { TagInput } from '@/components/shared/TagInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { patchFlowOperation, updateFlowConfiguration } from '@/store/slices/designer/flowSlice';
import { RootState } from "@/store/";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
interface Tag {
  tagList: { key: string; value: string }[];
}

interface ConfigItem {
  key: string;
  value: string;
}
// Configuration Row Component
const ConfigRow: React.FC<{
  config: ConfigItem;
  onDelete: () => void;
  onChange: (field: 'key' | 'value', value: string) => void;
  canDelete: boolean;
}> = ({ config, onDelete, onChange, canDelete }) => (
  <div className="flex gap-2 items-center">
    <Input
      placeholder="Key"
      value={config.key}
      onChange={(e) => onChange('key', e.target.value)}
      className="w-1/2"
    />
    <Input
      placeholder="Value"
      value={config.value}
      onChange={(e) => onChange('value', e.target.value)}
      className="w-1/2"
    />
    <Button
      variant="ghost"
      size="icon"
      onClick={onDelete}
      className="text-gray-400 hover:text-red-500"
      disabled={!canDelete}
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
);

// Configuration Section Component
const ConfigurationSection: React.FC<{
  configs: ConfigItem[];
  onConfigChange: (index: number, field: 'key' | 'value', value: string) => void;
  onAddConfig: () => void;
  onRemoveConfig: (index: number) => void;
}> = ({ configs, onConfigChange, onAddConfig, onRemoveConfig }) => (
  <div className="space-y-3">
    <div className="flex text-sm font-medium text-gray-500 px-3">
      <div className="w-1/2">Key</div>
      <div className="w-1/2">Value</div>
    </div>
    <div className="space-y-2">
      {configs.map((config, index) => (
        <ConfigRow
          key={index}
          config={config}
          onDelete={() => onRemoveConfig(index)}
          onChange={(field, value) => onConfigChange(index, field, value)}
          canDelete={configs.length > 1}
        />
      ))}
    </div>

    <Button
      type="button"
      variant="ghost"
      onClick={onAddConfig}
      className="w-full mt-4 border border-dashed border-gray-200 hover:border-gray-300 text-gray-600 h-9"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Configuration
    </Button>
  </div>
);

// Notes Section Component
const NotesSection: React.FC<{
  notes: string;
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
  setNotes: (notes: string) => void;
}> = ({ notes, showNotes, setShowNotes, setNotes }) => (
  <div className="space-y-4">
    <Button
      variant="ghost"
      className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      onClick={() => setShowNotes(!showNotes)}
    >
      <span className="flex items-center gap-2">
        Notes
        <span className="text-xs text-gray-500">
          {notes ? '(Added)' : '(Optional)'}
        </span>
      </span>
      {showNotes ? (
        <ChevronUp className="h-4 w-4 text-gray-500" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-500" />
      )}
    </Button>

    {showNotes && (
      <div className="px-4">
        <Textarea
          placeholder="Add your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm rounded-lg"
        />
      </div>
    )}
  </div>
);

// Main Settings Modal Component with Dialog Trigger
export const SettingsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [tags, setTags] = useState<Tag>({ tagList: [] });
  const [activeTab, setActiveTab] = useState("settings");
  const [configs, setConfigs] = useState<ConfigItem[]>([{ key: '', value: '' }]);
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useAppDispatch();
  const { selectedFlow } = useAppSelector((state: RootState) => state.flow);
  useEffect(() => {
    if (isOpen && selectedFlow) {
      // Initialize with data from selectedFlow
      setNotes(selectedFlow.notes || "");

      // Transform the tags from Record<string, string>[] to { key: string; value: string }[]
      const transformedTags = {
        tagList: Array.isArray(selectedFlow.tags?.tagList)
          ? selectedFlow.tags.tagList.map((tag: Record<string, string>) => {
            // Extract the first key-value pair from the record
            const key = Object.keys(tag)[0] || '';
            const value = tag[key] || '';
            return { key, value };
          })
          : []
      };
      setTags(transformedTags);

      console.log('Flow config from selectedFlow:', selectedFlow);

      let configData: ConfigItem[] = [{ key: '', value: '' }];

      if (selectedFlow?.flow_config?.length > 0) {
        const flowConfigData = selectedFlow.flow_config[0]?.flow_config;

        if (Array.isArray(flowConfigData) && flowConfigData.length > 0) {
          // Process each config item with more logging
          configData = flowConfigData.map((config: any) => {
            console.log('Processing config item:', config);

            // Handle case where config is already in the correct format
            if (config && typeof config === 'object' && 'key' in config && 'value' in config) {
              return {
                key: String(config.key),
                value: String(config.value)
              };
            }
            // Handle case where config is a key-value object
            else if (config && typeof config === 'object') {
              const keys = Object.keys(config);
              if (keys.length > 0) {
                const key = keys[0];
                return {
                  key: key,
                  value: String(config[key] || '')
                };
              }
            }

            // Default empty item if we couldn't process
            return { key: '', value: '' };
          }).filter((item: ConfigItem) => item.key !== '' || item.value !== '');

          // If all items were filtered out, add a default empty one
          if (configData.length === 0) {
            configData = [{ key: '', value: '' }];
          }
        }
      }
      setConfigs(configData);
    }
  }, [isOpen, selectedFlow]);

  const handleConfigChange = (index: number, field: 'key' | 'value', value: string) => {
    const newConfigs = [...configs];
    newConfigs[index][field] = value;
    setConfigs(newConfigs);
  };

  const addConfigRow = () => {
    setConfigs([...configs, { key: '', value: '' }]);
  };

  const removeConfigRow = (index: number) => {
    if (configs.length > 1) {
      const newConfigs = configs.filter((_, i) => i !== index);
      setConfigs(newConfigs);
    }
  };

  const handleSave = async () => {
    if (!selectedFlow?.flow_id) {
      console.error("No flow_id available in selectedFlow.");
      return;
    }

    setIsSaving(true);

    try {
      // Transform tags back to the format expected by the API
      const transformedTags = tags.tagList.map(tag => ({ [tag.key]: tag.value }));

      // Save general settings
      const settingsPayload = {
        notes,
        tags: { tagList: transformedTags },
      };

      await dispatch(patchFlowOperation({
        flowId: selectedFlow.flow_id,
        data: settingsPayload
      }));

      // Save configuration if we're on the configuration tab
      if (activeTab === "configuration") {
        const flow_config_id = selectedFlow?.flow_config?.[0]?.flow_config_id;
        if (flow_config_id) {
          // Log what we're saving
          console.log('Saving flow configuration:', configs);

          // Clean up the configs before saving - remove any empty entries
          const cleanedConfigs = configs.filter(config =>
            config.key.trim() !== '' || config.value.trim() !== ''
          );

          // Add a default empty config if all were removed
          const configsToSave = cleanedConfigs.length > 0 ?
            cleanedConfigs :
            [{ key: '', value: '' }];

          // Create the flow_config object and stringify it
          const flowConfigString = JSON.stringify({
            flow_config
              : { flow_config: configsToSave }
          });

          await dispatch(updateFlowConfiguration({
            flow_config_id,
            flow_config: flowConfigString
          }));
        }
      }

      // Close the modal after successful save
      setIsSaving(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Save failed:", error);
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 p-2 hover:bg-gray-100 rounded-full"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Flow Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent
        className="sm:max-w-[550px] bg-white/95 backdrop-blur-sm border-0 shadow-lg"
        aria-describedby="flowform"
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Flow Settings
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Configure your flow settings and add relevant tags
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex space-x-4 mb-6 p-1 rounded-lg">
            <TabsTrigger
              value="settings"
              className="px-4 py-2 rounded-md border border-gray-300 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black data-[state=focus]:outline-none data-[state=focus]:ring-2 data-[state=focus]:ring-gray-400"
            >
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="configuration"
              className="px-4 py-2 rounded-md border border-gray-300 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black data-[state=focus]:outline-none data-[state=focus]:ring-2 data-[state=focus]:ring-gray-400"
            >
              Configuration
            </TabsTrigger>
          </TabsList>

          <div className="min-h-[300px] max-h-[400px] overflow-y-auto">
            {/* Container to keep consistent height */}
            <TabsContent value="settings" className="mt-0 h-full">
              <div className="grid gap-6 py-4">
                <NotesSection
                  notes={notes}
                  showNotes={showNotes}
                  setShowNotes={setShowNotes}
                  setNotes={setNotes}
                />
                <div className="px-4 pt-2">
                  <TagInput tags={tags} setTags={setTags} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="configuration" className="mt-0 h-full">
              <ConfigurationSection
                configs={configs}
                onConfigChange={handleConfigChange}
                onAddConfig={addConfigRow}
                onRemoveConfig={removeConfigRow}
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="px-2 pb-1 flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            aria-label={isSaving ? 'Saving' : 'Save'}
            className="bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm disabled:bg-gray-400"
          >
            {isSaving ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};