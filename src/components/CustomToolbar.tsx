import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, CloudCog, Cloud, CloudOff, Edit, Link, Clock, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '@/contexts/FlowContext'
interface SettingsModalProps {
  isOpen: boolean;
  selectedData?: any | null;
  onClose: () => void;
}

interface CustomToolbarProps {
  selectedData?: any | null;
}

const SettingsModal = ({ isOpen, onClose, selectedData }: SettingsModalProps) => {
  const [notes, setNotes] = useState("")
  const [showNotes, setShowNotes] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project1">Project 1</SelectItem>
                  <SelectItem value="project2">Project 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" placeholder="Enter Branch" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select>
                <SelectTrigger id="environment">
                  <SelectValue placeholder="Select Environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">Development</SelectItem>
                  <SelectItem value="prod">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select>
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class1">Class 1</SelectItem>
                  <SelectItem value="class2">Class 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retries">No. Of Retries</Label>
              <Input id="retries" placeholder="Enter No. Of Retries" type="number" min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cluster">Default Cluster</Label>
              <Select>
                <SelectTrigger id="cluster">
                  <SelectValue placeholder="Select Cluster" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cluster1">Cluster 1</SelectItem>
                  <SelectItem value="cluster2">Cluster 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule</Label>
            <div className="relative">
              <Input id="schedule" placeholder="Schedule Interval" />
              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" aria-hidden="true" />
            </div>
          </div>
          <Button variant="link" className="justify-start px-0 text-blue-500" onClick={() => setShowNotes(!showNotes)}>
            {showNotes ? "Hide Notes ▲" : "Add Notes ▼"}
          </Button>
          {showNotes && (
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add your notes here"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Add Tags</Label>
            <p className="text-sm text-gray-500">Add one or more tags to easily identify compute instances created by bighammer.ai in your AWS account (Eg : Key : 'Product', Value : Bighammer.ai)</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CustomToolbarComponent(props: CustomToolbarProps) {
  const [isVisual, setIsVisual] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [flowType, setFlowType] = useState("Flow_type 1")
  const { autoSave, isSaved, isSaving, toggleAutoSave } = useFlow();

  const { selectedData } = props;
  const navigate = useNavigate();
  useEffect(() => {
    if (selectedData && selectedData?.flow_name) {
      setFlowType(() => selectedData?.flow_name);
    }
  }, [selectedData?.flow_name]);
  return (
    <div className="bg-[#F4F4F4] w-[100%]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card p-1 space-y-1 sm:space-y-0">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            variant="ghost" size="icon" aria-label="Go back" onClick={() => navigate("designers/manage-flow")}>
            <ChevronLeft className="h-6 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Cloud options" className="h-19 w-19"
            onClick={toggleAutoSave}>
            {isSaving ? (
              <CloudCog className="h-8 w-8 text-secondary animate-pulse" />
            ) : autoSave ? (
              isSaved ? (
                <Cloud className="h-8 w-8 text-secondary" />
              ) : (
                <CloudCog className="h-8 w-8 text-secondary" />
              )
            ) : (
              <CloudOff className="h-8 w-8 text-muted-foreground" />
            )}
          </Button>
          <div className="relative flex-grow sm:w-40">
            <Input
              type="text"
              className="pr-8"
              value={flowType}
              onChange={(e) => setFlowType(e.target.value)}
              aria-label="Flow type"
            />
            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2" aria-label="Edit flow type">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="secondary" className="flex items-center space-x-1">
            <span>Detach Cluster</span>
            <Link className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} aria-label="Open settings">
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
      <SettingsModal isOpen={isSettingsOpen} selectedData={selectedData} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
} 1