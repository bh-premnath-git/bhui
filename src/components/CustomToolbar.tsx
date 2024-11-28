import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useFlow } from '@/contexts/FlowContext';
import { getEnvironmentList, setSelectedEnv } from '@/redux/FlowSlice';
import { ChevronLeft, CloudSun, Cloud, CloudOff, Edit, Clock, Settings, PlusCircle, X, MoreVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from '@/components/ui/badge';

// Types
type Tag = {
  tagList: { key: string; value: string }[];
};

interface DropdownItem {
  id: string;
  label: string;
  action: string;
  isDestructive?: boolean;
}

// TagInput Component
const TagInput: React.FC<{
  tags: Tag;
  setTags: React.Dispatch<React.SetStateAction<Tag>>;
}> = ({ tags, setTags }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagKey, setTagKey] = useState("");
  const [tagValue, setTagValue] = useState("");

  const removeTag = (itemIndex: number) => {
    setTags(prevTags => ({
      tagList: prevTags.tagList.filter((_, index) => index !== itemIndex)
    }));
  };

  const addTag = () => {
    if (tagKey && tagValue) {
      setTags(prevTags => ({
        tagList: [...prevTags.tagList, { key: tagKey, value: tagValue }]
      }));
      setTagKey("");
      setTagValue("");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Add tags to help organize and identify your flows
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.tagList.map((item, index) => (
          <Badge key={index} variant="secondary" className="px-2 py-1 text-white">
            {`${item.key} >> ${item.value}`}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0"
              onClick={() => removeTag(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center text-emerald-500 hover:text-emerald-600 transition-colors duration-200"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            ADD TAG
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[385px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Tag</DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="tagKey" className="text-sm font-medium">
                Key
              </Label>
              <Input
                id="tagKey"
                value={tagKey}
                onChange={(e) => setTagKey(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="tagValue" className="text-sm font-medium">
                Value
              </Label>
              <Input
                id="tagValue"
                value={tagValue}
                onChange={(e) => setTagValue(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={addTag} className="w-full bg-black text-white hover:bg-gray-800">
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// SettingsSection Component
const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700">{title}</Label>
    {children}
  </div>
);

// SettingsModal Component
const SettingsModal = ({ isOpen, onClose, selectedData }: {
  isOpen: boolean;
  selectedData?: any;
  onClose: () => void;
}) => {
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [tags, setTags] = useState<Tag>({ tagList: [] });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Flow Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            <SettingsSection title="Environment">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">Development</SelectItem>
                  <SelectItem value="prod">Production</SelectItem>
                </SelectContent>
              </Select>
            </SettingsSection>
          </div>
          <SettingsSection title="Schedule">
            <div className="relative">
              <Input
                placeholder="Schedule Interval"
                className="w-full pr-10"
              />
              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </SettingsSection>

          <Button
            variant="ghost"
            className="justify-start px-0 text-blue-600 hover:text-blue-700 hover:bg-transparent"
            onClick={() => setShowNotes(!showNotes)}
          >
            {showNotes ? "Hide Notes ▲" : "Add Notes ▼"}
          </Button>

          {showNotes && (
            <SettingsSection title="Notes">
              <Textarea
                placeholder="Add your notes here"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </SettingsSection>
          )}

          <div className="space-y-2">
            <TagInput tags={tags} setTags={setTags} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            type="submit"
            className="bg-black hover:bg-blue-700 text-white"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main CustomToolbarComponent
export function CustomToolbarComponent({ selectedData }: { selectedData?: any }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [flowType, setFlowType] = useState("Flow_type 1");
  const [selectedEnvironment, setSelectedEnvironment] = useState("");
  const { autoSave, isSaved, isSaving, toggleAutoSave } = useFlow();
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

  // Dropdown items
  const menuItems: DropdownItem[] = [
    { id: '1', label: 'Export Flow', action: 'export' },
  ];

  const handleDropdownAction = (action: string) => {
    switch (action) {
      case 'export':
        console.log('Exporting flow...');
        break;
      default:
        console.log(`Unhandled action: ${action}`);
    }
  };

  const handleEnvironmentChange = (value: string) => {
    setSelectedEnvironment(value);
    dispatch(setSelectedEnv(value));
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

  const getCloudIcon = () => {
    if (isSaving) return <CloudSun className="h-9 w-9 text-blue-500 animate-pulse" />;
    if (autoSave) {
      return isSaved ?
        <Cloud className="h-9 w-9 text-blue-500" /> :
        <CloudSun className="h-9 w-9 text-blue-500" />;
    }
    return <CloudOff className="h-9 w-9 text-gray-400" />;
  };

  return (
    <div className="bg-white">
      <div className="max-w-screen-xl px-1 py-2">
        <div className="flex items-center justify-between gap-4">
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

            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100 rounded-full h-10 w-10 p-2"
                  >
                    <MoreVertical className="h-6 w-6 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  align="end"
                  sideOffset={5}
                  alignOffset={0}
                >
                  {menuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => handleDropdownAction(item.action)}
                      className={`${item.isDestructive ? "text-red-600" : ""} cursor-pointer`}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
}