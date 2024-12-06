import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { TagInput } from './TagInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch } from '@/redux/hooks';
import { patchFlowOperation } from '@/redux/FlowSlice';

// Types
interface Tag {
  tagList: { key: string; value: string }[];
}

interface ConfigItem {
  key: string;
  value: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedData?: any; // Ensure this has flow_id or whatever ID you need
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

// Main Settings Modal Component
export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, selectedData }) => {
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [tags, setTags] = useState<Tag>({ tagList: [] });
  const [activeTab, setActiveTab] = useState("settings");
  const [configs, setConfigs] = useState<ConfigItem[]>([{ key: '', value: '' }]);
  
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (selectedData) {
      setNotes(selectedData.notes || "");  
      setTags({
        tagList: Array.isArray(selectedData.tags?.tagList) ? selectedData.tags.tagList : []
      });
    }
  }, [selectedData]);

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
    if (!selectedData?.id) {
      console.error("No flow_id available in selectedData.");
      return;
    }

    const payload = {
      notes,
      tags: { tagList: tags.tagList },
    };

    try {
      await dispatch(patchFlowOperation({ flow_id: selectedData.id, data: payload }));
      onClose();
    } catch (error) {
      console.error("Patch failed:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-white/95 backdrop-blur-sm border-0 shadow-lg" aria-describedby="flowform">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Flow Settings
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configure your flow settings and add relevant tags
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-0">
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

          <TabsContent value="configuration" className="mt-0">
            <ConfigurationSection
              configs={configs}
              onConfigChange={handleConfigChange}
              onAddConfig={addConfigRow}
              onRemoveConfig={removeConfigRow}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSave}
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 shadow-sm"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
